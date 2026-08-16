// tests/validation.test.ts — Step 4: final manual-first input schema validation
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateUserInput } from '../src/validation.js';
import {
  UsageRating,
  RequirementStatus,
  ReplacementOption,
  DependencyFlag,
  DiscountStatus,
  BundleStructure,
  TierChangedFlag,
} from '../src/types.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function minValid(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    annual_cost_usd: 100000,
    acv_usd: 50_000_000,
    products: ['project_management'],
    contract_term: 'annual',
    ...overrides,
  };
}

function minProductInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    product_id: 'quality_safety',
    usage: UsageRating.RARELY,
    requirement: RequirementStatus.NOT_REQUIRED,
    replacement: ReplacementOption.ANOTHER_TOOL,
    dependency: DependencyFlag.NO,
    ...overrides,
  };
}

// ── REQUIRED fields ─────────────────────────────────────────────────────────

describe('required fields', () => {
  it('accepts a minimal valid input', () => {
    const r = validateUserInput(minValid());
    assert.equal(r.valid, true);
    assert.equal(r.errors.length, 0);
  });

  it('rejects null input', () => {
    const r = validateUserInput(null);
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'root'));
  });

  it('rejects missing annual_cost_usd', () => {
    const { annual_cost_usd: _, ...rest } = minValid() as Record<string, unknown>;
    const r = validateUserInput(rest);
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'annual_cost_usd' && e.severity === 'MISSING_REQUIRED'));
  });

  it('rejects zero annual_cost_usd', () => {
    const r = validateUserInput(minValid({ annual_cost_usd: 0 }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'annual_cost_usd'));
  });

  it('rejects missing acv_usd', () => {
    const { acv_usd: _, ...rest } = minValid() as Record<string, unknown>;
    const r = validateUserInput(rest);
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'acv_usd' && e.severity === 'MISSING_REQUIRED'));
  });

  it('rejects empty products array', () => {
    const r = validateUserInput(minValid({ products: [] }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'products'));
  });

  it('rejects unknown product ID', () => {
    const r = validateUserInput(minValid({ products: ['not_a_real_product'] }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'products[0]' && e.severity === 'INVALID_VALUE'));
  });

  it('accepts all valid catalog product IDs', () => {
    const ids = [
      'project_management', 'quality_safety', 'project_financials',
      'invoice_management', 'analytics', 'pay', 'resource_tracking',
      'estimating', 'bid_management', 'field_productivity',
    ];
    for (const id of ids) {
      const r = validateUserInput(minValid({ products: [id] }));
      assert.equal(r.valid, true, `Expected valid for product ID: ${id}`);
    }
  });

  it('rejects invalid contract_term', () => {
    const r = validateUserInput(minValid({ contract_term: 'monthly' }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'contract_term' && e.severity === 'INVALID_VALUE'));
  });

  it('accepts contract_term "other"', () => {
    const r = validateUserInput(minValid({ contract_term: 'other' }));
    assert.equal(r.valid, true);
  });
});

// ── valid/invalid returns result classification ───────────────────────────────

describe('ValidationResult structure', () => {
  it('valid + no prevents_calculation warnings → can_calculate is true', () => {
    const r = validateUserInput(minValid());
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, true);
  });

  it('valid input with DONT_KNOW discount → valid true but can_calculate false', () => {
    const r = validateUserInput(minValid({ discount_status: DiscountStatus.DONT_KNOW }));
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, false);
    assert.ok(r.warnings.some((w) => w.severity === 'PREVENTS_CALCULATION' && w.field === 'discount_status'));
  });

  it('valid input with BUNDLED structure → can_calculate false', () => {
    const r = validateUserInput(minValid({ bundle_structure: BundleStructure.BUNDLED }));
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, false);
    assert.ok(r.warnings.some((w) => w.severity === 'PREVENTS_CALCULATION' && w.field === 'bundle_structure'));
  });

  it('valid input with POOLED structure → can_calculate false', () => {
    const r = validateUserInput(minValid({ bundle_structure: BundleStructure.POOLED }));
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, false);
  });

  it('invalid input → valid false regardless of warnings', () => {
    const r = validateUserInput(minValid({ annual_cost_usd: -1 }));
    assert.equal(r.valid, false);
  });
});

// ── UNKNOWN_ACCEPTABLE warnings ───────────────────────────────────────────────

