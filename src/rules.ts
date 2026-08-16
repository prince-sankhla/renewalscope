// src/rules.ts — all recommendation rules driven by the final implementation contract

import type {
  UserInput,
  RuleResult,
  BenchmarkResult,
  ProductInput,
} from './types.js';
import {
  ConfidenceLevel,
  ResultType,
  RequirementStatus,
  DependencyFlag,
  DiscountStatus,
  BundleStructure,
} from './types.js';

// ── Rule A: Commercial structure rules ────────────────────────────────────────

/**
 * Rule A1 — Multi-year / pooled-volume recommendation.
 * Annual term → ask about multi-year pool.
 * Multi-year term → ask about pooled-volume or rate-protection clause.
 * Source: Procore SEC filings (FACT).
 */
export function ruleCommercialStructures(input: UserInput): RuleResult | null {
  if (input.contract_term === 'multi_year') {
    return {
      result_type: ResultType.SAVINGS_IDENTIFIED,
      confidence: ConfidenceLevel.FACT,
      recommendation_text:
        'Ask Procore whether a pooled-volume or renewal-rate-protection clause is available within your multi-year agreement.',
      comparable_evidence: [],
      explanation:
        'Procore SEC filings confirm that multi-year and pooled-volume structures exist as official commercial options. ' +
        'Whether your specific account qualifies is unconfirmed; request a written confirmation from your Procore rep.',
    };
  }

  return {
    result_type: ResultType.SAVINGS_IDENTIFIED,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      'Ask Procore whether converting to a multi-year pooled agreement would provide a renewal rate cap.',
    comparable_evidence: [],
    explanation:
      'Procore offers multi-year and pooled-volume structures (per SEC filings). ' +
      'Your current annual contract may be eligible to convert; eligibility and any price change are unconfirmed without a quote.',
  };
}

/**
 * Rule A2 — ACV growth: pre-priced volume discussion.
 * If expected next-year ACV > current ACV × 1.15, surface the option to ask about
 * pre-priced volume treatment before the ACV increase is reflected in the renewal quote.
 * Source: commercial model evidence (FACT that the structure exists; eligibility unconfirmed).
 */
export function ruleAcvGrowth(input: UserInput): RuleResult | null {
  if (
    input.expected_next_year_acv_usd === undefined ||
    input.expected_next_year_acv_usd <= input.acv_usd * 1.15
  ) {
    return null;
  }

  return {
    result_type: ResultType.SAVINGS_IDENTIFIED,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      'Your expected ACV growth exceeds 15%. Ask Procore whether your renewal can pre-price the additional volume at today\'s rate before the increase is applied.',
    comparable_evidence: [],
    explanation:
      'Procore pricing is generally based on contracted ACV. A significant ACV increase can materially raise the renewal cost. ' +
      'Asking to pre-price the incremental volume is a documented commercial structure option; eligibility is account-specific.',
  };
}

/**
 * Rule A3 — Rate protection.
 * 1-year term or rate protection status unclear → ask whether renewal rate protection can be added.
 */
export function ruleRateProtection(input: UserInput): RuleResult | null {
  const noProtection =
    input.contract_term === 'annual' ||
    input.rate_protection_status === 'unclear' ||
    input.rate_protection_status === 'none';

  if (!noProtection) return null;

  return {
    result_type: ResultType.SAVINGS_IDENTIFIED,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      'Ask Procore whether a renewal rate-protection clause can be added to limit future annual increases.',
    comparable_evidence: ['REDDIT-001'],
    explanation:
      'Customer evidence (REDDIT-001) shows renewal increases of 10%+ are possible. ' +
      'Rate-protection language is a documented commercial structure; whether it is available for your account is unconfirmed without a quote.',
  };
}

// ── Rule B: Benchmark positioning rules ───────────────────────────────────────

/**
 * Rule B1 — High effective rate (above p75).
 * Only fires when min_evidence_count_met is true.
 */
export function ruleBenchmarkHighRate(benchmark: BenchmarkResult): RuleResult | null {
  if (!benchmark.min_evidence_count_met) return null;
  if (benchmark.position !== 'above_p75') return null;

  return {
    result_type: ResultType.SAVINGS_IDENTIFIED,
    confidence: ConfidenceLevel.BENCHMARK,
    recommendation_text:
      `Your effective rate of $${benchmark.user_rate.toFixed(0)}/1M ACV sits above the 75th percentile of comparable public observations ` +
      `(range $${benchmark.stats.min.toFixed(0)}–$${benchmark.stats.max.toFixed(0)}/1M, n=${benchmark.stats.count}). ` +
      'Ask Procore for a rate comparison relative to current market conditions.',
    comparable_evidence: benchmark.comparable_evidence_ids,
    explanation:
      'This is a directional benchmark from public customer observations, not an official Procore price list. ' +
      'Do not cite this as a guaranteed saving. Use it to frame a negotiation question.',
  };
}

