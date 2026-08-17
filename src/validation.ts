// src/validation.ts — final manual-first input validation (Step 4)
//
// Validation distinguishes four outcome classes:
//   MISSING_REQUIRED     — field is mandatory and absent/invalid
//   INVALID_VALUE        — field present but value is out of range or wrong type
//   UNKNOWN_ACCEPTABLE   — field absent or set to a "don't know" value;
//                          analysis can proceed but with reduced confidence
//   PREVENTS_CALCULATION — field pattern means defensible savings CANNOT be
//                          calculated, but the analysis is not rejected outright

import type {
  UserInput,
  ProductInput,
} from './types.js';
import {
  UsageRating,
  RequirementStatus,
  ReplacementOption,
  DependencyFlag,
  DiscountStatus,
  BundleStructure,
  TierChangedFlag,
} from './types.js';
import { getProduct } from './products.js';

// ── Validation error types ────────────────────────────────────────────────────

export type ValidationSeverity =
  | 'MISSING_REQUIRED'
  | 'INVALID_VALUE'
  | 'UNKNOWN_ACCEPTABLE'
  | 'PREVENTS_CALCULATION';

export interface ValidationError {
  field: string;
  severity: ValidationSeverity;
  message: string;
}

export interface ValidationResult {
  valid: boolean;             // false only when MISSING_REQUIRED or INVALID_VALUE errors exist
  can_calculate: boolean;     // false when PREVENTS_CALCULATION errors exist (but valid may be true)
  errors: ValidationError[];
  warnings: ValidationError[];  // UNKNOWN_ACCEPTABLE and PREVENTS_CALCULATION items
}

// ── Allowed enum value sets ───────────────────────────────────────────────────

const VALID_CONTRACT_TERMS = new Set<string>(['annual', 'multi_year', 'other']);
const VALID_USAGE = new Set<string>(Object.values(UsageRating));
const VALID_REQUIREMENT = new Set<string>(Object.values(RequirementStatus));
const VALID_REPLACEMENT = new Set<string>(Object.values(ReplacementOption));
const VALID_DEPENDENCY = new Set<string>(Object.values(DependencyFlag));
const VALID_DISCOUNT_STATUS = new Set<string>(Object.values(DiscountStatus));
const VALID_BUNDLE = new Set<string>(Object.values(BundleStructure));
const VALID_TIER_CHANGED = new Set<string>(Object.values(TierChangedFlag));
const VALID_RATE_PROTECTION = new Set<string>(['active', 'unclear', 'none']);
const VALID_CONSTRUCTION_TYPE = new Set<string>(['commercial', 'industrial', 'civil_infrastructure', 'other']);
const VALID_TARGET_SAVINGS = new Set<number | null>([5, 10, 15, 20, null]);

// ── Helper builders ───────────────────────────────────────────────────────────

function required(field: string, message: string): ValidationError {
  return { field, severity: 'MISSING_REQUIRED', message };
}
function invalid(field: string, message: string): ValidationError {
  return { field, severity: 'INVALID_VALUE', message };
}
function unknown(field: string, message: string): ValidationError {
  return { field, severity: 'UNKNOWN_ACCEPTABLE', message };
}
function preventsCalc(field: string, message: string): ValidationError {
  return { field, severity: 'PREVENTS_CALCULATION', message };
}

// ── Main validation function ───────────────────────────────────────────────────

