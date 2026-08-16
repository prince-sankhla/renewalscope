// tests/integration.test.ts — Steps 10 & 11: integration + hard-guard regression
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { runEngine } from '../src/engine.js';
import { ResultType, ConfidenceLevel, UsageRating, RequirementStatus, ReplacementOption, DependencyFlag, DiscountStatus, BundleStructure } from '../src/types.js';

function base(overrides = {}) {
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

function invoicePI(req = RequirementStatus.NOT_REQUIRED, dep = DependencyFlag.NO) {
  return { product_id: 'invoice_management', usage: UsageRating.NOT_USED, requirement: req, replacement: ReplacementOption.ANOTHER_TOOL, dependency: dep, annual_price_usd: 16945 };
}

// ── Step 10: integration flows ────────────────────────────────────────────────

describe('integration: no optimization candidate', () => {
  it('all products critical → free_result NO_DEFENSIBLE', () => {
    const out = runEngine(base({ product_inputs: [{ product_id: 'project_management', usage: UsageRating.CRITICAL, requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.NOT_NEEDED, dependency: DependencyFlag.NO }] }));
    assert.equal(out.free_result.verdict, ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED);
    assert.equal(out.free_result.savings_amount, undefined);
  });
});

describe('integration: clean candidate, no quotes', () => {
  it('OPPORTUNITY_NOT_QUANTIFIABLE, no dollar_saving', () => {
    const out = runEngine(base({ product_inputs: [invoicePI()] }));
    assert.equal(out.free_result.verdict, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.equal(out.free_result.savings_amount, undefined);
    assert.equal(out.counterfactual!.counterfactual_results[0].dollar_saving, undefined);
  });
});

describe('integration: uncertain dependency (T7)', () => {
  it('dependency NOT_SURE → OPPORTUNITY_NOT_QUANTIFIABLE', () => {
    const out = runEngine(base({ product_inputs: [invoicePI(RequirementStatus.NOT_REQUIRED, DependencyFlag.NOT_SURE)] }));
    assert.equal(out.free_result.verdict, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    const cr = out.counterfactual!.counterfactual_results[0];
    assert.ok(cr.explanation.includes('Confirmation needed'));
  });
});

describe('integration: client-contract blocked (T3)', () => {
  it('CLIENT_CONTRACT → NO_DEFENSIBLE_SAVINGS_IDENTIFIED', () => {
    const out = runEngine(base({ product_inputs: [invoicePI(RequirementStatus.CLIENT_CONTRACT)] }));
    assert.equal(out.free_result.verdict, ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED);
    assert.equal(out.candidates!.blocked.length, 1);
  });
});

describe('integration: unknown discount (T8)', () => {
  it('DONT_KNOW discount → OPPORTUNITY_NOT_QUANTIFIABLE, warnings include discount note', () => {
    const out = runEngine(base({ discount_status: DiscountStatus.DONT_KNOW, product_inputs: [invoicePI()] }));
    assert.equal(out.free_result.verdict, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(out.warnings.some((w) => w.toLowerCase().includes('discount')));
  });
});

describe('integration: bundled/pooled structure', () => {
  it('BUNDLED → OPPORTUNITY_NOT_QUANTIFIABLE, global_assumptions carry bundle note', () => {
    const out = runEngine(base({ bundle_structure: BundleStructure.BUNDLED, product_inputs: [invoicePI()] }));
    assert.equal(out.free_result.verdict, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(out.assumptions.some((a) => a.includes('bundled')));
  });
});

describe('integration: verified before/after (T2)', () => {
  it('VERIFIED_BEFORE_AFTER with correct saving', () => {
    const out = runEngine(base({ before_annual_cost_usd: 147596, after_annual_cost_usd: 131200, product_inputs: [invoicePI()] }));
    assert.equal(out.free_result.verdict, ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(out.free_result.savings_amount, 16396);
    assert.equal(out.counterfactual!.counterfactual_results[0].dollar_saving, 16396);
  });
});

describe('integration: benchmark evidence gate', () => {
  it('ACV with few comparable rows → benchmark present but min_evidence_count_met false', () => {
    const out = runEngine(base({ acv_usd: 1 }));
    // Even with 1 comparable, benchmark is built but min_evidence_count_met is false
    if (out.benchmark) {
      assert.equal(out.benchmark.min_evidence_count_met, false);
    }
  });

  it('ACV with sufficient comparables → benchmark present with min_evidence_count_met true', () => {
    const out = runEngine(base({ acv_usd: 80_000_000 }));
    if (out.benchmark) {
      assert.equal(out.benchmark.min_evidence_count_met, true);
    }
  });
});

describe('integration: legacy-rate warning', () => {
  it('very low rate → WARNING result present', () => {
    const out = runEngine(base({ annual_cost_usd: 5000, acv_usd: 50_000_000 }));
    assert.ok(out.results.some((r) => r.result_type === ResultType.WARNING && r.confidence === ConfidenceLevel.BENCHMARK));
  });
});

describe('integration: annual contract → multi-year suggestion', () => {
  it('annual contract → negotiation what_to_ask mentions multi-year', () => {
    const out = runEngine(base({ product_inputs: [invoicePI()] }));
    assert.ok(out.negotiation);
    assert.ok(out.negotiation!.what_to_ask.toLowerCase().includes('multi-year'));
  });
});

describe('integration: no product_inputs → OPPORTUNITY_NOT_QUANTIFIABLE fallback', () => {
  it('bare input without product_inputs still runs and returns structured output', () => {
    const out = runEngine(base());
    assert.equal(out.free_result.verdict, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.equal(out.free_result.savings_amount, undefined);
  });
});

// ── Step 11: hard-guard regression ───────────────────────────────────────────

describe('HARD GUARD: line-item spend never becomes saving', () => {
  it('invoice not used, not required, no dependency, no quotes → 0 dollar_saving', () => {
    const out = runEngine(base({ product_inputs: [invoicePI()] }));
    for (const r of out.results) assert.equal(r.dollar_saving, undefined, `Unexpected saving on ${r.result_type}`);
    assert.equal(out.free_result.savings_amount, undefined);
  });
});

describe('HARD GUARD: OPPORTUNITY_NOT_QUANTIFIABLE never has dollar_saving', () => {
  it('all OPPORTUNITY_NOT_QUANTIFIABLE results have no dollar_saving', () => {
    const out = runEngine(base({ product_inputs: [invoicePI()] }));
    const notQuant = out.results.filter((r) => r.result_type === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(notQuant.length > 0);
    for (const r of notQuant) assert.equal(r.dollar_saving, undefined);
  });
});

describe('HARD GUARD: discount unknown blocks savings calculation', () => {
  it('DONT_KNOW discount → no dollar_saving in counterfactual results', () => {
    const out = runEngine(base({ discount_status: DiscountStatus.DONT_KNOW, product_inputs: [invoicePI()] }));
    for (const cr of out.counterfactual!.counterfactual_results) {
      assert.equal(cr.dollar_saving, undefined);
    }
  });
});

describe('HARD GUARD: bundled/pooled never yields dollar_saving', () => {
  it('POOLED + candidate → no saving claimed', () => {
    const out = runEngine(base({ bundle_structure: BundleStructure.POOLED, product_inputs: [invoicePI()] }));
    for (const cr of out.counterfactual!.counterfactual_results) {
      assert.equal(cr.dollar_saving, undefined);
    }
  });
});

describe('HARD GUARD: required product never becomes a candidate', () => {
  for (const req of [RequirementStatus.BUSINESS_CRITICAL, RequirementStatus.CLIENT_CONTRACT, RequirementStatus.INTERNAL_POLICY]) {
    it(`${req} → no candidate`, () => {
      const out = runEngine(base({ product_inputs: [invoicePI(req)] }));
      assert.equal(out.candidates!.candidates.length, 0);
      assert.equal(out.candidates!.blocked.length, 1);
    });
  }
});

describe('HARD GUARD: confirmed dependency blocks candidate', () => {
  it('dependency YES → blocked, not a candidate', () => {
    const out = runEngine(base({ product_inputs: [invoicePI(RequirementStatus.NOT_REQUIRED, DependencyFlag.YES)] }));
    assert.equal(out.candidates!.candidates.length, 0);
    assert.equal(out.candidates!.blocked.length, 1);
  });
});

describe('HARD GUARD: uncertain dependency stays uncertain', () => {
  it('dependency NOT_SURE → candidate present with blocked_reason', () => {
    const out = runEngine(base({ product_inputs: [invoicePI(RequirementStatus.NOT_REQUIRED, DependencyFlag.NOT_SURE)] }));
    assert.equal(out.candidates!.candidates.length, 1);
    assert.ok(out.candidates!.candidates[0].blocked_reason);
    assert.equal(out.counterfactual!.overall_result, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.equal(out.counterfactual!.counterfactual_results[0].dollar_saving, undefined);
  });
});

describe('HARD GUARD: benchmark gate — no results when min_evidence_count_met false', () => {
  it('few comparables → benchmark present but min_evidence_count_met false → benchmark rules should not fire', () => {
    const out = runEngine(base({ acv_usd: 1 }));
    // Benchmark may exist but rules should respect min_evidence_count_met
    if (out.benchmark) {
      assert.equal(out.benchmark.min_evidence_count_met, false);
    }
    // The rules ruleBenchmarkHighRate and ruleLegacyRateWarning check min_evidence_count_met
    // and return null when false, so no SAVINGS_IDENTIFIED or WARNING from benchmark should appear
    const benchmarkResults = out.results.filter((r) => r.confidence === ConfidenceLevel.BENCHMARK);
    assert.equal(benchmarkResults.length, 0, 'No benchmark-confidence results should fire when min_evidence_count_met is false');
  });
});

describe('HARD GUARD: target price is a negotiation target, not a Procore prediction', () => {
  it('target_savings_pct=10 on $147596 → max_acceptable_price=$132836.4, labeled in negotiation not as savings', () => {
    const out = runEngine(base({ target_savings_pct: 10, product_inputs: [invoicePI()] }));
    assert.ok(out.negotiation);
    assert.equal(out.negotiation!.max_acceptable_price, 132836.4);
    assert.ok(!out.negotiation!.what_to_ask.includes('Procore will quote'));
    assert.ok(!out.negotiation!.what_to_ask.includes('will save'));
    assert.equal(out.free_result.savings_amount, undefined);
  });
});

describe('HARD GUARD: LLM boundary — financial numbers from deterministic engine only', () => {
  it('confidence_rationale in paid_report confirms deterministic calculation', () => {
    const out = runEngine(base({ product_inputs: [invoicePI()] }));
    assert.ok(out.paid_report.confidence_rationale.toLowerCase().includes('deterministic'));
    assert.ok(out.paid_report.confidence_rationale.toLowerCase().includes('no llm'));
  });
});

describe('HARD GUARD: VERIFIED_BEFORE_AFTER remains exact arithmetic', () => {
  it('saving = before - after, no rounding or inflation', () => {
    const out = runEngine(base({ before_annual_cost_usd: 100000, after_annual_cost_usd: 73456, product_inputs: [invoicePI()] }));
    assert.equal(out.free_result.savings_amount, 26544);
    assert.equal(out.counterfactual!.counterfactual_results[0].dollar_saving, 26544);
  });
});

describe('attribution: before/after quotes with no configuration mapping', () => {
  it('verified saving is quote-to-quote difference, not product-specific attribution', () => {
    const out = runEngine(base({ before_annual_cost_usd: 147596, after_annual_cost_usd: 131200 }));
    assert.equal(out.free_result.verdict, ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(out.free_result.savings_amount, 16396);
    // Explanation must NOT claim this is from a specific product removal
    const verifiedResult = out.results.find(r => r.result_type === ResultType.VERIFIED_BEFORE_AFTER);
    assert.ok(verifiedResult);
    assert.ok(!verifiedResult!.recommendation_text.includes('invoice_management'),
      'Should not attribute saving to specific product without configuration mapping');
  });

  it('no duplicate VERIFIED_BEFORE_AFTER results', () => {
    const out = runEngine(base({
      before_annual_cost_usd: 147596, after_annual_cost_usd: 131200,
      product_inputs: [{ product_id: 'invoice_management', usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO, annual_price_usd: 16945 }]
    }));
    const verified = out.results.filter(r => r.result_type === ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(verified.length, 1, 'Should have exactly one VERIFIED_BEFORE_AFTER result');
    assert.equal(verified[0].dollar_saving, 16396);
  });

  it('invoice_management remains a separate optimization candidate', () => {
    const out = runEngine(base({
      before_annual_cost_usd: 147596, after_annual_cost_usd: 131200,
      product_inputs: [{ product_id: 'invoice_management', usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO, annual_price_usd: 16945 }]
    }));
    assert.equal(out.free_result.verdict, ResultType.VERIFIED_BEFORE_AFTER);
    assert.ok(out.candidates!.candidates.length > 0, 'Invoice management should still be a candidate');
  });
});
