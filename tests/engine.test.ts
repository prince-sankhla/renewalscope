// tests/engine.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateUserInput } from '../src/validation.js';
import { calcEffectiveRate, calcRateStats, ratePosition, findComparableRows, buildBenchmarkResult } from '../src/benchmark.js';
import {
  ruleCommercialStructures,
  ruleAcvGrowth,
  ruleRateProtection,
  ruleBenchmarkHighRate,
  ruleLegacyRateWarning,
  ruleRenewalIncrease,
  ruleDiscountUnknown,
  ruleBundleOrPoolGuard,
  ruleRequirementGuard,
  ruleDependencyUnknown,
  ruleVerifiedSaving,
  ruleConfigurationUnknown,
} from '../src/rules.js';
import { runEngine } from '../src/engine.js';
import {
  ConfidenceLevel,
  ResultType,
  EvidenceConfidence,
  DiscountStatus,
  BundleStructure,
  RequirementStatus,
  ReplacementOption,
  DependencyFlag,
  UsageRating,
} from '../src/types.js';
import type { EvidenceRow, BenchmarkResult, UserInput } from '../src/types.js';

// ── validation ────────────────────────────────────────────────────────────────

describe('validateUserInput', () => {
  it('accepts a minimal valid input', () => {
    const { valid } = validateUserInput({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
    });
    assert.equal(valid, true);
  });

  it('rejects missing annual_cost_usd', () => {
    const { valid, errors } = validateUserInput({
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
    });
    assert.equal(valid, false);
    assert.ok(errors.some((e) => e.field === 'annual_cost_usd'));
  });

  it('rejects zero acv_usd', () => {
    const { valid, errors } = validateUserInput({
      annual_cost_usd: 50000,
      acv_usd: 0,
      products: ['project_management'],
      contract_term: 'annual',
    });
    assert.equal(valid, false);
    assert.ok(errors.some((e) => e.field === 'acv_usd'));
  });

  it('rejects invalid contract_term', () => {
    const { valid, errors } = validateUserInput({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'monthly',
    });
    assert.equal(valid, false);
    assert.ok(errors.some((e) => e.field === 'contract_term'));
  });

  it('rejects negative renewal_increase_pct', () => {
    const { valid, errors } = validateUserInput({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      renewal_increase_pct: -1,
    });
    assert.equal(valid, false);
    assert.ok(errors.some((e) => e.field === 'renewal_increase_pct'));
  });
});

// ── effective rate ────────────────────────────────────────────────────────────

describe('calcEffectiveRate', () => {
  it('calculates correctly', () => {
    assert.equal(calcEffectiveRate(55000, 55_000_000), 1000);
    assert.equal(calcEffectiveRate(385000, 200_000_000), 1925);
  });

  it('throws on zero ACV', () => {
    assert.throws(() => calcEffectiveRate(50000, 0));
  });
});

// ── rate stats ────────────────────────────────────────────────────────────────

describe('calcRateStats', () => {
  const rows: EvidenceRow[] = [
    { evidence_id: 'A', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 800 },
    { evidence_id: 'B', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1000 },
    { evidence_id: 'C', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1500 },
    { evidence_id: 'D', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 2000 },
  ];

  it('computes min/max/mean', () => {
    const s = calcRateStats(rows);
    assert.equal(s.min, 800);
    assert.equal(s.max, 2000);
    assert.equal(s.mean, 1325);
    assert.equal(s.count, 4);
  });

  it('returns zeros for empty input', () => {
    const s = calcRateStats([]);
    assert.equal(s.count, 0);
    assert.equal(s.mean, 0);
  });
});

// ── ratePosition ─────────────────────────────────────────────────────────────

describe('ratePosition', () => {
  const stats = calcRateStats([
    { evidence_id: 'A', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 800 },
    { evidence_id: 'B', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1000 },
    { evidence_id: 'C', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1500 },
    { evidence_id: 'D', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 2000 },
  ]);

  it('below_p25 for a very low rate', () => {
    assert.equal(ratePosition(700, stats), 'below_p25');
  });

  it('above_p75 for a very high rate', () => {
    assert.equal(ratePosition(2100, stats), 'above_p75');
  });
});