describe('UNKNOWN_ACCEPTABLE warnings', () => {
  it('warns when product_inputs is absent', () => {
    const r = validateUserInput(minValid());
    assert.ok(r.warnings.some((w) => w.field === 'product_inputs' && w.severity === 'UNKNOWN_ACCEPTABLE'));
  });

  it('warns when discount_status is absent', () => {
    const r = validateUserInput(minValid());
    assert.ok(r.warnings.some((w) => w.field === 'discount_status' && w.severity === 'UNKNOWN_ACCEPTABLE'));
  });

  it('warns when bundle_structure is absent', () => {
    const r = validateUserInput(minValid());
    assert.ok(r.warnings.some((w) => w.field === 'bundle_structure' && w.severity === 'UNKNOWN_ACCEPTABLE'));
  });

  it('valid stays true even when multiple UNKNOWN_ACCEPTABLE warnings exist', () => {
    const r = validateUserInput(minValid());
    assert.equal(r.valid, true);
    assert.ok(r.warnings.length > 0);
  });
});

// ── product_inputs validation ─────────────────────────────────────────────────

describe('product_inputs validation', () => {
  it('accepts a valid product_inputs array', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput()],
    }));
    assert.equal(r.valid, true);
  });

  it('rejects an empty product_inputs array when provided', () => {
    const r = validateUserInput(minValid({ product_inputs: [] }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'product_inputs'));
  });

  it('rejects a product_input with an unknown product_id', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ product_id: 'not_real' })],
    }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field.includes('product_id') && e.severity === 'INVALID_VALUE'));
  });

  it('rejects an invalid usage value', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ usage: 'DAILY' })],
    }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field.includes('usage') && e.severity === 'MISSING_REQUIRED'));
  });

  it('rejects an invalid requirement value', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ requirement: 'MAYBE' })],
    }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field.includes('requirement')));
  });

  it('rejects an invalid replacement value', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ replacement: 'OUTSOURCE' })],
    }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field.includes('replacement') && e.severity === 'INVALID_VALUE'));
  });

  it('warns when usage is NOT_SURE', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ usage: UsageRating.NOT_SURE })],
    }));
    assert.equal(r.valid, true);
    assert.ok(r.warnings.some((w) => w.field.includes('usage') && w.severity === 'UNKNOWN_ACCEPTABLE'));
  });

  it('warns when requirement is NOT_SURE', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ requirement: RequirementStatus.NOT_SURE })],
    }));
    assert.equal(r.valid, true);
    assert.ok(r.warnings.some((w) => w.field.includes('requirement') && w.severity === 'UNKNOWN_ACCEPTABLE'));
  });

  it('emits PREVENTS_CALCULATION when dependency is NOT_SURE', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ dependency: DependencyFlag.NOT_SURE })],
    }));
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, false);
    assert.ok(r.warnings.some((w) => w.field.includes('dependency') && w.severity === 'PREVENTS_CALCULATION'));
  });

  it('emits PREVENTS_CALCULATION when replacement is NO_REPLACEMENT', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ replacement: ReplacementOption.NO_REPLACEMENT })],
    }));
    assert.equal(r.valid, true);
    assert.ok(r.warnings.some((w) => w.field.includes('replacement') && w.severity === 'PREVENTS_CALCULATION'));
  });

  it('warns when annual_price_usd is absent (line-item spend unknown)', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ annual_price_usd: undefined })],
    }));
    assert.equal(r.valid, true);
    assert.ok(r.warnings.some((w) => w.field.includes('annual_price_usd') && w.severity === 'UNKNOWN_ACCEPTABLE'));
  });

  it('rejects negative annual_price_usd', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ annual_price_usd: -100 })],
    }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field.includes('annual_price_usd') && e.severity === 'INVALID_VALUE'));
  });

  it('accepts annual_price_usd when provided and positive', () => {
    const r = validateUserInput(minValid({
      product_inputs: [minProductInput({ annual_price_usd: 16945 })],
    }));
    assert.equal(r.valid, true);
  });
});

// ── discount validation ────────────────────────────────────────────────────────

describe('discount validation', () => {
  it('accepts PCT_KNOWN with valid discount_pct', () => {
    const r = validateUserInput(minValid({
      discount_status: DiscountStatus.PCT_KNOWN,
      discount_pct: 15,
    }));
    assert.equal(r.valid, true);
  });

  it('rejects PCT_KNOWN without discount_pct', () => {
    const r = validateUserInput(minValid({ discount_status: DiscountStatus.PCT_KNOWN }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'discount_pct'));
  });

  it('rejects PCT_KNOWN with discount_pct > 100', () => {
    const r = validateUserInput(minValid({ discount_status: DiscountStatus.PCT_KNOWN, discount_pct: 110 }));
    assert.equal(r.valid, false);
  });

  it('accepts USD_KNOWN with valid discount_usd', () => {
    const r = validateUserInput(minValid({
      discount_status: DiscountStatus.USD_KNOWN,
      discount_usd: 5000,
    }));
    assert.equal(r.valid, true);
  });

  it('rejects USD_KNOWN without discount_usd', () => {
    const r = validateUserInput(minValid({ discount_status: DiscountStatus.USD_KNOWN }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'discount_usd'));
  });

  it('rejects invalid discount_status string', () => {
    const r = validateUserInput(minValid({ discount_status: 'HALF_OFF' }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'discount_status'));
  });
});

