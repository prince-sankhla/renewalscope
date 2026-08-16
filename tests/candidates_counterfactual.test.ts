// tests/candidates_counterfactual.test.ts — Steps 5 & 6
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generateCandidates, hasNoDefensiblePath } from '../src/candidates.js';
import { evaluateCandidates, calcTargetPrice } from '../src/counterfactual.js';
import {
  UsageRating, RequirementStatus, ReplacementOption, DependencyFlag,
  DiscountStatus, BundleStructure, ResultType, ConfidenceLevel,
} from '../src/types.js';
import type { UserInput } from '../src/types.js';

function base(overrides: Partial<UserInput> = {}): UserInput {
  return {
    annual_cost_usd: 147596,
    acv_usd: 80_000_000,
    products: ['invoice_management'],
    contract_term: 'annual',
    discount_status: DiscountStatus.PCT_KNOWN,
    discount_pct: 10,
    bundle_structure: BundleStructure.STANDARD,
    ...overrides,
  };
}

function invoiceInput(reqOverride = RequirementStatus.NOT_REQUIRED, depOverride = DependencyFlag.NO) {
  return base({
    product_inputs: [{
      product_id: 'invoice_management',
      usage: UsageRating.NOT_USED,
      requirement: reqOverride,
      replacement: ReplacementOption.ANOTHER_TOOL,
      dependency: depOverride,
      annual_price_usd: 16945,
    }],
  });
}

// ── generateCandidates ────────────────────────────────────────────────────────

describe('generateCandidates — usage filter', () => {
  it('skips CRITICAL products', () => {
    const r = generateCandidates(base({
      product_inputs: [{ product_id: 'project_management', usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.NOT_NEEDED,
        dependency: DependencyFlag.NO }],
    }));
    assert.equal(r.candidates.length, 0);
    assert.equal(r.skipped_product_ids[0], 'project_management');
  });

  it('skips REGULAR products', () => {
    const r = generateCandidates(base({
      product_inputs: [{ product_id: 'analytics', usage: UsageRating.REGULAR,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.NOT_NEEDED,
        dependency: DependencyFlag.NO }],
    }));
    assert.equal(r.candidates.length, 0);
  });

  it('includes RARELY, OCCASIONAL, NOT_USED, NOT_SURE as candidates', () => {
    for (const usage of [UsageRating.RARELY, UsageRating.OCCASIONAL, UsageRating.NOT_USED, UsageRating.NOT_SURE]) {
      const r = generateCandidates(base({
        product_inputs: [{ product_id: 'invoice_management', usage,
          requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
          dependency: DependencyFlag.NO }],
      }));
      assert.equal(r.candidates.length, 1, `${usage} should be a candidate`);
    }
  });
});

describe('generateCandidates — requirement/dependency blocking (T3)', () => {
  it('T3: CLIENT_CONTRACT blocks Q&S even when rarely used', () => {
    const r = generateCandidates(base({
      product_inputs: [{ product_id: 'quality_safety', usage: UsageRating.RARELY,
        requirement: RequirementStatus.CLIENT_CONTRACT, replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO }],
    }));
    assert.equal(r.candidates.length, 0);
    assert.equal(r.blocked.length, 1);
    assert.ok(r.blocked[0].blocked_reason?.includes('CLIENT_CONTRACT'));
  });

  it('BUSINESS_CRITICAL blocks candidate', () => {
    const r = generateCandidates(base({
      product_inputs: [{ product_id: 'analytics', usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.BUSINESS_CRITICAL, replacement: ReplacementOption.NOT_NEEDED,
        dependency: DependencyFlag.NO }],
    }));
    assert.equal(r.blocked.length, 1);
    assert.equal(r.candidates.length, 0);
  });

  it('confirmed dependency (YES) blocks candidate', () => {
    const r = generateCandidates(base({
      product_inputs: [{ product_id: 'invoice_management', usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.YES }],
    }));
    assert.equal(r.candidates.length, 0);
    assert.equal(r.blocked.length, 1);
  });

  it('T7: dependency NOT_SURE produces UNCERTAIN candidate (not blocked)', () => {
    const r = generateCandidates(base({
      product_inputs: [{ product_id: 'project_financials', usage: UsageRating.RARELY,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NOT_SURE }],
    }));
    assert.equal(r.candidates.length, 1);
    assert.ok(r.candidates[0].blocked_reason);
  });

  it('T1: invoice_management not used, not required, no dependency → clean candidate', () => {
    const r = generateCandidates(invoiceInput());
    assert.equal(r.candidates.length, 1);
    assert.equal(r.candidates[0].blocked_reason, undefined);
  });
});

