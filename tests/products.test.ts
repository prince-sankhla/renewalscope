// tests/products.test.ts — product/capability/dependency model (Step 3)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PRODUCT_CATALOG,
  getProduct,
  getAllProducts,
  getDependencyRules,
  getConfirmationRequiredRules,
  ruleDefaultEligibility,
  requirementEligibility,
  dependencyFlagEligibility,
  evaluateProductEligibility,
} from '../src/products.js';
import { RequirementStatus, DependencyFlag } from '../src/types.js';

// ── catalog ─────────────────────────────────────────────────────────────────

describe('PRODUCT_CATALOG', () => {
  it('contains all ten MVP-supported catalog products plus the "other" placeholder', () => {
    const ids = PRODUCT_CATALOG.map((p) => p.id);
    assert.ok(ids.includes('project_management'));
    assert.ok(ids.includes('quality_safety'));
    assert.ok(ids.includes('project_financials'));
    assert.ok(ids.includes('invoice_management'));
    assert.ok(ids.includes('analytics'));
    assert.ok(ids.includes('pay'));
    assert.ok(ids.includes('resource_tracking'));
    assert.ok(ids.includes('estimating'));
    assert.ok(ids.includes('bid_management'));
    assert.ok(ids.includes('field_productivity'));
    assert.ok(ids.includes('other'));
  });

  it('has no duplicate product ids', () => {
    const ids = PRODUCT_CATALOG.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('quality_safety carries its documented tool set as separate capabilities', () => {
    const qs = getProduct('quality_safety');
    assert.ok(qs);
    const toolIds = qs!.capabilities.map((c) => c.id);
    assert.ok(toolIds.includes('inspections'));
    assert.ok(toolIds.includes('incidents'));
    assert.ok(toolIds.includes('observations'));
    assert.ok(toolIds.includes('forms'));
    assert.ok(toolIds.includes('daily_log'));
  });

  it('field_productivity uses fte pricing basis, not acv', () => {
    const fp = getProduct('field_productivity');
    assert.ok(fp);
    assert.equal(fp!.pricing_basis, 'fte');
    assert.equal(fp!.mvp_supported, 'conditional');
  });

  it('getAllProducts returns the full catalog', () => {
    assert.equal(getAllProducts().length, PRODUCT_CATALOG.length);
  });

  it('getProduct returns undefined for an unknown id', () => {
    assert.equal(getProduct('does_not_exist'), undefined);
  });
});

// ── dependency rules ────────────────────────────────────────────────────────

describe('getDependencyRules', () => {
  it('returns all five documented Quality & Safety tool relationships', () => {
    const rules = getDependencyRules('quality_safety');
    const depIds = rules.map((r) => r.dependent_id);
    assert.ok(depIds.includes('inspections'));
    assert.ok(depIds.includes('incidents'));
    assert.ok(depIds.includes('observations'));
    assert.ok(depIds.includes('forms'));
    assert.ok(depIds.includes('daily_log'));
  });

  it('includes the wildcard "any product" business-dependency rule for every product', () => {
    const rules = getDependencyRules('pay');
    assert.ok(rules.some((r) => r.source_product_id === '*' && r.dependent_id === 'customer_specific_workflow'));
  });

  it('returns the ERP integration rule for project_financials', () => {
    const rules = getDependencyRules('project_financials');
    assert.ok(rules.some((r) => r.dependent_id === 'accounting_erp_integration'));
  });

  it('returns the soft-dependency analytics rule with user_confirmation_needed = false', () => {
    const rules = getDependencyRules('analytics');
    const opModules = rules.find((r) => r.dependent_id === 'operational_modules');
    assert.ok(opModules);
    assert.equal(opModules!.user_confirmation_needed, false);
  });

  it('returns only the wildcard rule for a product with no specific dependency entries', () => {
    const rules = getDependencyRules('estimating');
    assert.equal(rules.length, 1);
    assert.equal(rules[0].source_product_id, '*');
  });
});

describe('getConfirmationRequiredRules', () => {
  it('excludes the analytics soft-dependency rule (confirmation not required by default)', () => {
    const rules = getConfirmationRequiredRules('analytics');
    assert.equal(rules.some((r) => r.dependent_id === 'operational_modules'), false);
  });

  it('includes the five Quality & Safety rules plus the wildcard business-dependency rule', () => {
    const rules = getConfirmationRequiredRules('quality_safety');
    assert.equal(rules.length, 6);
    assert.ok(rules.some((r) => r.source_product_id === '*'));
  });
});

// ── eligibility primitives ─────────────────────────────────────────────────

describe('ruleDefaultEligibility', () => {
  it('returns UNCERTAIN for a rule requiring confirmation', () => {
    const rules = getDependencyRules('quality_safety');
    assert.equal(ruleDefaultEligibility(rules[0]), 'UNCERTAIN');
  });

  it('returns NOT_APPLICABLE for a rule that does not require confirmation by default', () => {
    const rules = getDependencyRules('analytics');
    const opModules = rules.find((r) => r.dependent_id === 'operational_modules')!;
    assert.equal(ruleDefaultEligibility(opModules), 'NOT_APPLICABLE');
  });
});

describe('requirementEligibility', () => {
  it('blocks BUSINESS_CRITICAL, CLIENT_CONTRACT, and INTERNAL_POLICY', () => {
    assert.equal(requirementEligibility(RequirementStatus.BUSINESS_CRITICAL), 'BLOCKED');
    assert.equal(requirementEligibility(RequirementStatus.CLIENT_CONTRACT), 'BLOCKED');
    assert.equal(requirementEligibility(RequirementStatus.INTERNAL_POLICY), 'BLOCKED');
  });

  it('is ELIGIBLE for NOT_REQUIRED', () => {
    assert.equal(requirementEligibility(RequirementStatus.NOT_REQUIRED), 'ELIGIBLE');
  });

  it('is UNCERTAIN for NOT_SURE', () => {
    assert.equal(requirementEligibility(RequirementStatus.NOT_SURE), 'UNCERTAIN');
  });
});

describe('dependencyFlagEligibility', () => {
  it('blocks YES', () => {
    assert.equal(dependencyFlagEligibility(DependencyFlag.YES), 'BLOCKED');
  });

  it('is ELIGIBLE for NO', () => {
    assert.equal(dependencyFlagEligibility(DependencyFlag.NO), 'ELIGIBLE');
  });

  it('is UNCERTAIN for NOT_SURE', () => {
    assert.equal(dependencyFlagEligibility(DependencyFlag.NOT_SURE), 'UNCERTAIN');
  });
});

// ── combined product eligibility ────────────────────────────────────────────

describe('evaluateProductEligibility', () => {
  it('T3 scenario: Q&S required by client contract → BLOCKED regardless of dependency flag', () => {
    const result = evaluateProductEligibility(
      'quality_safety',
      RequirementStatus.CLIENT_CONTRACT,
      DependencyFlag.NO,
    );
    assert.equal(result.eligibility, 'BLOCKED');
    assert.ok(result.reasons.some((r) => r.includes('CLIENT_CONTRACT')));
  });

  it('T1 scenario: Invoice Management not required, no dependency → ELIGIBLE with no confirmation-required rules', () => {
    const result = evaluateProductEligibility(
      'invoice_management',
      RequirementStatus.NOT_REQUIRED,
      DependencyFlag.NO,
    );
    assert.equal(result.eligibility, 'ELIGIBLE');
  });

  it('T7 scenario: Project Financials not required, dependency NO, but ERP integration rule requires confirmation → UNCERTAIN', () => {
    const result = evaluateProductEligibility(
      'project_financials',
      RequirementStatus.NOT_REQUIRED,
      DependencyFlag.NO,
    );
    assert.equal(result.eligibility, 'UNCERTAIN');
    assert.ok(result.reasons.some((r) => r.includes('Flag integration')));
  });

  it('Quality & Safety not required, dependency NOT_SURE → UNCERTAIN', () => {
    const result = evaluateProductEligibility(
      'quality_safety',
      RequirementStatus.NOT_REQUIRED,
      DependencyFlag.NOT_SURE,
    );
    assert.equal(result.eligibility, 'UNCERTAIN');
  });

  it('user-confirmed dependency (YES) blocks even when requirement is NOT_REQUIRED', () => {
    const result = evaluateProductEligibility(
      'analytics',
      RequirementStatus.NOT_REQUIRED,
      DependencyFlag.YES,
    );
    assert.equal(result.eligibility, 'BLOCKED');
  });

  it('analytics with no confirmed dependency and no requirement is ELIGIBLE (soft rule does not force UNCERTAIN)', () => {
    const result = evaluateProductEligibility(
      'analytics',
      RequirementStatus.NOT_REQUIRED,
      DependencyFlag.NO,
    );
    assert.equal(result.eligibility, 'ELIGIBLE');
  });

  it('always attaches applicable_rules for traceability, even when ELIGIBLE', () => {
    const result = evaluateProductEligibility(
      'invoice_management',
      RequirementStatus.NOT_REQUIRED,
      DependencyFlag.NO,
    );
    assert.ok(result.applicable_rules.some((r) => r.source_product_id === '*'));
  });
});