// ── renewal / optional fields ─────────────────────────────────────────────────

describe('renewal and optional field validation', () => {
  it('rejects negative renewal_increase_pct', () => {
    const r = validateUserInput(minValid({ renewal_increase_pct: -1 }));
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => e.field === 'renewal_increase_pct'));
  });

  it('accepts renewal_increase_pct of 0', () => {
    const r = validateUserInput(minValid({ renewal_increase_pct: 0 }));
    assert.equal(r.valid, true);
  });

  it('rejects invalid tier_changed value', () => {
    const r = validateUserInput(minValid({ tier_changed: 'MAYBE' }));
    assert.equal(r.valid, false);
  });

  it('accepts valid TierChangedFlag values', () => {
    for (const v of Object.values(TierChangedFlag)) {
      const r = validateUserInput(minValid({ tier_changed: v }));
      assert.equal(r.valid, true, `Expected valid for tier_changed: ${v}`);
    }
  });

  it('rejects invalid rate_protection_status', () => {
    const r = validateUserInput(minValid({ rate_protection_status: 'maybe' }));
    assert.equal(r.valid, false);
  });

  it('accepts valid rate_protection_status values', () => {
    for (const v of ['active', 'unclear', 'none']) {
      const r = validateUserInput(minValid({ rate_protection_status: v }));
      assert.equal(r.valid, true, `Expected valid for rate_protection_status: ${v}`);
    }
  });

  it('rejects invalid target_savings_pct', () => {
    const r = validateUserInput(minValid({ target_savings_pct: 7 }));
    assert.equal(r.valid, false);
  });

  it('accepts null target_savings_pct', () => {
    const r = validateUserInput(minValid({ target_savings_pct: null }));
    assert.equal(r.valid, true);
  });

  it('accepts target_savings_pct of 10', () => {
    const r = validateUserInput(minValid({ target_savings_pct: 10 }));
    assert.equal(r.valid, true);
  });

  it('rejects invalid construction_type', () => {
    const r = validateUserInput(minValid({ construction_type: 'residential' }));
    assert.equal(r.valid, false);
  });

  it('accepts valid construction types', () => {
    for (const v of ['commercial', 'industrial', 'civil_infrastructure', 'other']) {
      const r = validateUserInput(minValid({ construction_type: v }));
      assert.equal(r.valid, true, `Expected valid for construction_type: ${v}`);
    }
  });

  it('rejects negative before_annual_cost_usd', () => {
    const r = validateUserInput(minValid({ before_annual_cost_usd: 0 }));
    assert.equal(r.valid, false);
  });

  it('rejects negative credits_usd', () => {
    const r = validateUserInput(minValid({ credits_usd: -500 }));
    assert.equal(r.valid, false);
  });

  it('accepts credits_usd of 0', () => {
    const r = validateUserInput(minValid({ credits_usd: 0 }));
    assert.equal(r.valid, true);
  });
});

// ── analysis-possible-but-not-quantifiable behavior ───────────────────────────

describe('analysis possible but savings not quantifiable', () => {
  it('does not reject analysis when product_inputs is absent — just warns', () => {
    const r = validateUserInput(minValid());
    assert.equal(r.valid, true, 'Should still be valid without product_inputs');
    assert.ok(r.warnings.some((w) => w.field === 'product_inputs'));
  });

  it('T8: discount DONT_KNOW yields valid analysis with can_calculate false', () => {
    const r = validateUserInput(minValid({
      discount_status: DiscountStatus.DONT_KNOW,
      product_inputs: [minProductInput()],
    }));
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, false);
  });

  it('BUNDLED structure with full product info: valid but cannot calculate savings', () => {
    const r = validateUserInput(minValid({
      bundle_structure: BundleStructure.BUNDLED,
      product_inputs: [minProductInput()],
    }));
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, false);
  });

  it('all-known input with product_inputs → valid and can_calculate', () => {
    const r = validateUserInput({
      annual_cost_usd: 147596,
      acv_usd: 80_000_000,
      products: ['invoice_management'],
      contract_term: 'annual',
      discount_status: DiscountStatus.PCT_KNOWN,
      discount_pct: 10,
      bundle_structure: BundleStructure.STANDARD,
      product_inputs: [{
        product_id: 'invoice_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO,
        annual_price_usd: 16945,
      }],
    });
    assert.equal(r.valid, true);
    assert.equal(r.can_calculate, true);
  });
});
