// src/engine.ts — full wired pipeline (Step 9)

import type { UserInput, EngineResult, FreeResult, PaidReport, NegotiationOutput, BenchmarkResult, CandidateProduct, CounterfactualResult } from './types.js';
import { ResultType, ConfidenceLevel } from './types.js';
import { validateUserInput, assertUserInput } from './validation.js';
import { buildBenchmarkResult } from './benchmark.js';
import {
  ruleCommercialStructures, ruleAcvGrowth, ruleRateProtection,
  ruleBenchmarkHighRate, ruleLegacyRateWarning, ruleRenewalIncrease,
  ruleVerifiedSaving, ruleDiscountUnknown, ruleBundleOrPoolGuard,
  ruleRequirementGuard, ruleDependencyUnknown,
} from './rules.js';
import type { RuleResult } from './types.js';
import { generateCandidates } from './candidates.js';
import type { CandidateGenerationResult } from './candidates.js';
import { evaluateCandidates } from './counterfactual.js';
import type { CounterfactualSummary } from './counterfactual.js';
import { buildNegotiationOutput } from './negotiation.js';
import { buildFreeResult, buildPaidReport } from './report.js';

export interface EngineOutput {
  // Backward-compatible flat sorted list of rule results
  results: EngineResult[];
  benchmark: BenchmarkResult | null;
  warnings: string[];
  assumptions: string[];
  // Structured pipeline outputs (populated when product_inputs supplied)
  candidates: CandidateGenerationResult | null;
  counterfactual: CounterfactualSummary | null;
  negotiation: NegotiationOutput | null;
  free_result: FreeResult;
  paid_report: PaidReport;
}

const RESULT_PRIORITY: Record<ResultType, number> = {
  [ResultType.VERIFIED_BEFORE_AFTER]: 5,
  [ResultType.WARNING]: 4,
  [ResultType.SAVINGS_IDENTIFIED]: 3,
  [ResultType.OPPORTUNITY_NOT_QUANTIFIABLE]: 2,
  [ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED]: 1,
};

function sortByPriority(results: RuleResult[]): RuleResult[] {
  return [...results].sort((a, b) => RESULT_PRIORITY[b.result_type] - RESULT_PRIORITY[a.result_type]);
}

