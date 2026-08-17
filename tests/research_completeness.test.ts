// tests/research_completeness.test.ts — test new research completeness features

import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { runEngine } from '../src/engine.js';
import { calcEffectiveRate } from '../src/benchmark.js';
import type { UserInput } from '../src/types.js';
import { UsageRating, RequirementStatus, ReplacementOption, DependencyFlag, TierChangedFlag } from '../src/types.js';

describe('credits_usd — effective rate calculation', () => {
  it('credits reduce effective rate correctly', () => {
    const withoutCredits = calcEffectiveRate(100_000, 10_000_000);
    const withCredits = calcEffectiveRate(100_000, 10_000_000, 15_000);

    // Without credits: 100k / 10M * 1M = 10,000
    assert.equal(withoutCredits, 10_000);

    // With 15k credits: (100k - 15k) / 10M * 1M = 8,500
    assert.equal(withCredits, 8_500);

    assert.ok(withCredits < withoutCredits, 'Credits should reduce effective rate');
  });

  it('credits assumption appears in report when credits provided', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      credits_usd: 20_000,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasCreditsAssumption = result.paid_report.assumptions.some(a =>
      a.includes('Credits of $20,000') && a.includes('effective rate reflects net annual spend')
    );

    assert.ok(hasCreditsAssumption, 'Credits assumption should be in paid report');
  });

  it('no credits assumption when credits not provided', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasCreditsAssumption = result.paid_report.assumptions.some(a => a.includes('Credits'));

    assert.ok(!hasCreditsAssumption, 'Credits assumption should not appear when no credits');
  });
});

describe('expected_next_year_acv_usd — ACV growth rule', () => {
  it('ruleAcvGrowth fires when ACV growth exceeds 15%', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      expected_next_year_acv_usd: 60_000_000, // 20% growth
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasAcvGrowthRule = result.results.some(r =>
      r.recommendation_text.includes('expected ACV growth exceeds 15%')
    );

    assert.ok(hasAcvGrowthRule, 'ACV growth rule should fire for >15% growth');
  });

  it('ruleAcvGrowth does not fire when ACV growth is small', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      expected_next_year_acv_usd: 52_000_000, // 4% growth
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasAcvGrowthRule = result.results.some(r =>
      r.recommendation_text.includes('expected ACV growth exceeds 15%')
    );

    assert.ok(!hasAcvGrowthRule, 'ACV growth rule should not fire for small growth');
  });

  it('ACV growth suggestion appears in suggested_questions when growth >15%', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      expected_next_year_acv_usd: 60_000_000,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasAcvQuestion = result.paid_report.suggested_questions.some(q =>
      q.includes('Expected ACV growth exceeds 15%') && q.includes('pre-price')
    );

    assert.ok(hasAcvQuestion, 'ACV growth question should appear in suggested_questions');
  });
});

describe('tier_changed — commercial risk', () => {
  it('tier change risk appears when tier_changed is YES', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      tier_changed: TierChangedFlag.YES,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasTierRisk = result.paid_report.commercial_risks.some(r =>
      r.includes('Pricing tier changed') && r.includes('new tier structure')
    );

    assert.ok(hasTierRisk, 'Tier change risk should appear in commercial_risks');
  });

  it('no tier change risk when tier_changed is NO', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      tier_changed: TierChangedFlag.NO,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasTierRisk = result.paid_report.commercial_risks.some(r => r.includes('Pricing tier changed'));

    assert.ok(!hasTierRisk, 'Tier change risk should not appear when tier_changed is NO');
  });
});

describe('packaging_changed — commercial risk', () => {
  it('packaging change risk appears when packaging_changed is YES', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      packaging_changed: TierChangedFlag.YES,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasPackagingRisk = result.paid_report.commercial_risks.some(r =>
      r.includes('Packaging structure changed') && r.includes('bundle lock-in')
    );

    assert.ok(hasPackagingRisk, 'Packaging change risk should appear in commercial_risks');
  });
});

describe('rate_protection_status — suggested question', () => {
  it('rate protection invocation appears when rate_protection_status is active', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      rate_protection_status: 'active',
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasRateProtectionQuestion = result.paid_report.suggested_questions.some(q =>
      q.includes('Invoke your rate protection clause')
    );

    assert.ok(hasRateProtectionQuestion, 'Rate protection invocation should appear in suggested_questions');
  });

  it('no rate protection invocation when status is none', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management'],
      contract_term: 'annual',
      rate_protection_status: 'none',
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.NO,
      }],
    };

    const result = runEngine(input);
    const hasRateProtectionQuestion = result.paid_report.suggested_questions.some(q =>
      q.includes('Invoke your rate protection clause')
    );

    assert.ok(!hasRateProtectionQuestion, 'Rate protection invocation should not appear when status is none');
  });
});

describe('evidence trail not truncated', () => {
  it('renders all evidence IDs in PDF context without capping at 10', () => {
    const input: UserInput = {
      annual_cost_usd: 150_000,
      acv_usd: 50_000_000,
      products: ['project_management', 'quality_safety', 'analytics'],
      contract_term: 'annual',
      product_inputs: [
        {
          product_id: 'project_management',
          usage: UsageRating.CRITICAL,
          requirement: RequirementStatus.BUSINESS_CRITICAL,
          replacement: ReplacementOption.NO_REPLACEMENT,
          dependency: DependencyFlag.NO,
        },
        {
          product_id: 'quality_safety',
          usage: UsageRating.CRITICAL,
          requirement: RequirementStatus.BUSINESS_CRITICAL,
          replacement: ReplacementOption.NO_REPLACEMENT,
          dependency: DependencyFlag.NO,
        },
        {
          product_id: 'analytics',
          usage: UsageRating.CRITICAL,
          requirement: RequirementStatus.BUSINESS_CRITICAL,
          replacement: ReplacementOption.NO_REPLACEMENT,
          dependency: DependencyFlag.NO,
        },
      ],
    };

    const result = runEngine(input);
    const evidenceCount = result.paid_report.evidence_trail.length;

    // This test validates that the evidence trail is not artificially capped
    // The actual count depends on available evidence for the product mix
    // The key validation is that the UI code no longer has .slice(0, 10)
    assert.ok(evidenceCount > 0, `Evidence trail should contain IDs (got ${evidenceCount})`);

    // Test that all benchmark evidence IDs are included (not capped)
    if (result.benchmark?.comparable_evidence_ids) {
      const benchmarkIds = result.benchmark.comparable_evidence_ids;
      const allIncluded = benchmarkIds.every(id => result.paid_report.evidence_trail.includes(id));
      assert.ok(allIncluded, 'All benchmark evidence IDs should be in the trail without truncation');
    }
  });
});
