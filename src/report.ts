// src/report.ts — Step 8: FreeResult and PaidReport assembly

import type {
  UserInput,
  FreeResult,
  PaidReport,
  ProductInput,
  CandidateProduct,
  NegotiationOutput,
  BenchmarkResult,
  RatePosition,
  ConfidenceLevel,
} from './types.js';
import { ResultType } from './types.js';
import type { CandidateGenerationResult } from './candidates.js';
import type { CounterfactualSummary } from './counterfactual.js';

function headline(verdict: ResultType): string {
  switch (verdict) {
    case ResultType.VERIFIED_BEFORE_AFTER: return 'Verified savings identified';
    case ResultType.SAVINGS_IDENTIFIED: return 'Potential savings identified';
    case ResultType.OPPORTUNITY_NOT_QUANTIFIABLE:
      return 'Optimization opportunity identified — savings not yet quantifiable';
    case ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED:
      return 'No defensible savings identified';
    default: return 'Analysis complete';
  }
}

function primaryConfidenceLevel(summary: CounterfactualSummary): ConfidenceLevel {
  const first = summary.counterfactual_results[0];
  return first?.confidence ?? ('UNKNOWN' as ConfidenceLevel);
}

function primaryOpportunity(summary: CounterfactualSummary): string | undefined {
  const first = summary.counterfactual_results[0];
  if (!first) return undefined;
  return first.explanation;
}

function keyWarnings(summary: CounterfactualSummary): string[] {
  return summary.global_assumptions.slice();
}

function whatToConfirm(summary: CounterfactualSummary): string[] {
  const items: string[] = [];
  for (const r of summary.counterfactual_results) {
    if (r.result_class === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
      items.push(
        `Request a written Procore quote for configuration without ${r.candidate.product_id} to determine the renewal impact.`,
      );
    }
  }
  if (items.length === 0) {
    items.push('Cross-check any estimate against your actual Procore renewal quote before making decisions.');
  }
  return items;
}

export function buildFreeResult(
  input: UserInput,
  summary: CounterfactualSummary,
  benchmark: BenchmarkResult | null,
): FreeResult {
  const verdict = summary.overall_result;

  let effective_rate: number | undefined;
  let benchmark_position: RatePosition | undefined;

  if (benchmark?.min_evidence_count_met) {
    effective_rate = benchmark.user_rate;
    benchmark_position = benchmark.position;
  }

  const first = summary.counterfactual_results[0];
  const savings_amount =
    verdict === ResultType.VERIFIED_BEFORE_AFTER && first?.dollar_saving != null
      ? first.dollar_saving
      : undefined;

  return {
    verdict,
    current_spend: input.annual_cost_usd,
    effective_rate,
    benchmark_position,
    main_opportunity: primaryOpportunity(summary),
    savings_amount,
    savings_range: undefined,       // SAVINGS_IDENTIFIED range not yet produced from evidence
    confidence: primaryConfidenceLevel(summary),
    explanation: headline(verdict),
    warnings: keyWarnings(summary),
    what_to_confirm: whatToConfirm(summary),
  };
}

