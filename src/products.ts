// src/products.ts — product/capability/dependency model (§11–§12 of implementation spec)
//
// Source of truth: PROCORE_RENEWAL_OPTIMIZER_PRODUCT_AND_INPUT_DATA.json (product_catalog)
// and PROCORE_RENEWAL_OPTIMIZER_RULES_AND_TESTS.json (dependency_rules).
// Do not add products or dependency relationships beyond what those files establish.

import type { RequirementStatus, DependencyFlag, CandidateEligibility, PricingBasis } from './types.js';
import { ProductCategory, DependencyRelationType } from './types.js';

// ── Tool / workflow (sits under a commercial product) ──────────────────────

export interface ToolWorkflow {
  id: string;
  label: string;
}

// ── Commercial product definition ───────────────────────────────────────────

export interface ProductDefinition {
  id: string;
  label: string;
  category: ProductCategory;
  capabilities: ToolWorkflow[];
  /** true = fully supported in MVP, 'conditional' = supported only under documented constraints */
  mvp_supported: boolean | 'conditional';
  pricing_basis: PricingBasis;
  /** Guard text from the source catalog — carried verbatim for traceability */
  guard: string;
}

function tool(id: string, label: string): ToolWorkflow {
  return { id, label };
}

// ── Product catalog ──────────────────────────────────────────────────────────
// Transcribed from PROCORE_RENEWAL_OPTIMIZER_PRODUCT_AND_INPUT_DATA.json → product_catalog.

export const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    id: 'project_management',
    label: 'Project Management',
    category: ProductCategory.UNCATEGORIZED, // source does not state an explicit top-level category
    capabilities: [
      tool('rfis', 'RFIs'),
      tool('submittals', 'Submittals'),
      tool('schedule', 'Schedule'),
      tool('punch_list', 'Punch List'),
      tool('documents', 'Documents'),
      tool('photos_videos', 'Photos & Videos'),
    ],
    mvp_supported: true,
    pricing_basis: 'acv',
    guard: 'Do not treat every tool as a separately priced product.',
  },
  {
    id: 'quality_safety',
    label: 'Quality & Safety',
    category: ProductCategory.UNCATEGORIZED, // commercially marketed product; tools organized under PM in navigation
    capabilities: [
      tool('inspections', 'Inspections'),
      tool('incidents', 'Incidents'),
      tool('observations', 'Observations'),
      tool('deficiency_list', 'Deficiency List'),
      tool('daily_log', 'Daily Log'),
      tool('forms', 'Forms'),
    ],
    mvp_supported: true,
    pricing_basis: 'acv',
    guard: 'Commercial product/category/tool hierarchy must stay separate.',
  },
  {
    id: 'project_financials',
    label: 'Project Financials',
    category: ProductCategory.FINANCIAL_MANAGEMENT,
    capabilities: [
      tool('budgets', 'Budgets'),
      tool('cost_management', 'Cost Management'),
      tool('financial_workflows', 'Financial Workflows'),
    ],
    mvp_supported: true,
    pricing_basis: 'acv',
    guard: 'Flag ERP/accounting integrations before removal.',
  },
  {
    id: 'invoice_management',
    label: 'Invoice Management',
    category: ProductCategory.FINANCIAL_MANAGEMENT,
    capabilities: [
      tool('invoice_workflows', 'Invoice Workflows'),
      tool('billing', 'Billing'),
    ],
    mvp_supported: true,
    pricing_basis: 'acv',
    guard: 'Line-item spend is not automatically removal savings.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    category: ProductCategory.UNCATEGORIZED, // source does not state an explicit top-level category
    capabilities: [
      tool('reporting', 'Reporting'),
      tool('dashboards', 'Dashboards'),
      tool('unified_data', 'Unified Data'),
    ],
    mvp_supported: true,
    pricing_basis: 'acv',
    guard: 'Do not infer operational-module dependency from analytics alone.',
  },
  {
    id: 'pay',
    label: 'Pay',
    category: ProductCategory.FINANCIAL_MANAGEMENT,
    capabilities: [
      tool('subcontractor_payments', 'Subcontractor Payments'),
      tool('compliance', 'Compliance'),
      tool('lien_waiver_workflows', 'Lien-Waiver Workflows'),
    ],
    mvp_supported: true,
    pricing_basis: 'unknown',
    guard: 'Use UNKNOWN where counterfactual pricing is unsupported.',
  },
  {
    id: 'resource_tracking',
    label: 'Resource Tracking',
    category: ProductCategory.RESOURCE_MANAGEMENT,
    capabilities: [
      tool('labor_tracking', 'Labor Tracking'),
      tool('productivity_tracking', 'Productivity Tracking'),
      tool('resource_tracking', 'Resource Tracking'),
    ],
    mvp_supported: true,
    pricing_basis: 'unknown',
    guard: 'Do not apply ACV formula to FTE-priced products without evidence.',
  },
  {
    id: 'estimating',
    label: 'Estimating',
    category: ProductCategory.PRECONSTRUCTION,
    capabilities: [
      tool('estimating', 'Estimating'),
      tool('takeoff', 'Takeoff'),
    ],
    mvp_supported: true,
    pricing_basis: 'unknown',
    guard: 'Validate industry/product eligibility.',
  },
  {
    id: 'bid_management',
    label: 'Bid Management',
    category: ProductCategory.PRECONSTRUCTION,
    capabilities: [
      tool('bid_distribution', 'Bid Distribution'),
      tool('bid_collection', 'Bid Collection'),
      tool('bid_coverage', 'Bid Coverage'),
    ],
    mvp_supported: true,
    pricing_basis: 'unknown',
    guard: 'Validate industry/product eligibility.',
  },
  {
    id: 'field_productivity',
    label: 'Field Productivity',
    category: ProductCategory.RESOURCE_MANAGEMENT,
    capabilities: [
      tool('field_productivity_tracking', 'Field Productivity Tracking'),
    ],
    mvp_supported: 'conditional',
    pricing_basis: 'fte',
    guard: 'Do not calculate with ACV pricing logic unless contract evidence supports it.',
  },
  {
    id: 'other',
    label: 'Other Procore capabilities',
    category: ProductCategory.UNCATEGORIZED,
    capabilities: [],
    mvp_supported: 'conditional',
    pricing_basis: 'unknown',
    guard: 'If evidence is insufficient, return UNKNOWN rather than inventing.',
  },
];