/**
 * Rule B2 — Legacy-rate warning (below p25).
 * An unusually favorable rate should trigger a restructuring risk warning, not a savings claim.
 * Only fires when min_evidence_count_met is true.
 */
export function ruleLegacyRateWarning(benchmark: BenchmarkResult): RuleResult | null {
  if (!benchmark.min_evidence_count_met) return null;
  if (benchmark.position !== 'below_p25') return null;

  return {
    result_type: ResultType.WARNING,
    confidence: ConfidenceLevel.BENCHMARK,
    recommendation_text:
      `Your effective rate of $${benchmark.user_rate.toFixed(0)}/1M ACV appears favorable relative to comparable public observations ` +
      `(p25=$${benchmark.stats.p25.toFixed(0)}/1M, n=${benchmark.stats.count}). ` +
      'Confirm the commercial impact in writing before restructuring the contract; changing a legacy configuration can expose you to current-market pricing.',
    comparable_evidence: benchmark.comparable_evidence_ids,
    explanation:
      'Do not recommend restructuring solely because a benchmark suggests a lower current-market rate. ' +
      'This observation is directional; it is not proof that your rate is negotiable downward.',
  };
}

// ── Rule C: Renewal increase ──────────────────────────────────────────────────

/**
 * Rule C1 — Renewal increase flag.
 * Thresholds (>5%, >14%) are evidence-linked observations from REDDIT-001.
 * Never present them as universal Procore policy.
 */
export function ruleRenewalIncrease(input: UserInput): RuleResult | null {
  if (input.renewal_increase_pct === undefined) return null;

  if (input.renewal_increase_pct > 14) {
    return {
      result_type: ResultType.WARNING,
      confidence: ConfidenceLevel.OBSERVATION,
      recommendation_text:
        `Your reported renewal increase of ${input.renewal_increase_pct}% exceeds the highest increase reported in the evidence dataset (14%). ` +
        'Ask Procore for a written justification and request renewal-rate protection.',
      comparable_evidence: ['REDDIT-001'],
      explanation:
        'REDDIT-001 reports a rep saying the highest renewal seen was 14%. Your figure exceeds this. ' +
        'This is OBSERVATION-level evidence from a single customer interaction, not an official Procore cap.',
    };
  }

  if (input.renewal_increase_pct > 5) {
    return {
      result_type: ResultType.WARNING,
      confidence: ConfidenceLevel.OBSERVATION,
      recommendation_text:
        `Your renewal increase of ${input.renewal_increase_pct}% is above the typical 2–5% range reported in customer evidence. ` +
        'Ask Procore for a written justification and request renewal-rate protection language.',
      comparable_evidence: ['REDDIT-001'],
      explanation:
        'REDDIT-001 reports a customer saying typical increases are 2–5%. ' +
        'This is OBSERVATION-level evidence, not an official Procore policy.',
    };
  }

  return null;
}

// ── Rule D: Discount and bundle/pool guards ───────────────────────────────────

/**
 * Rule D1 — Discount unknown.
 * When discount status is DONT_KNOW, flag that the discount may not survive reconfiguration.
 * Never silently assume the current discount carries forward.
 */
export function ruleDiscountUnknown(input: UserInput): RuleResult | null {
  if (input.discount_status !== DiscountStatus.DONT_KNOW) return null;

  return {
    result_type: ResultType.WARNING,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      'Your current discount status is unknown. Before requesting any configuration change, confirm in writing whether your existing discount applies to the proposed configuration.',
    comparable_evidence: [],
    explanation:
      'Procore discounts are account- and configuration-specific. ' +
      'A discount on the current contract does not automatically transfer to a reconfigured renewal. ' +
      'Any savings estimate that depends on a discount surviving the change would be unreliable.',
  };
}

/**
 * Rule D2 — Bundled / pooled-volume structure warning.
 * In a bundled or pooled contract, removing a line item does not automatically reduce
 * the total renewal by that line-item amount.
 */
export function ruleBundleOrPoolGuard(input: UserInput): RuleResult | null {
  if (
    input.bundle_structure !== BundleStructure.BUNDLED &&
    input.bundle_structure !== BundleStructure.POOLED
  ) {
    return null;
  }

  const structureLabel =
    input.bundle_structure === BundleStructure.BUNDLED ? 'bundled' : 'pooled-volume';

  return {
    result_type: ResultType.WARNING,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      `Your contract appears to use a ${structureLabel} commercial structure. ` +
      'Request a written quote for the proposed configuration before assuming a line-item removal will reduce your renewal by that line-item amount.',
    comparable_evidence: [],
    explanation:
      'In a bundled or pooled contract, the renewal price reflects the overall structure, not the sum of independent line items. ' +
      'Removing a product may not reduce total cost by the attributable line-item amount. ' +
      'A comparable written quote is required before any savings can be claimed.',
  };
}

