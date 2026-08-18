import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runEngine } from '../src/engine.js';
import { isNoDefensibleSavingsResult, shouldShowProfessionalUpgrade } from '../src/freemium.js';
import { DependencyFlag, ReplacementOption, RequirementStatus, UsageRating } from '../src/types.js';

const baseline = {
  annual_cost_usd: 100000,
  acv_usd: 80000000,
  products: ['project_management'],
  contract_term: 'annual' as const,
};

describe('freemium gating', () => {
  it('does not promote or unlock Professional Report for no-defensible-savings results', () => {
    const output = runEngine({
      ...baseline,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.CRITICAL,
        requirement: RequirementStatus.BUSINESS_CRITICAL,
        replacement: ReplacementOption.NO_REPLACEMENT,
        dependency: DependencyFlag.YES,
      }],
    });

    assert.equal(isNoDefensibleSavingsResult(output), true);
    assert.equal(shouldShowProfessionalUpgrade(output), false);
  });

  it('promotes Professional Report for a legitimate optimization candidate', () => {
    const output = runEngine({
      ...baseline,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.NOT_NEEDED,
        dependency: DependencyFlag.NO,
      }],
    });

    assert.equal(shouldShowProfessionalUpgrade(output), true);
  });

  it('promotes Professional Report for a candidate with verified savings', () => {
    const output = runEngine({
      ...baseline,
      before_annual_cost_usd: 100000,
      after_annual_cost_usd: 85000,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.NOT_NEEDED,
        dependency: DependencyFlag.NO,
      }],
    });

    assert.equal(output.free_result.savings_amount, 15000);
    assert.equal(shouldShowProfessionalUpgrade(output), true);
  });
});