export function getProduct(id: string): ProductDefinition | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}

export function getAllProducts(): ProductDefinition[] {
  return PRODUCT_CATALOG;
}

// ── Dependency rules ──────────────────────────────────────────────────────────
// Transcribed from PROCORE_RENEWAL_OPTIMIZER_RULES_AND_TESTS.json → dependency_rules.
// '*' as source_product_id means "any product" (the business-dependency catch-all).

export interface DependencyRule {
  source_product_id: string;
  /** Tool id within the source product's capabilities, or a free-form label for
   *  relationships that are not a catalogued tool (e.g. an ERP integration). */
  dependent_id: string;
  dependent_label: string;
  relation_type: DependencyRelationType;
  user_confirmation_needed: boolean;
  removal_guard: string;
  /** Evidence status as stated by the source rule row, carried verbatim. */
  evidence_status: string;
}

export const DEPENDENCY_RULES: DependencyRule[] = [
  {
    source_product_id: 'quality_safety',
    dependent_id: 'inspections',
    dependent_label: 'Inspections',
    relation_type: DependencyRelationType.CAPABILITY_LICENSING,
    user_confirmation_needed: true,
    removal_guard:
      'If inspections are required, do not recommend removing the commercial capability without validating impact.',
    evidence_status: 'FACT / official Procore documentation',
  },
  {
    source_product_id: 'quality_safety',
    dependent_id: 'incidents',
    dependent_label: 'Incidents',
    relation_type: DependencyRelationType.CAPABILITY_WORKFLOW,
    user_confirmation_needed: true,
    removal_guard: 'Check active incident workflow before removal.',
    evidence_status: 'FACT / official product documentation',
  },
  {
    source_product_id: 'quality_safety',
    dependent_id: 'observations',
    dependent_label: 'Observations',
    relation_type: DependencyRelationType.CAPABILITY_WORKFLOW,
    user_confirmation_needed: true,
    removal_guard: 'Check active observations workflow before removal.',
    evidence_status: 'FACT / official product documentation',
  },
  {
    source_product_id: 'quality_safety',
    dependent_id: 'forms',
    dependent_label: 'Forms',
    relation_type: DependencyRelationType.CAPABILITY_WORKFLOW,
    user_confirmation_needed: true,
    removal_guard: 'Check whether forms are used for Q&S-critical processes.',
    evidence_status: 'FACT / official product documentation',
  },
  {
    source_product_id: 'quality_safety',
    dependent_id: 'daily_log',
    dependent_label: 'Daily Log',
    relation_type: DependencyRelationType.CAPABILITY_WORKFLOW,
    user_confirmation_needed: true,
    removal_guard:
      'Daily Log can remain part of PM workflows; do not assume removing Q&S removes all PM tools.',
    evidence_status: 'FACT / official documentation',
  },
  {
    source_product_id: 'project_financials',
    dependent_id: 'accounting_erp_integration',
    dependent_label: 'Accounting / ERP integration',
    relation_type: DependencyRelationType.INTEGRATION,
    user_confirmation_needed: true,
    removal_guard: 'Flag integration and validate replacement before removal.',
    evidence_status: 'FACT / official Procore support evidence',
  },
  {
    source_product_id: 'analytics',
    dependent_id: 'operational_modules',
    dependent_label: 'Operational modules',
    relation_type: DependencyRelationType.SOFT_DATA_CONSUMPTION,
    user_confirmation_needed: false,
    removal_guard: 'Do not infer a module dependency merely because analytics consumes data.',
    evidence_status: 'FACT / official Procore support evidence',
  },
  {
    source_product_id: '*',
    dependent_id: 'customer_specific_workflow',
    dependent_label: 'Customer-specific workflow',
    relation_type: DependencyRelationType.BUSINESS_DEPENDENCY,
    user_confirmation_needed: true,
    removal_guard:
      'Client contract, compliance, internal policy or required workflow blocks removal.',
    evidence_status: 'Customer input',
  },
];