export function runEngine(raw: unknown): EngineOutput {
  const input = assertUserInput(raw);
  const validation = validateUserInput(raw);

  const ruleResults: RuleResult[] = [];
  const warnings: string[] = [];

  // ── Commercial structure rules ─────────────────────────────────────────────
  const commercial = ruleCommercialStructures(input);
  if (commercial) ruleResults.push(commercial);

  const acvGrowth = ruleAcvGrowth(input);
  if (acvGrowth) ruleResults.push(acvGrowth);

  const rateProtection = ruleRateProtection(input);
  if (rateProtection) ruleResults.push(rateProtection);

  const discountWarn = ruleDiscountUnknown(input);
  if (discountWarn) ruleResults.push(discountWarn);

  const bundleWarn = ruleBundleOrPoolGuard(input);
  if (bundleWarn) ruleResults.push(bundleWarn);

  // ── Benchmark ──────────────────────────────────────────────────────────────
  const benchmark = buildBenchmarkResult(input.acv_usd, input.annual_cost_usd, 'company');

  if (benchmark) {
    const highRate = ruleBenchmarkHighRate(benchmark);
    if (highRate) ruleResults.push(highRate);
    const legacyWarn = ruleLegacyRateWarning(benchmark);
    if (legacyWarn) ruleResults.push(legacyWarn);
  } else {
    warnings.push('No comparable evidence rows found for the provided ACV; benchmark skipped.');
  }

  // ── Renewal signal rules ───────────────────────────────────────────────────
  const renewalResult = ruleRenewalIncrease(input);
  if (renewalResult) ruleResults.push(renewalResult);

  // ── Before/after verified saving (flat rule path for backward compat) ──────
  const savingResult = ruleVerifiedSaving(input);
  if (savingResult) ruleResults.push(savingResult);

  // ── Requirement / dependency guard rules ───────────────────────────────────
  const reqGuard = ruleRequirementGuard(input);
  if (reqGuard) ruleResults.push(reqGuard);

  const depGuard = ruleDependencyUnknown(input);
  if (depGuard) ruleResults.push(depGuard);

  // ── Candidate + counterfactual pipeline ────────────────────────────────────
  let candidateResult: CandidateGenerationResult | null = null;
  let cfSummary: CounterfactualSummary | null = null;
  let negotiation: NegotiationOutput | null = null;

  if (input.product_inputs && input.product_inputs.length > 0) {
    candidateResult = generateCandidates(input);
    cfSummary = evaluateCandidates(input, candidateResult);
    negotiation = buildNegotiationOutput(input, cfSummary);

    // Add the overall classification as a rule result
    ruleResults.push({
      result_type: cfSummary.overall_result,
      confidence: ConfidenceLevel.UNKNOWN,
      recommendation_text: cfSummary.counterfactual_results[0]?.explanation ??
        'No defensible savings identified based on the provided inputs.',
      comparable_evidence: cfSummary.counterfactual_results[0]?.evidence_ids ?? [],
      explanation: cfSummary.global_assumptions.join(' '),
      dollar_saving: cfSummary.counterfactual_results[0]?.dollar_saving,
      assumptions: cfSummary.global_assumptions,
    });
  } else {
    // No product_inputs path.
    // If before/after quotes are present, VERIFIED_BEFORE_AFTER takes priority
    // over the generic OPPORTUNITY_NOT_QUANTIFIABLE guard.
    const hasBefore = typeof input.before_annual_cost_usd === 'number' && input.before_annual_cost_usd > 0;
    const hasAfter = typeof input.after_annual_cost_usd === 'number' && input.after_annual_cost_usd > 0;
    const verifiedSaving = (hasBefore && hasAfter)
      ? input.before_annual_cost_usd! - input.after_annual_cost_usd!
      : null;
    const fallbackOverall = (verifiedSaving != null && verifiedSaving > 0)
      ? ResultType.VERIFIED_BEFORE_AFTER
      : ResultType.OPPORTUNITY_NOT_QUANTIFIABLE;
    const fallbackCR = (verifiedSaving != null && verifiedSaving > 0) ? [{
      result_class: ResultType.VERIFIED_BEFORE_AFTER,
      candidate: { product_id: '__quote_pair__', usage: 'NOT_SURE' as never,
        requirement: 'NOT_SURE' as never, replacement: 'NOT_SURE' as never, dependency: 'NOT_SURE' as never },
      dollar_saving: verifiedSaving,
      assumptions: ['Saving is the arithmetic difference between the two user-supplied quotes.',
        'VERIFIED only when both quotes are official written Procore proposals for comparable configurations.'],
      evidence_ids: [],
      confidence: ConfidenceLevel.FACT,
      explanation: `The two quotes provided show a verified annual saving of $${verifiedSaving.toLocaleString()}.`,
    }] : [];

    ruleResults.push({
      result_type: ResultType.OPPORTUNITY_NOT_QUANTIFIABLE,
      confidence: ConfidenceLevel.UNKNOWN,
      recommendation_text:
        'Ask Procore for a written quote with your proposed configuration change, then compare that quote against your current contract.',
      comparable_evidence: [],
      explanation:
        'No per-product usage/requirement/dependency information was provided. ' +
        'Analysis is limited to benchmarking and commercial-structure rules.',
    });
    // Fallback counterfactual summary for report assembly
    cfSummary = {
      overall_result: fallbackOverall,
      counterfactual_results: fallbackCR,
      target_prices: [],
      global_assumptions: validation.warnings
        .filter((w) => w.severity === 'PREVENTS_CALCULATION')
        .map((w) => w.message),
    };
    candidateResult = { candidates: [], blocked: [], skipped_product_ids: [] };
  }

  // Surface PREVENTS_CALCULATION warnings from validation as engine warnings
  for (const w of validation.warnings) {
    if (w.severity === 'PREVENTS_CALCULATION') {
      warnings.push(w.message);
    }
  }

  // Deduplicate VERIFIED_BEFORE_AFTER: keep only the first (highest-priority) entry
  // This prevents ruleVerifiedSaving + cfSummary from both contributing the same result type
  let seenVerified = false;
  const deduped = ruleResults.filter((r) => {
    if (r.result_type === ResultType.VERIFIED_BEFORE_AFTER) {
      if (seenVerified) return false;
      seenVerified = true;
    }
    return true;
  });

  const sorted = sortByPriority(deduped);

  const freeResult = buildFreeResult(input, cfSummary, benchmark);
  const paidReport = buildPaidReport(input, candidateResult, cfSummary, benchmark, negotiation);

  return {
    results: sorted,
    benchmark,
    warnings,
    assumptions: cfSummary.global_assumptions,
    candidates: candidateResult,
    counterfactual: cfSummary,
    negotiation,
    free_result: freeResult,
    paid_report: paidReport,
  };
}
