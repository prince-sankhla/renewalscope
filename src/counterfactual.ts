// src/counterfactual.ts — counterfactual pricing and result classification (Step 6)

import type {
  UserInput,
  CandidateProduct,
  CounterfactualResult,
  TargetSavingsPct,
} from './types.js';
import {
  ResultType,
  ConfidenceLevel,
  DiscountStatus,
  BundleStructure,
} from './types.js';
import type { CandidateGenerationResult } from './candidates.js';

export interface TargetPriceResult {
  product_id: string;
  current_spend: number;
  target_savings_pct: number;
  max_acceptable_price: number;
}

export interface CounterfactualSummary {
  overall_result: ResultType;
  counterfactual_results: CounterfactualResult[];
  target_prices: TargetPriceResult[];
  global_assumptions: string[];
}

export function evaluateCandidates(
  input: UserInput,
  generation: CandidateGenerationResult,
): CounterfactualSummary {
  const target_prices: TargetPriceResult[] = [];
  const global_assumptions: string[] = [];

  if (
    input.discount_status === DiscountStatus.DONT_KNOW ||
    input.discount_status === undefined
  ) {
    global_assumptions.push(
      'Discount status unknown: any savings estimate depending on the current discount surviving a reconfiguration cannot be defended.',
    );
  }

  if (
    input.bundle_structure === BundleStructure.BUNDLED ||
    input.bundle_structure === BundleStructure.POOLED
  ) {
    const label = input.bundle_structure === BundleStructure.BUNDLED ? 'bundled' : 'pooled-volume';
    global_assumptions.push(
      `Contract uses a ${label} structure: line-item removal does not automatically reduce total renewal by the attributable line-item amount.`,
    );
  }

  if (generation.candidates.length === 0) {
    return {
      overall_result: ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED,
      counterfactual_results: [],
      target_prices: [],
      global_assumptions,
    };
  }

  // VERIFIED_BEFORE_AFTER path: user supplied comparable before/after quotes
  const hasBefore =
    typeof input.before_annual_cost_usd === 'number' && input.before_annual_cost_usd > 0;
  const hasAfter =
    typeof input.after_annual_cost_usd === 'number' && input.after_annual_cost_usd > 0;

  if (hasBefore && hasAfter) {
    const saving = input.before_annual_cost_usd! - input.after_annual_cost_usd!;
    const candidate = generation.candidates[0];

    const result: CounterfactualResult = {
      result_class: saving > 0 ? ResultType.VERIFIED_BEFORE_AFTER : ResultType.WARNING,
      candidate,
      dollar_saving: saving > 0 ? saving : undefined,
      assumptions: [
        ...global_assumptions,
        'Saving is the arithmetic difference between the two user-supplied quotes.',
        'VERIFIED_BEFORE_AFTER only when both quotes are official written Procore proposals for comparable configurations.',
      ],
      evidence_ids: [],
      confidence: ConfidenceLevel.FACT,
      explanation:
        saving > 0
          ? `The two user-supplied quotes differ by $${saving.toLocaleString()}/year. This is a verified quote-to-quote difference. Whether this difference is attributable to a specific product removal cannot be determined from the quote amounts alone — request a written quote confirming which configuration changed.`
          : 'The after-restructuring cost equals or exceeds the current cost. No saving is achieved by this change.',
    };

    return {
      overall_result: result.result_class,
      counterfactual_results: [result],
      target_prices: [],
      global_assumptions,
    };
  }

  // Per-candidate evaluation
  const counterfactual_results: CounterfactualResult[] = [];
  let bestResult = ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED;

  for (const candidate of generation.candidates) {
    const result = evaluateSingleCandidate(candidate, input, global_assumptions);
    counterfactual_results.push(result);

    if (
      input.target_savings_pct != null &&
      result.result_class !== ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED
    ) {
      target_prices.push(calcTargetPrice(input, candidate, input.target_savings_pct));
    }

    if (resultPriority(result.result_class) > resultPriority(bestResult)) {
      bestResult = result.result_class;
    }
  }

  return {
    overall_result: bestResult,
    counterfactual_results,
    target_prices,
    global_assumptions,
  };
}

function evaluateSingleCandidate(
  candidate: CandidateProduct,
  input: UserInput,
  globalAssumptions: string[],
): CounterfactualResult {
  const assumptions = [...globalAssumptions];
  const spendNote = candidate.annual_price_usd
    ? ` Your current attributable spend is $${candidate.annual_price_usd.toLocaleString()}/year.`
    : '';

  // Uncertain — eligibility not confirmed (dependency or requirement unresolved)
  if (candidate.blocked_reason) {
    return {
      result_class: ResultType.OPPORTUNITY_NOT_QUANTIFIABLE,
      candidate,
      assumptions,
      evidence_ids: [],
      confidence: ConfidenceLevel.UNKNOWN,
      explanation:
        `${candidate.product_id} may be an optimization candidate, but removal cannot be confirmed safe.${spendNote} ` +
        `Confirmation needed: ${candidate.blocked_reason} ` +
        'Request a comparable quote before treating this as a dollar saving.',
    };
  }

  // Commercial structure prevents defensible calculation even for clean candidates
  const preventsCalc =
    input.discount_status === DiscountStatus.DONT_KNOW ||
    input.discount_status === undefined ||
    input.bundle_structure === BundleStructure.BUNDLED ||
    input.bundle_structure === BundleStructure.POOLED;

  if (preventsCalc) {
    return {
      result_class: ResultType.OPPORTUNITY_NOT_QUANTIFIABLE,
      candidate,
      assumptions,
      evidence_ids: [],
      confidence: ConfidenceLevel.UNKNOWN,
      explanation:
        `${candidate.product_id} is reported as not actively used and no known requirement prevents a configuration change.${spendNote} ` +
        'However, commercial structure or discount uncertainty prevents a defensible savings calculation. ' +
        'Request a comparable written quote before treating this as a dollar saving.',
    };
  }

  // Clean ELIGIBLE candidate, no quotes, insufficient evidence for a defensible range
  // Per spec: never use the current line-item price as savings; benchmark alone ≠ counterfactual price
  return {
    result_class: ResultType.OPPORTUNITY_NOT_QUANTIFIABLE,
    candidate,
    assumptions,
    evidence_ids: [],
    confidence: ConfidenceLevel.UNKNOWN,
    explanation:
      `${candidate.product_id} is reported as not actively used and no known requirement prevents a configuration change.${spendNote} ` +
      'However, available evidence is insufficient to defensibly determine the resulting renewal price. ' +
      'Request a comparable quote before treating this as a dollar saving.',
  };
}

export function calcTargetPrice(
  input: UserInput,
  candidate: CandidateProduct,
  targetPct: NonNullable<TargetSavingsPct>,
): TargetPriceResult {
  const maxAcceptable = Math.round(input.annual_cost_usd * (1 - targetPct / 100) * 100) / 100;
  return {
    product_id: candidate.product_id,
    current_spend: input.annual_cost_usd,
    target_savings_pct: targetPct,
    max_acceptable_price: maxAcceptable,
  };
}

function resultPriority(r: ResultType): number {
  switch (r) {
    case ResultType.VERIFIED_BEFORE_AFTER: return 5;
    case ResultType.WARNING: return 4;
    case ResultType.SAVINGS_IDENTIFIED: return 3;
    case ResultType.OPPORTUNITY_NOT_QUANTIFIABLE: return 2;
    case ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED: return 1;
    default: return 0;
  }
}