/** Returns dependency rules that apply to a product, including the '*' wildcard rules. */
export function getDependencyRules(productId: string): DependencyRule[] {
  return DEPENDENCY_RULES.filter(
    (r) => r.source_product_id === productId || r.source_product_id === '*',
  );
}

/** Rules that require explicit user confirmation before a candidate can be considered removable. */
export function getConfirmationRequiredRules(productId: string): DependencyRule[] {
  return getDependencyRules(productId).filter((r) => r.user_confirmation_needed);
}

// ── Eligibility helpers ────────────────────────────────────────────────────
//
// These functions give the (not-yet-built) candidate-generation step a way to
// determine ELIGIBLE / BLOCKED / UNCERTAIN / NOT_APPLICABLE for a single product
// input, using only the requirement/dependency evidence already carried on
// ProductInput plus the documented dependency rules above. They do not decide
// which products are worth recommending (that also depends on usage, which
// belongs to candidate generation) — they only classify removability evidence.

/** Default eligibility implied by a documented dependency rule, before user input is applied. */
export function ruleDefaultEligibility(rule: DependencyRule): CandidateEligibility {
  return rule.user_confirmation_needed ? 'UNCERTAIN' : 'NOT_APPLICABLE';
}

export function requirementEligibility(requirement: RequirementStatus): CandidateEligibility {
  switch (requirement) {
    case 'BUSINESS_CRITICAL':
    case 'CLIENT_CONTRACT':
    case 'INTERNAL_POLICY':
      return 'BLOCKED';
    case 'NOT_REQUIRED':
      return 'ELIGIBLE';
    case 'NOT_SURE':
      return 'UNCERTAIN';
    default:
      return 'UNCERTAIN';
  }
}

export function dependencyFlagEligibility(dependency: DependencyFlag): CandidateEligibility {
  switch (dependency) {
    case 'YES':
      return 'BLOCKED';
    case 'NO':
      return 'ELIGIBLE';
    case 'NOT_SURE':
      return 'UNCERTAIN';
    default:
      return 'UNCERTAIN';
  }
}

export interface ProductEligibilityResult {
  eligibility: CandidateEligibility;
  reasons: string[];
  applicable_rules: DependencyRule[];
}

/**
 * Combines requirement status, user-reported dependency flag, and documented
 * dependency rules into a single eligibility verdict for one product.
 * Requirement/dependency blocks always win over documented-rule uncertainty.
 */
export function evaluateProductEligibility(
  productId: string,
  requirement: RequirementStatus,
  dependency: DependencyFlag,
): ProductEligibilityResult {
  const reasons: string[] = [];
  const applicableRules = getDependencyRules(productId);

  const reqElig = requirementEligibility(requirement);
  if (reqElig === 'BLOCKED') {
    reasons.push(`Requirement status "${requirement}" blocks removal.`);
    return { eligibility: 'BLOCKED', reasons, applicable_rules: applicableRules };
  }

  const depElig = dependencyFlagEligibility(dependency);
  if (depElig === 'BLOCKED') {
    reasons.push('User-confirmed dependency blocks removal.');
    return { eligibility: 'BLOCKED', reasons, applicable_rules: applicableRules };
  }

  if (reqElig === 'UNCERTAIN') {
    reasons.push('Requirement status is not confirmed.');
  }
  if (depElig === 'UNCERTAIN') {
    reasons.push('Dependency status is not confirmed.');
  }

  const confirmationNeeded = applicableRules.filter(
    // The '*' wildcard business-dependency rule restates what the `requirement` field
    // already captures (client contract / internal policy / business-critical); it is
    // surfaced via applicable_rules for traceability but must not double-count here.
    (r) => r.user_confirmation_needed && r.source_product_id !== '*',
  );
  if (confirmationNeeded.length > 0) {
    reasons.push(...confirmationNeeded.map((r) => r.removal_guard));
  }

  if (reqElig === 'UNCERTAIN' || depElig === 'UNCERTAIN' || confirmationNeeded.length > 0) {
    return { eligibility: 'UNCERTAIN', reasons, applicable_rules: applicableRules };
  }

  return { eligibility: 'ELIGIBLE', reasons, applicable_rules: applicableRules };
}