export function buildPaidReport(
  input: UserInput,
  generation: CandidateGenerationResult,
  summary: CounterfactualSummary,
  benchmark: BenchmarkResult | null,
  negotiation: NegotiationOutput | null,
): PaidReport {
  const current_configuration: ProductInput[] = input.product_inputs ?? [];
  const candidate_configurations: CandidateProduct[][] = generation.candidates.length > 0
    ? [generation.candidates]
    : [];

  const evidence_trail = [
    ...new Set(summary.counterfactual_results.flatMap((r) => r.evidence_ids)),
  ];
  if (benchmark?.comparable_evidence_ids) {
    for (const id of benchmark.comparable_evidence_ids) {
      if (!evidence_trail.includes(id)) evidence_trail.push(id);
    }
  }

  const assumptions = [
    ...summary.global_assumptions,
    ...summary.counterfactual_results.flatMap((r) => r.assumptions),
  ];
  const seen = new Set<string>();
  const uniqueAssumptions = assumptions.filter((a) => {
    if (seen.has(a)) return false;
    seen.add(a);
    return true;
  });

  const dependency_findings = [
    ...generation.blocked.map(
      (b) => `${b.product_id} blocked: ${b.blocked_reason}`,
    ),
    ...generation.candidates
      .filter((c) => c.blocked_reason)
      .map((c) => `${c.product_id} uncertain: ${c.blocked_reason}`),
  ];

  const legacy_rate_warnings: string[] = [];
  if (benchmark?.min_evidence_count_met && benchmark.position === 'below_p25') {
    legacy_rate_warnings.push(
      `Your effective rate of $${benchmark.user_rate.toFixed(0)}/1M ACV appears favorable relative to comparable public observations. ` +
      'Confirm the commercial impact in writing before restructuring the contract.',
    );
  }

  const commercial_risks: string[] = [
    'Savings estimates are not verified unless explicitly marked VERIFIED_BEFORE_AFTER.',
    'Customer-specific pricing can differ from any benchmark or estimate shown.',
    'Discount and rate-protection terms may not survive a reconfiguration.',
  ];
  if (
    input.bundle_structure === 'BUNDLED' || input.bundle_structure === 'POOLED'
  ) {
    commercial_risks.push(
      'Bundled/pooled contract: removing a product may not reduce total renewal by the line-item amount.',
    );
  }

  const suggested_questions: string[] = [
    `Request a written quote for your current configuration with any candidate products removed.`,
    'Ask Procore to hold all other terms constant in the alternative quote.',
    'Ask whether your current discount and rate protection apply to the proposed configuration.',
  ];
  if (input.contract_term === 'annual') {
    suggested_questions.push(
      'Ask whether a multi-year pooled agreement would provide a renewal rate cap.',
    );
  }
  if (input.target_savings_pct != null && summary.target_prices.length > 0) {
    const tp = summary.target_prices[0];
    suggested_questions.push(
      `Target negotiation maximum: $${tp.max_acceptable_price.toLocaleString()} (${tp.target_savings_pct}% below current spend). ` +
      'Label this as your walk-away price, not an expected Procore quote.',
    );
  }

  const renewal_strategy =
    summary.overall_result === ResultType.VERIFIED_BEFORE_AFTER
      ? 'You have a verified savings opportunity. Present both quotes to Procore and negotiate the lower-cost configuration.'
      : summary.overall_result === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE
        ? 'Request a written comparable quote for the candidate configuration. ' +
          'Do not negotiate on the basis of the current line-item price alone.'
        : 'No configuration change with a defensible saving was identified. ' +
          'Focus on renewal rate protection and multi-year structure options.';

  const audit_trail = [
    `Analysis date: ${new Date().toISOString().split('T')[0]}`,
    `Input: annual_cost_usd=${input.annual_cost_usd}, acv_usd=${input.acv_usd}, contract_term=${input.contract_term}`,
    `Candidates evaluated: ${generation.candidates.length}`,
    `Blocked products: ${generation.blocked.length}`,
    `Overall result: ${summary.overall_result}`,
    ...summary.counterfactual_results.map(
      (r) => `  ${r.candidate.product_id}: ${r.result_class}` +
        (r.dollar_saving != null ? ` ($${r.dollar_saving.toLocaleString()})` : ''),
    ),
  ];

  return {
    current_configuration,
    candidate_configurations,
    counterfactual_results: summary.counterfactual_results,
    benchmark: benchmark ?? undefined,
    evidence_trail,
    assumptions: uniqueAssumptions,
    confidence_rationale:
      `Overall confidence: ${primaryConfidenceLevel(summary)}. ` +
      'Financial claims are deterministic from user inputs and explicit assumptions. ' +
      'No LLM-generated numbers are used in calculations.',
    dependency_findings,
    legacy_rate_warnings,
    commercial_risks,
    negotiation: negotiation ?? undefined,
    suggested_questions,
    renewal_strategy,
    audit_trail,
  };
}