// ── findComparableRows ────────────────────────────────────────────────────────

describe('findComparableRows', () => {
  it('excludes DUPLICATE rows', () => {
    const rows: EvidenceRow[] = [
      { evidence_id: 'X', confidence: EvidenceConfidence.DUPLICATE, acvType: 'company', rate_per_1m: 1000 },
      { evidence_id: 'Y', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1200, acv_usd: 20_000_000 },
    ];
    const result = findComparableRows(20_000_000, 'company', rows);
    assert.equal(result.length, 1);
    assert.equal(result[0].evidence_id, 'Y');
  });

  it('excludes project rows when user is company', () => {
    const rows: EvidenceRow[] = [
      { evidence_id: 'P', confidence: EvidenceConfidence.OBSERVATION, acvType: 'project', rate_per_1m: 1000 },
      { evidence_id: 'C', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1200 },
    ];
    const result = findComparableRows(20_000_000, 'company', rows);
    assert.ok(result.every((r) => r.acvType !== 'project'));
  });

  it('excludes rows outside acv band (10x each side)', () => {
    const rows: EvidenceRow[] = [
      { evidence_id: 'A', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1000, acv_usd: 1_000_000 },
      { evidence_id: 'B', confidence: EvidenceConfidence.OBSERVATION, acvType: 'company', rate_per_1m: 1000, acv_usd: 50_000_000 },
    ];
    // user ACV = 5M; band = 500k–50M; A (1M) in, B (50M) edge case
    const result = findComparableRows(5_000_000, 'company', rows);
    assert.ok(result.some((r) => r.evidence_id === 'A'));
  });
});

// ── rules ─────────────────────────────────────────────────────────────────────

describe('ruleCommercialStructures', () => {
  it('returns SAVINGS_IDENTIFIED/FACT for multi_year', () => {
    const r = ruleCommercialStructures({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'multi_year' });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.SAVINGS_IDENTIFIED);
    assert.equal(r!.confidence, ConfidenceLevel.FACT);
  });

  it('returns SAVINGS_IDENTIFIED/FACT for annual', () => {
    const r = ruleCommercialStructures({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'annual' });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.SAVINGS_IDENTIFIED);
    assert.equal(r!.confidence, ConfidenceLevel.FACT);
  });
});

describe('ruleBenchmarkHighRate', () => {
  it('returns SAVINGS_IDENTIFIED/BENCHMARK when above p75', () => {
    const bm: BenchmarkResult = {
      user_rate: 2500,
      stats: { min: 800, max: 2000, p25: 900, p50: 1200, p75: 1800, mean: 1300, count: 5 },
      position: 'above_p75',
      comparable_evidence_ids: ['REDDIT-004'],
      min_evidence_count_met: true,
    };
    const r = ruleBenchmarkHighRate(bm);
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.SAVINGS_IDENTIFIED);
    assert.equal(r!.confidence, ConfidenceLevel.BENCHMARK);
  });

  it('returns null when not above p75', () => {
    const bm: BenchmarkResult = {
      user_rate: 1000,
      stats: { min: 800, max: 2000, p25: 900, p50: 1200, p75: 1800, mean: 1300, count: 5 },
      position: 'p25_to_p50',
      comparable_evidence_ids: [],
      min_evidence_count_met: true,
    };
    assert.equal(ruleBenchmarkHighRate(bm), null);
  });
});