describe('generateCandidates — empty / no product_inputs', () => {
  it('returns empty result when product_inputs absent', () => {
    const r = generateCandidates(base());
    assert.equal(r.candidates.length, 0);
    assert.equal(r.blocked.length, 0);
  });

  it('hasNoDefensiblePath is true when no candidates', () => {
    const r = generateCandidates(base());
    assert.equal(hasNoDefensiblePath(r), true);
  });

  it('hasNoDefensiblePath is false when candidates exist', () => {
    const r = generateCandidates(invoiceInput());
    assert.equal(hasNoDefensiblePath(r), false);
  });
});

// ── evaluateCandidates ────────────────────────────────────────────────────────

describe('evaluateCandidates — T6: no candidates', () => {
  it('T6: blocked products only → NO_DEFENSIBLE_SAVINGS_IDENTIFIED', () => {
    const gen = generateCandidates(base({
      product_inputs: [{ product_id: 'quality_safety', usage: UsageRating.RARELY,
        requirement: RequirementStatus.CLIENT_CONTRACT, replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO }],
    }));
    const summary = evaluateCandidates(base(), gen);
    assert.equal(summary.overall_result, ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED);
    assert.equal(summary.counterfactual_results.length, 0);
  });

  it('no product_inputs at all → NO_DEFENSIBLE_SAVINGS_IDENTIFIED', () => {
    const gen = generateCandidates(base());
    const summary = evaluateCandidates(base(), gen);
    assert.equal(summary.overall_result, ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED);
  });
});

describe('evaluateCandidates — T2: VERIFIED_BEFORE_AFTER', () => {
  it('T2: before/after quotes produce VERIFIED_BEFORE_AFTER with dollar_saving', () => {
    const input = invoiceInput();
    input.before_annual_cost_usd = 147596;
    input.after_annual_cost_usd = 131200;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(summary.counterfactual_results[0].dollar_saving, 16396);
  });

  it('before/after with no saving → WARNING overall', () => {
    const input = invoiceInput();
    input.before_annual_cost_usd = 100000;
    input.after_annual_cost_usd = 110000;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.WARNING);
    assert.equal(summary.counterfactual_results[0].dollar_saving, undefined);
  });
});