export function validateUserInput(input: unknown): ValidationResult {
  const hardErrors: ValidationError[] = [];
  const softWarnings: ValidationError[] = [];

  if (typeof input !== 'object' || input === null) {
    return {
      valid: false,
      can_calculate: false,
      errors: [required('root', 'Input must be a non-null object')],
      warnings: [],
    };
  }

  const u = input as Record<string, unknown>;

  // ── REQUIRED: commercial baseline ──────────────────────────────────────────

  if (typeof u.annual_cost_usd !== 'number' || u.annual_cost_usd <= 0) {
    hardErrors.push(required('annual_cost_usd', 'Must be a positive number'));
  }

  if (typeof u.acv_usd !== 'number' || u.acv_usd <= 0) {
    hardErrors.push(required('acv_usd', 'Must be a positive number'));
  }

  // products: flat string array — must be non-empty and contain only known catalog ids
  if (!Array.isArray(u.products) || u.products.length === 0) {
    hardErrors.push(required('products', 'Must be a non-empty array of product IDs from the catalog'));
  } else {
    const prods = u.products as unknown[];
    for (let i = 0; i < prods.length; i++) {
      if (typeof prods[i] !== 'string') {
        hardErrors.push(invalid(`products[${i}]`, 'Each product ID must be a string'));
      } else if (!getProduct(prods[i] as string)) {
        hardErrors.push(invalid(`products[${i}]`, `Unknown product ID "${prods[i]}". Use a catalog ID from products.ts`));
      }
    }
  }

  // contract_term: accept the spec values plus 'other' (maps to uncertain)
  if (!VALID_CONTRACT_TERMS.has(u.contract_term as string)) {
    hardErrors.push(invalid('contract_term', 'Must be "annual", "multi_year", or "other"'));
  }

  // ── REQUIRED: product-level structured inputs (product_inputs) ──────────────
  // Required when product_inputs is present; each entry is validated fully.
  // Absence of product_inputs is allowed (older/simple paths); treated as
  // UNKNOWN_ACCEPTABLE so the engine can still do benchmark/commercial rules.

  if (u.product_inputs !== undefined) {
    if (!Array.isArray(u.product_inputs)) {
      hardErrors.push(invalid('product_inputs', 'Must be an array'));
    } else {
      const pi = u.product_inputs as unknown[];
      if (pi.length === 0) {
        hardErrors.push(required('product_inputs', 'Must be non-empty when provided'));
      }
      for (let i = 0; i < pi.length; i++) {
        validateProductInput(pi[i], i, hardErrors, softWarnings);
      }
    }
  } else {
    softWarnings.push(
      unknown('product_inputs',
        'No per-product usage/requirement/dependency information provided. ' +
        'Analysis will be limited to benchmarking and commercial-structure rules; ' +
        'candidate generation and savings classification require product_inputs.')
    );
  }

  // ── RECOMMENDED: discount ──────────────────────────────────────────────────

  if (u.discount_status !== undefined) {
    if (!VALID_DISCOUNT_STATUS.has(u.discount_status as string)) {
      hardErrors.push(invalid('discount_status', `Must be one of: ${[...VALID_DISCOUNT_STATUS].join(', ')}`));
    } else {
      if (u.discount_status === DiscountStatus.DONT_KNOW) {
        softWarnings.push(
          preventsCalc('discount_status',
            'Discount is unknown. Any savings estimate that depends on the current discount surviving a reconfiguration cannot be defended.')
        );
      }
      if (u.discount_status === DiscountStatus.PCT_KNOWN) {
        if (typeof u.discount_pct !== 'number' || u.discount_pct < 0 || u.discount_pct > 100) {
          hardErrors.push(invalid('discount_pct', 'Must be a number between 0 and 100 when discount_status is PCT_KNOWN'));
        }
      }
      if (u.discount_status === DiscountStatus.USD_KNOWN) {
        if (typeof u.discount_usd !== 'number' || u.discount_usd < 0) {
          hardErrors.push(invalid('discount_usd', 'Must be a non-negative number when discount_status is USD_KNOWN'));
        }
      }
    }
  } else {
    softWarnings.push(unknown('discount_status', 'Discount status not provided. Analysis will treat discount as unknown.'));
  }

  // ── RECOMMENDED: bundle/pool structure ────────────────────────────────────

  if (u.bundle_structure !== undefined) {
    if (!VALID_BUNDLE.has(u.bundle_structure as string)) {
      hardErrors.push(invalid('bundle_structure', `Must be one of: ${[...VALID_BUNDLE].join(', ')}`));
    } else if (
      u.bundle_structure === BundleStructure.BUNDLED ||
      u.bundle_structure === BundleStructure.POOLED
    ) {
      softWarnings.push(
        preventsCalc('bundle_structure',
          'Contract uses a bundled/pooled structure. Line-item removal does not automatically reduce total renewal by that amount.')
      );
    }
  } else {
    softWarnings.push(unknown('bundle_structure', 'Bundle/pool structure not provided. Analysis will treat as unknown.'));
  }

  // ── RECOMMENDED: credits ──────────────────────────────────────────────────

  if (u.credits_usd !== undefined) {
    if (typeof u.credits_usd !== 'number' || u.credits_usd < 0) {
      hardErrors.push(invalid('credits_usd', 'Must be a non-negative number'));
    }
  }

  // ── RECOMMENDED: renewal signals ─────────────────────────────────────────

  if (u.renewal_increase_pct !== undefined) {
    if (typeof u.renewal_increase_pct !== 'number' || u.renewal_increase_pct < 0) {
      hardErrors.push(invalid('renewal_increase_pct', 'Must be a non-negative number'));
    }
  }

  if (u.tier_changed !== undefined && !VALID_TIER_CHANGED.has(u.tier_changed as string)) {
    hardErrors.push(invalid('tier_changed', `Must be one of: ${[...VALID_TIER_CHANGED].join(', ')}`));
  }

  if (u.packaging_changed !== undefined && !VALID_TIER_CHANGED.has(u.packaging_changed as string)) {
    hardErrors.push(invalid('packaging_changed', `Must be one of: ${[...VALID_TIER_CHANGED].join(', ')}`));
  }

  if (u.rate_protection_status !== undefined && !VALID_RATE_PROTECTION.has(u.rate_protection_status as string)) {
    hardErrors.push(invalid('rate_protection_status', 'Must be "active", "unclear", or "none"'));
  }

  if (u.expected_next_year_acv_usd !== undefined) {
    if (typeof u.expected_next_year_acv_usd !== 'number' || u.expected_next_year_acv_usd <= 0) {
      hardErrors.push(invalid('expected_next_year_acv_usd', 'Must be a positive number'));
    } else if (typeof u.acv_usd === 'number' && u.expected_next_year_acv_usd < u.acv_usd) {
      hardErrors.push(invalid('expected_next_year_acv_usd', 'Must be greater than or equal to current ACV'));
    }
  }

  // ── OPTIONAL: goal / profile ──────────────────────────────────────────────

  if (u.target_savings_pct !== undefined && u.target_savings_pct !== null) {
    if (!VALID_TARGET_SAVINGS.has(u.target_savings_pct as number)) {
      hardErrors.push(invalid('target_savings_pct', 'Must be 5, 10, 15, 20, or null'));
    }
  }

  if (u.construction_type !== undefined && !VALID_CONSTRUCTION_TYPE.has(u.construction_type as string)) {
    hardErrors.push(invalid('construction_type', `Must be one of: ${[...VALID_CONSTRUCTION_TYPE].join(', ')}`));
  }

  // ── OPTIONAL: before/after quote evidence ─────────────────────────────────

  if (u.before_annual_cost_usd !== undefined) {
    if (typeof u.before_annual_cost_usd !== 'number' || u.before_annual_cost_usd <= 0) {
      hardErrors.push(invalid('before_annual_cost_usd', 'Must be a positive number'));
    }
  }

  if (u.after_annual_cost_usd !== undefined) {
    if (typeof u.after_annual_cost_usd !== 'number' || u.after_annual_cost_usd <= 0) {
      hardErrors.push(invalid('after_annual_cost_usd', 'Must be a positive number'));
    }
  }

  // ── OPTIONAL: legacy ──────────────────────────────────────────────────────

  if (u.prior_rate_per_1m_usd !== undefined) {
    if (typeof u.prior_rate_per_1m_usd !== 'number' || u.prior_rate_per_1m_usd <= 0) {
      hardErrors.push(invalid('prior_rate_per_1m_usd', 'Must be a positive number'));
    }
  }

  const preventsCalcItems = softWarnings.filter((w) => w.severity === 'PREVENTS_CALCULATION');
  return {
    valid: hardErrors.length === 0,
    can_calculate: hardErrors.length === 0 && preventsCalcItems.length === 0,
    errors: hardErrors,
    warnings: softWarnings,
  };
}

