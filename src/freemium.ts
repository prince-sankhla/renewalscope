import type { EngineOutput } from './engine.js';
import { ResultType } from './types.js';

type FreemiumAnalysis = Pick<EngineOutput, 'free_result' | 'candidates'>;

function optimizationCandidateCount(analysis: FreemiumAnalysis): number {
  return analysis.candidates?.candidates.length ?? 0;
}

/**
 * A no-defensible-savings result with no optimization candidates has no
 * Professional Report value to promote or unlock.
 */
export function isNoDefensibleSavingsResult(analysis: FreemiumAnalysis): boolean {
  return analysis.free_result.verdict === ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED &&
    optimizationCandidateCount(analysis) === 0;
}

/**
 * Professional access is meaningful only for a valid optimization candidate or
 * a positive, defensible savings result. This intentionally does not infer a
 * savings opportunity from a non-zero spend or a generic benchmark result.
 */
export function shouldShowProfessionalUpgrade(analysis: FreemiumAnalysis): boolean {
  if (isNoDefensibleSavingsResult(analysis)) return false;

  const verdict = analysis.free_result.verdict;
  const hasDefensibleSavings =
    (verdict === ResultType.VERIFIED_BEFORE_AFTER || verdict === ResultType.SAVINGS_IDENTIFIED) &&
    (analysis.free_result.savings_amount ?? 0) > 0;
  const hasMeaningfulOptimizationCandidate = optimizationCandidateCount(analysis) > 0 &&
    (verdict === ResultType.VERIFIED_BEFORE_AFTER ||
      verdict === ResultType.SAVINGS_IDENTIFIED ||
      verdict === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);

  return hasDefensibleSavings || hasMeaningfulOptimizationCandidate;
}