// ── Rule E: Requirement / dependency guards ────────────────────────────────────

/**
 * Rule E1 — Requirement block.
 * If any product_input is flagged as required (business-critical, client-contract, or internal-policy),
 * emit a WARNING. This does not block candidate generation itself (that happens in candidates.ts),
 * but ensures the engine surface always contains the guard.
 */
export function ruleRequirementGuard(input: UserInput): RuleResult | null {
  if (!input.product_inputs || input.product_inputs.length === 0) return null;

  const required = input.product_inputs.filter((p: ProductInput) =>
    p.requirement === RequirementStatus.BUSINESS_CRITICAL ||
    p.requirement === RequirementStatus.CLIENT_CONTRACT ||
    p.requirement === RequirementStatus.INTERNAL_POLICY,
  );

  if (required.length === 0) return null;

  const labels = required.map((p: ProductInput) => p.product_id).join(', ');

  return {
    result_type: ResultType.WARNING,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      `The following products are marked as required: ${labels}. ` +
      'These have been excluded from optimization candidates. Do not recommend removal.',
    comparable_evidence: [],
    explanation:
      'A product required by client contract, internal policy, or business-critical workflow must not be treated as a removal candidate. ' +
      'Verify the requirement in writing before reconsidering.',
  };
}

/**
 * Rule E2 — Dependency unknown.
 * If any product_input dependency is NOT_SURE, the engine cannot safely model removal.
 * Emit OPPORTUNITY_NOT_QUANTIFIABLE to surface the uncertainty.
 */
export function ruleDependencyUnknown(input: UserInput): RuleResult | null {
  if (!input.product_inputs || input.product_inputs.length === 0) return null;

  const uncertain = input.product_inputs.filter(
    (p: ProductInput) => p.dependency === DependencyFlag.NOT_SURE,
  );

  if (uncertain.length === 0) return null;

  const labels = uncertain.map((p: ProductInput) => p.product_id).join(', ');

  return {
    result_type: ResultType.OPPORTUNITY_NOT_QUANTIFIABLE,
    confidence: ConfidenceLevel.UNKNOWN,
    recommendation_text:
      `Dependency status is unconfirmed for: ${labels}. ` +
      'Resolve whether a technical or workflow dependency exists before treating these as removal candidates.',
    comparable_evidence: [],
    explanation:
      'The engine cannot assume removability when a dependency is unknown. ' +
      'Confirm the dependency status before advancing these products to counterfactual pricing.',
  };
}

// ── Rule F: Verified before/after saving ──────────────────────────────────────

/**
 * Rule F1 — Verified saving from two comparable written quotes.
 * This is the strongest result class. Only use when both quotes are official
 * written Procore proposals for comparable configurations.
 */
export function ruleVerifiedSaving(input: UserInput): RuleResult | null {
  if (input.before_annual_cost_usd === undefined || input.after_annual_cost_usd === undefined) {
    return null;
  }

  const saving = input.before_annual_cost_usd - input.after_annual_cost_usd;
  if (saving <= 0) {
    return {
      result_type: ResultType.WARNING,
      confidence: ConfidenceLevel.FACT,
      recommendation_text:
        'The after-restructuring cost equals or exceeds the current cost. No saving is achieved by this change.',
      comparable_evidence: [],
      explanation: 'before_annual_cost_usd minus after_annual_cost_usd is not positive.',
    };
  }

  return {
    result_type: ResultType.VERIFIED_BEFORE_AFTER,
    confidence: ConfidenceLevel.FACT,
    recommendation_text:
      `The two quotes you provided show a verified annual saving of $${saving.toLocaleString()}.`,
    comparable_evidence: [],
    explanation:
      'Saving is calculated as the difference between the two user-supplied quotes. ' +
      'This is a VERIFIED_BEFORE_AFTER result only if both quotes are official written Procore proposals for comparable configurations.',
    dollar_saving: saving,
  };
}

// ── Rule G: Configuration change guard ────────────────────────────────────────

/**
 * Rule G1 — Configuration change OPPORTUNITY_NOT_QUANTIFIABLE guard.
 * Fires unconditionally until Step 10 wires in candidate generation.
 * After that, this becomes conditional on the candidate evaluation outcome.
 */
export function ruleConfigurationUnknown(): RuleResult {
  return {
    result_type: ResultType.OPPORTUNITY_NOT_QUANTIFIABLE,
    confidence: ConfidenceLevel.UNKNOWN,
    recommendation_text:
      'Ask Procore for a written quote with your proposed configuration change, then compare that quote against your current contract.',
    comparable_evidence: [],
    explanation:
      'The evidence dataset does not establish a complete commercial product-dependency or removability matrix. ' +
      'No dollar saving can be claimed from a configuration change without a verified before/after quote pair.',
  };
}