describe('ruleLegacyRateWarning', () => {
  it('returns WARNING/BENCHMARK when below p25', () => {
    const bm: BenchmarkResult = {
      user_rate: 500,
      stats: { min: 800, max: 2000, p25: 900, p50: 1200, p75: 1800, mean: 1300, count: 5 },
      position: 'below_p25',
      comparable_evidence_ids: ['WEB-011'],
      min_evidence_count_met: true,
    };
    const r = ruleLegacyRateWarning(bm);
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.equal(r!.confidence, ConfidenceLevel.BENCHMARK);
  });

  it('returns null otherwise', () => {
    const bm: BenchmarkResult = {
      user_rate: 1200,
      stats: { min: 800, max: 2000, p25: 900, p50: 1200, p75: 1800, mean: 1300, count: 5 },
      position: 'p50_to_p75',
      comparable_evidence_ids: [],
      min_evidence_count_met: true,
    };
    assert.equal(ruleLegacyRateWarning(bm), null);
  });
});

describe('ruleRenewalIncrease', () => {
  it('returns null when renewal_increase_pct not provided', () => {
    assert.equal(ruleRenewalIncrease({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'annual' }), null);
  });

  it('returns WARNING/OBSERVATION for increase 5–14%', () => {
    const r = ruleRenewalIncrease({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'annual', renewal_increase_pct: 10 });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.equal(r!.confidence, ConfidenceLevel.OBSERVATION);
    assert.ok(r!.comparable_evidence.includes('REDDIT-001'));
  });

  it('returns WARNING/OBSERVATION for increase >14%', () => {
    const r = ruleRenewalIncrease({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'annual', renewal_increase_pct: 20 });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.ok(r!.recommendation_text.includes('exceeds'));
  });

  it('returns null for a normal 3% increase', () => {
    const r = ruleRenewalIncrease({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'annual', renewal_increase_pct: 3 });
    assert.equal(r, null);
  });
});

describe('ruleVerifiedSaving', () => {
  it('returns VERIFIED_BEFORE_AFTER/FACT with dollar_saving when before > after', () => {
    const r = ruleVerifiedSaving({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      before_annual_cost_usd: 100000,
      after_annual_cost_usd: 70000,
    });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(r!.dollar_saving, 30000);
  });

  it('returns WARNING when after >= before', () => {
    const r = ruleVerifiedSaving({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      before_annual_cost_usd: 70000,
      after_annual_cost_usd: 100000,
    });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.equal(r!.dollar_saving, undefined);
  });

  it('returns null when before/after not provided', () => {
    const r = ruleVerifiedSaving({ annual_cost_usd: 50000, acv_usd: 50_000_000, products: ['project_management'], contract_term: 'annual' });
    assert.equal(r, null);
  });
});

