// tests/negotiation_report.test.ts — Steps 7 & 8
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildNegotiationOutput } from '../src/negotiation.js';
import { buildFreeResult, buildPaidReport } from '../src/report.js';
import { generateCandidates } from '../src/candidates.js';
import { evaluateCandidates } from '../src/counterfactual.js';
import {
  UsageRating, RequirementStatus, ReplacementOption, DependencyFlag,
  DiscountStatus, BundleStructure, ResultType, ConfidenceLevel,
} from '../src/types.js';
import type { UserInput, BenchmarkResult } from '../src/types.js';

function baseInput(overrides: Partial<UserInput> = {}): UserInput {
  return {
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
    ...overrides,
  };
}

function makeSummary(input: UserInput) {
  const gen = generateCandidates(input);
  return { gen, summary: evaluateCandidates(input, gen) };
}

const mockBenchmark: BenchmarkResult = {
  user_rate: 1845,
  stats: { min: 810, max: 2000, p25: 1000, p50: 1333, p75: 1800, mean: 1400, count: 5 },
  position: 'above_p75',
  comparable_evidence_ids: ['REDDIT-004', 'WEB-011'],
  min_evidence_count_met: true,
};

// ── STEP 7: negotiation output ────────────────────────────────────────────────

describe('buildNegotiationOutput — no candidates', () => {
  it('returns null when overall_result is NO_DEFENSIBLE_SAVINGS_IDENTIFIED', () => {
    const input = baseInput({ product_inputs: [] });
    const { gen, summary } = makeSummary(input);
    assert.equal(buildNegotiationOutput(input, summary), null);
  });
});

describe('buildNegotiationOutput — OPPORTUNITY_NOT_QUANTIFIABLE', () => {
  it('produces what_to_ask mentioning the candidate product', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary);
    assert.ok(neg);
    assert.ok(neg!.what_to_ask.toLowerCase().includes('invoice_management'));
  });

  it('configuration_requested lists remaining products', () => {
    const input = baseInput({ products: ['invoice_management', 'analytics'] });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary);
    assert.ok(neg!.configuration_requested.includes('analytics'));
  });

  it('includes at least one unknown about the resulting renewal price', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.ok(neg.unknowns.some((u) => u.toLowerCase().includes('renewal price') || u.toLowerCase().includes('quote')));
  });

  it('includes at least one confirm_in_writing item', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.ok(neg.confirm_in_writing.length >= 1);
  });

  it('includes discount risk when discount is unknown', () => {
    const input = baseInput({ discount_status: DiscountStatus.DONT_KNOW });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.ok(neg.risks.some((r) => r.toLowerCase().includes('discount')));
  });

  it('annual contract → what_to_ask mentions multi-year option', () => {
    const input = baseInput({ contract_term: 'annual' });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.ok(neg.what_to_ask.toLowerCase().includes('multi-year'));
  });

  it('target_price populated when target_savings_pct provided', () => {
    const input = baseInput({ target_savings_pct: 10 });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.equal(neg.max_acceptable_price, 132836.4);
  });

  it('target_price absent when no target_savings_pct', () => {
    const input = baseInput({ target_savings_pct: null });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.equal(neg.target_price, undefined);
  });
});

describe('buildNegotiationOutput — VERIFIED_BEFORE_AFTER', () => {
  it('why mentions the verified saving amount', () => {
    const input = baseInput({ before_annual_cost_usd: 147596, after_annual_cost_usd: 131200 });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary)!;
    assert.ok(neg.why.includes('16,396'));
  });
});

// ── STEP 8: FreeResult ────────────────────────────────────────────────────────

describe('buildFreeResult — OPPORTUNITY_NOT_QUANTIFIABLE', () => {
  it('verdict matches overall_result', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.equal(free.verdict, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
  });

  it('current_spend equals input.annual_cost_usd', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.equal(free.current_spend, 147596);
  });

  it('savings_amount is undefined (line-item spend is not a saving)', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.equal(free.savings_amount, undefined);
  });

  it('confidence is UNKNOWN for OPPORTUNITY_NOT_QUANTIFIABLE', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.equal(free.confidence, ConfidenceLevel.UNKNOWN);
  });

  it('what_to_confirm contains a quote request', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.ok(free.what_to_confirm.some((w) => w.toLowerCase().includes('quote')));
  });

  it('benchmark data surfaced when min_evidence_count_met', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, mockBenchmark);
    assert.equal(free.effective_rate, 1845);
    assert.equal(free.benchmark_position, 'above_p75');
  });

  it('benchmark suppressed when min_evidence_count_met is false', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, { ...mockBenchmark, min_evidence_count_met: false });
    assert.equal(free.effective_rate, undefined);
    assert.equal(free.benchmark_position, undefined);
  });
});