describe('evaluateCandidates — T1: OPPORTUNITY_NOT_QUANTIFIABLE', () => {
  it('T1: clean candidate, no quotes → OPPORTUNITY_NOT_QUANTIFIABLE', () => {
    const gen = generateCandidates(invoiceInput());
    const summary = evaluateCandidates(invoiceInput(), gen);
    assert.equal(summary.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.equal(summary.counterfactual_results[0].confidence, ConfidenceLevel.UNKNOWN);
    assert.equal(summary.counterfactual_results[0].dollar_saving, undefined);
  });

  it('T1: line-item spend mentioned in explanation but NOT as a saving', () => {
    const gen = generateCandidates(invoiceInput());
    const summary = evaluateCandidates(invoiceInput(), gen);
    const explanation = summary.counterfactual_results[0].explanation;
    assert.ok(explanation.includes('16,945'), 'Should mention attributable spend');
    assert.ok(!explanation.includes('saving of'), 'Must not frame spend as a saving');
  });

  it('T7: UNCERTAIN candidate (ERP dep unknown) → OPPORTUNITY_NOT_QUANTIFIABLE', () => {
    const input = base({
      product_inputs: [{ product_id: 'project_financials', usage: UsageRating.RARELY,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NOT_SURE, annual_price_usd: 20000 }],
    });
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(summary.counterfactual_results[0].explanation.includes('Confirmation needed'));
  });
});

describe('evaluateCandidates — T8: discount/bundle guards', () => {
  it('T8: discount DONT_KNOW → OPPORTUNITY_NOT_QUANTIFIABLE + global assumption', () => {
    const input = invoiceInput();
    input.discount_status = DiscountStatus.DONT_KNOW;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(summary.global_assumptions.some((a) => a.includes('Discount status unknown')));
  });

  it('BUNDLED structure → OPPORTUNITY_NOT_QUANTIFIABLE + global assumption', () => {
    const input = invoiceInput();
    input.bundle_structure = BundleStructure.BUNDLED;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(summary.global_assumptions.some((a) => a.includes('bundled')));
  });

  it('POOLED structure → OPPORTUNITY_NOT_QUANTIFIABLE', () => {
    const input = invoiceInput();
    input.bundle_structure = BundleStructure.POOLED;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
  });
});

describe('calcTargetPrice — T5', () => {
  it('T5: $147,596 at 10% target → max acceptable $132,836.40', () => {
    const candidate = {
      product_id: 'invoice_management', usage: UsageRating.NOT_USED,
      requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
      dependency: DependencyFlag.NO,
    };
    const result = calcTargetPrice(base({ annual_cost_usd: 147596 }), candidate, 10);
    assert.equal(result.max_acceptable_price, 132836.4);
    assert.equal(result.current_spend, 147596);
    assert.equal(result.target_savings_pct, 10);
  });

  it('5% target on $100k → $95,000', () => {
    const candidate = {
      product_id: 'analytics', usage: UsageRating.NOT_USED,
      requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.NOT_NEEDED,
      dependency: DependencyFlag.NO,
    };
    const result = calcTargetPrice(base({ annual_cost_usd: 100000 }), candidate, 5);
    assert.equal(result.max_acceptable_price, 95000);
  });

  it('evaluateCandidates wires target_price when target_savings_pct set', () => {
    const input = invoiceInput();
    input.target_savings_pct = 10;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.target_prices.length, 1);
    assert.equal(summary.target_prices[0].max_acceptable_price, 132836.4);
  });

  it('target_prices is empty when target_savings_pct is null', () => {
    const input = invoiceInput();
    input.target_savings_pct = null;
    const gen = generateCandidates(input);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.target_prices.length, 0);
  });
});

describe('mixed candidates: some blocked, some eligible', () => {
  it('one blocked + one eligible → overall OPPORTUNITY_NOT_QUANTIFIABLE, not NO_DEFENSIBLE', () => {
    const input = base({
      products: ['quality_safety', 'invoice_management'],
      discount_status: DiscountStatus.PCT_KNOWN,
      discount_pct: 10,
      bundle_structure: BundleStructure.STANDARD,
      product_inputs: [
        { product_id: 'quality_safety', usage: UsageRating.RARELY,
          requirement: RequirementStatus.CLIENT_CONTRACT, replacement: ReplacementOption.NO_REPLACEMENT,
          dependency: DependencyFlag.NO },
        { product_id: 'invoice_management', usage: UsageRating.NOT_USED,
          requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
          dependency: DependencyFlag.NO, annual_price_usd: 16945 },
      ],
    });
    const gen = generateCandidates(input);
    assert.equal(gen.blocked.length, 1);
    assert.equal(gen.candidates.length, 1);
    const summary = evaluateCandidates(input, gen);
    assert.equal(summary.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
  });
});