describe('ruleConfigurationUnknown', () => {
  it('always returns OPPORTUNITY_NOT_QUANTIFIABLE/UNKNOWN with no dollar_saving', () => {
    const r = ruleConfigurationUnknown();
    assert.equal(r.result_type, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.equal(r.confidence, ConfidenceLevel.UNKNOWN);
    assert.equal(r.dollar_saving, undefined);
  });
});

// ── engine integration ────────────────────────────────────────────────────────

describe('runEngine', () => {
  it('throws on invalid input', () => {
    assert.throws(() => runEngine({}), /Invalid UserInput/);
  });

  it('returns sorted results with VERIFIED_BEFORE_AFTER first when before/after provided', () => {
    const out = runEngine({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      before_annual_cost_usd: 100000,
      after_annual_cost_usd: 70000,
    });
    assert.ok(out.results.length > 0);
    assert.equal(out.results[0].result_type, ResultType.VERIFIED_BEFORE_AFTER);
  });

  it('always includes an OPPORTUNITY_NOT_QUANTIFIABLE config-change result', () => {
    const out = runEngine({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
    });
    assert.ok(out.results.some((r) => r.result_type === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE));
  });

  it('never attaches dollar_saving to OPPORTUNITY_NOT_QUANTIFIABLE result', () => {
    const out = runEngine({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
    });
    const unknowns = out.results.filter((r) => r.result_type === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    unknowns.forEach((r) => assert.equal(r.dollar_saving, undefined));
  });

  it('produces a benchmark for a well-known ACV', () => {
    const out = runEngine({
      annual_cost_usd: 55000,
      acv_usd: 55_000_000,
      products: ['project_management'],
      contract_term: 'annual',
    });
    assert.ok(out.benchmark !== null);
    assert.ok(out.benchmark!.stats.count > 0);
  });

  it('attaches REDDIT-001 evidence for high renewal increase', () => {
    const out = runEngine({
      annual_cost_usd: 50000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      renewal_increase_pct: 10.4,
    });
    const renewalResult = out.results.find((r) => r.comparable_evidence.includes('REDDIT-001'));
    assert.ok(renewalResult);
  });

  it('emits WARNING for legacy-rate scenario', () => {
    // Rate of $200/1M is well below any p25 in the dataset
    const out = runEngine({
      annual_cost_usd: 10000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
    });
    const warn = out.results.find((r) => r.result_type === ResultType.WARNING && r.confidence === ConfidenceLevel.BENCHMARK);
    assert.ok(warn, 'Expected a legacy-rate WARNING');
  });
});

// ── Step 2: new commercial/risk rules ──────────────────────────────────────────

const baseInput: UserInput = {
  annual_cost_usd: 50000,
  acv_usd: 50_000_000,
  products: ['project_management'],
  contract_term: 'annual',
};

describe('ruleAcvGrowth', () => {
  it('returns null when expected_next_year_acv_usd is not provided', () => {
    assert.equal(ruleAcvGrowth(baseInput), null);
  });

  it('returns null when growth is at or below 15%', () => {
    const r = ruleAcvGrowth({ ...baseInput, expected_next_year_acv_usd: 57_000_000 });
    assert.equal(r, null);
  });

  it('returns SAVINGS_IDENTIFIED/FACT when expected ACV exceeds current ACV by more than 15%', () => {
    const r = ruleAcvGrowth({ ...baseInput, expected_next_year_acv_usd: 60_000_001 });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.SAVINGS_IDENTIFIED);
    assert.equal(r!.confidence, ConfidenceLevel.FACT);
  });
});

describe('ruleRateProtection', () => {
  it('fires for annual contract term', () => {
    const r = ruleRateProtection({ ...baseInput, contract_term: 'annual' });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.SAVINGS_IDENTIFIED);
  });

  it('fires when rate_protection_status is unclear even on multi_year term', () => {
    const r = ruleRateProtection({ ...baseInput, contract_term: 'multi_year', rate_protection_status: 'unclear' });
    assert.ok(r);
  });

  it('returns null when multi_year term and rate protection is active', () => {
    const r = ruleRateProtection({ ...baseInput, contract_term: 'multi_year', rate_protection_status: 'active' });
    assert.equal(r, null);
  });
});

describe('ruleDiscountUnknown', () => {
  it('returns null when discount_status is not set', () => {
    assert.equal(ruleDiscountUnknown(baseInput), null);
  });

  it('returns null when discount_status is known (PCT_KNOWN)', () => {
    const r = ruleDiscountUnknown({ ...baseInput, discount_status: DiscountStatus.PCT_KNOWN });
    assert.equal(r, null);
  });

  it('returns WARNING/FACT when discount_status is DONT_KNOW', () => {
    const r = ruleDiscountUnknown({ ...baseInput, discount_status: DiscountStatus.DONT_KNOW });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.equal(r!.confidence, ConfidenceLevel.FACT);
  });
});

describe('ruleBundleOrPoolGuard', () => {
  it('returns null for STANDARD structure', () => {
    const r = ruleBundleOrPoolGuard({ ...baseInput, bundle_structure: BundleStructure.STANDARD });
    assert.equal(r, null);
  });

  it('returns null when bundle_structure is not set', () => {
    assert.equal(ruleBundleOrPoolGuard(baseInput), null);
  });

  it('returns WARNING/FACT for BUNDLED structure', () => {
    const r = ruleBundleOrPoolGuard({ ...baseInput, bundle_structure: BundleStructure.BUNDLED });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.ok(r!.recommendation_text.includes('bundled'));
  });

  it('returns WARNING/FACT for POOLED structure', () => {
    const r = ruleBundleOrPoolGuard({ ...baseInput, bundle_structure: BundleStructure.POOLED });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.ok(r!.recommendation_text.includes('pooled-volume'));
  });
});