describe('buildFreeResult — VERIFIED_BEFORE_AFTER', () => {
  it('savings_amount is present and correct', () => {
    const input = baseInput({ before_annual_cost_usd: 147596, after_annual_cost_usd: 131200 });
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.equal(free.verdict, ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(free.savings_amount, 16396);
  });
});

describe('buildFreeResult — NO_DEFENSIBLE_SAVINGS_IDENTIFIED', () => {
  it('savings_amount absent and explanation reflects verdict', () => {
    const input = baseInput({ product_inputs: [] });
    const { gen, summary } = makeSummary(input);
    const free = buildFreeResult(input, summary, null);
    assert.equal(free.verdict, ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED);
    assert.equal(free.savings_amount, undefined);
    assert.ok(free.explanation.toLowerCase().includes('no defensible'));
  });
});

// ── STEP 8: PaidReport ────────────────────────────────────────────────────────

describe('buildPaidReport structure', () => {
  it('current_configuration reflects product_inputs', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary);
    const report = buildPaidReport(input, gen, summary, null, neg);
    assert.equal(report.current_configuration.length, 1);
    assert.equal(report.current_configuration[0].product_id, 'invoice_management');
  });

  it('candidate_configurations contains eligible candidates', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.equal(report.candidate_configurations.length, 1);
    assert.equal(report.candidate_configurations[0][0].product_id, 'invoice_management');
  });

  it('counterfactual_results are included', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.equal(report.counterfactual_results.length, 1);
  });

  it('negotiation output is attached when provided', () => {
    const input = baseInput({ target_savings_pct: 10 });
    const { gen, summary } = makeSummary(input);
    const neg = buildNegotiationOutput(input, summary);
    const report = buildPaidReport(input, gen, summary, null, neg);
    assert.ok(report.negotiation);
    assert.equal(report.negotiation!.max_acceptable_price, 132836.4);
  });

  it('assumptions deduplicated across global and per-candidate', () => {
    const input = baseInput({ discount_status: DiscountStatus.DONT_KNOW });
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    const dup = report.assumptions.filter(
      (a, i, arr) => arr.indexOf(a) !== i
    );
    assert.equal(dup.length, 0, 'assumptions should not contain duplicates');
  });

  it('legacy_rate_warning present when benchmark below_p25', () => {
    const lowBenchmark: BenchmarkResult = {
      ...mockBenchmark,
      position: 'below_p25',
      user_rate: 400,
    };
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, lowBenchmark, null);
    assert.ok(report.legacy_rate_warnings.length > 0);
  });

  it('legacy_rate_warning absent when benchmark not below_p25', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, mockBenchmark, null);
    assert.equal(report.legacy_rate_warnings.length, 0);
  });

  it('dependency_findings lists blocked products', () => {
    const input = baseInput({
      products: ['quality_safety', 'invoice_management'],
      product_inputs: [
        { product_id: 'quality_safety', usage: UsageRating.RARELY,
          requirement: RequirementStatus.CLIENT_CONTRACT, replacement: ReplacementOption.NO_REPLACEMENT,
          dependency: DependencyFlag.NO },
        { product_id: 'invoice_management', usage: UsageRating.NOT_USED,
          requirement: RequirementStatus.NOT_REQUIRED, replacement: ReplacementOption.ANOTHER_TOOL,
          dependency: DependencyFlag.NO, annual_price_usd: 16945 },
      ],
    });
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.ok(report.dependency_findings.some((d) => d.includes('quality_safety')));
  });

  it('audit_trail contains overall_result and date', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.ok(report.audit_trail.some((l) => l.includes('OPPORTUNITY_NOT_QUANTIFIABLE')));
    assert.ok(report.audit_trail.some((l) => l.includes('Analysis date')));
  });

  it('commercial_risks always contains at least one item', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.ok(report.commercial_risks.length >= 1);
  });

  it('suggested_questions includes multi-year ask for annual contract', () => {
    const input = baseInput({ contract_term: 'annual' });
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.ok(report.suggested_questions.some((q) => q.toLowerCase().includes('multi-year')));
  });

  it('confidence_rationale states deterministic calculation, not LLM', () => {
    const input = baseInput();
    const { gen, summary } = makeSummary(input);
    const report = buildPaidReport(input, gen, summary, null, null);
    assert.ok(report.confidence_rationale.toLowerCase().includes('deterministic'));
    assert.ok(report.confidence_rationale.toLowerCase().includes('no llm'));
  });
});