// ── Per-product input validation ──────────────────────────────────────────────

function validateProductInput(
  raw: unknown,
  index: number,
  hardErrors: ValidationError[],
  softWarnings: ValidationError[],
): void {
  const prefix = `product_inputs[${index}]`;

  if (typeof raw !== 'object' || raw === null) {
    hardErrors.push(invalid(prefix, 'Each product input must be an object'));
    return;
  }

  const p = raw as Record<string, unknown>;

  // product_id — must be a known catalog id
  if (typeof p.product_id !== 'string' || p.product_id.trim() === '') {
    hardErrors.push(required(`${prefix}.product_id`, 'Must be a non-empty string'));
  } else if (!getProduct(p.product_id)) {
    hardErrors.push(invalid(`${prefix}.product_id`, `Unknown product ID "${p.product_id}". Use a catalog ID from products.ts`));
  }

  // usage — required for candidate generation
  if (!VALID_USAGE.has(p.usage as string)) {
    hardErrors.push(required(`${prefix}.usage`, `Must be one of: ${[...VALID_USAGE].join(', ')}`));
  } else if (p.usage === UsageRating.NOT_SURE) {
    softWarnings.push(unknown(`${prefix}.usage`, 'Usage is not sure; candidate eligibility may be uncertain'));
  }

  // requirement — required for eligibility check
  if (!VALID_REQUIREMENT.has(p.requirement as string)) {
    hardErrors.push(required(`${prefix}.requirement`, `Must be one of: ${[...VALID_REQUIREMENT].join(', ')}`));
  } else if (p.requirement === RequirementStatus.NOT_SURE) {
    softWarnings.push(unknown(`${prefix}.requirement`, 'Requirement status is uncertain; candidate removal cannot be confirmed safe'));
  }

  // replacement — recommended; missing or NOT_SURE reduces confidence
  if (p.replacement === undefined) {
    softWarnings.push(unknown(`${prefix}.replacement`, 'Replacement workflow not provided'));
  } else if (!VALID_REPLACEMENT.has(p.replacement as string)) {
    hardErrors.push(invalid(`${prefix}.replacement`, `Must be one of: ${[...VALID_REPLACEMENT].join(', ')}`));
  } else if (p.replacement === ReplacementOption.NOT_SURE) {
    softWarnings.push(unknown(`${prefix}.replacement`, 'Replacement workflow is not sure'));
  } else if (p.replacement === ReplacementOption.NO_REPLACEMENT) {
    softWarnings.push(
      preventsCalc(`${prefix}.replacement`,
        'No replacement exists for this capability. Removal may have operational impact.')
    );
  }

  // dependency — recommended
  if (p.dependency === undefined) {
    softWarnings.push(unknown(`${prefix}.dependency`, 'Dependency status not provided'));
  } else if (!VALID_DEPENDENCY.has(p.dependency as string)) {
    hardErrors.push(invalid(`${prefix}.dependency`, `Must be one of: ${[...VALID_DEPENDENCY].join(', ')}`));
  } else if (p.dependency === DependencyFlag.NOT_SURE) {
    softWarnings.push(
      preventsCalc(`${prefix}.dependency`,
        'Dependency is unconfirmed. Candidate cannot advance to counterfactual pricing until resolved.')
    );
  }

  // annual_price_usd — optional; if present must be positive
  if (p.annual_price_usd !== undefined) {
    if (typeof p.annual_price_usd !== 'number' || p.annual_price_usd <= 0) {
      hardErrors.push(invalid(`${prefix}.annual_price_usd`, 'Must be a positive number when provided'));
    }
  } else {
    softWarnings.push(unknown(`${prefix}.annual_price_usd`, 'No line-item price provided; attributable spend cannot be reported'));
  }
}

// ── Assert helper (throws on hard errors, used by engine) ─────────────────────

export function assertUserInput(input: unknown): UserInput {
  const result = validateUserInput(input);
  if (!result.valid) {
    throw new Error(
      `Invalid UserInput: ${result.errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`
    );
  }
  return input as UserInput;
}