describe('ruleRequirementGuard', () => {
  it('returns null when no product_inputs provided', () => {
    assert.equal(ruleRequirementGuard(baseInput), null);
  });

  it('returns null when no product is required', () => {
    const r = ruleRequirementGuard({
      ...baseInput,
      product_inputs: [
        {
          product_id: 'invoice_management',
          usage: UsageRating.NOT_USED,
          requirement: RequirementStatus.NOT_REQUIRED,
          replacement: ReplacementOption.NOT_NEEDED,
          dependency: DependencyFlag.NO,
        },
      ],
    });
    assert.equal(r, null);
  });

  it('returns WARNING/FACT listing products required by client contract', () => {
    const r = ruleRequirementGuard({
      ...baseInput,
      product_inputs: [
        {
          product_id: 'quality_safety',
          usage: UsageRating.RARELY,
          requirement: RequirementStatus.CLIENT_CONTRACT,
          replacement: ReplacementOption.NO_REPLACEMENT,
          dependency: DependencyFlag.NO,
        },
      ],
    });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.WARNING);
    assert.ok(r!.recommendation_text.includes('quality_safety'));
  });
});

describe('ruleDependencyUnknown', () => {
  it('returns null when no product_inputs provided', () => {
    assert.equal(ruleDependencyUnknown(baseInput), null);
  });

  it('returns null when all dependencies are known', () => {
    const r = ruleDependencyUnknown({
      ...baseInput,
      product_inputs: [
        {
          product_id: 'analytics',
          usage: UsageRating.NOT_USED,
          requirement: RequirementStatus.NOT_REQUIRED,
          replacement: ReplacementOption.NOT_NEEDED,
          dependency: DependencyFlag.NO,
        },
      ],
    });
    assert.equal(r, null);
  });

  it('returns OPPORTUNITY_NOT_QUANTIFIABLE/UNKNOWN when a dependency is NOT_SURE', () => {
    const r = ruleDependencyUnknown({
      ...baseInput,
      product_inputs: [
        {
          product_id: 'project_financials',
          usage: UsageRating.OCCASIONAL,
          requirement: RequirementStatus.NOT_REQUIRED,
          replacement: ReplacementOption.NOT_SURE,
          dependency: DependencyFlag.NOT_SURE,
        },
      ],
    });
    assert.ok(r);
    assert.equal(r!.result_type, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.equal(r!.confidence, ConfidenceLevel.UNKNOWN);
    assert.ok(r!.recommendation_text.includes('project_financials'));
  });
});

describe('ruleBenchmarkHighRate / ruleLegacyRateWarning — evidence-count gate', () => {
  it('suppresses SAVINGS_IDENTIFIED when min_evidence_count_met is false, even if above_p75', () => {
    const bm: BenchmarkResult = {
      user_rate: 2500,
      stats: { min: 800, max: 2000, p25: 900, p50: 1200, p75: 1800, mean: 1300, count: 2 },
      position: 'above_p75',
      comparable_evidence_ids: ['REDDIT-004', 'WEB-011'],
      min_evidence_count_met: false,
    };
    assert.equal(ruleBenchmarkHighRate(bm), null);
  });

  it('suppresses legacy-rate WARNING when min_evidence_count_met is false, even if below_p25', () => {
    const bm: BenchmarkResult = {
      user_rate: 500,
      stats: { min: 800, max: 2000, p25: 900, p50: 1200, p75: 1800, mean: 1300, count: 2 },
      position: 'below_p25',
      comparable_evidence_ids: ['WEB-011'],
      min_evidence_count_met: false,
    };
    assert.equal(ruleLegacyRateWarning(bm), null);
  });
});
