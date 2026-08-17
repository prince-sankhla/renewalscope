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
  EvidenceRow,
  QuoteEvidenceRecord,
  QuoteEvidenceSummary,
} from './types.js';
import { ResultType } from './types.js';
import type { CandidateGenerationResult } from './candidates.js';
import type { CounterfactualSummary } from './counterfactual.js';
import { getProductQuoteRows } from './evidence.js';
import { PUBLIC_QUOTE_ROWS, PUBLIC_QUOTES_DATASET_META } from './data/procore_public_quotes.js';

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

  const userProducts = input.product_inputs?.map(p => p.product_id) ?? input.products ?? [];
  const pqCount = getProductQuoteRows().filter(r => userProducts.includes(r.normalized_product_id ?? '')).length;
  const benchmark_evidence_note = pqCount > 0
    ? `${pqCount} public quote observation${pqCount > 1 ? 's' : ''} available for your product mix. Directional context only — not an official Procore price list.`
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
    benchmark_evidence_note,
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

  // Add credits assumption if present
  if (input.credits_usd != null && input.credits_usd > 0) {
    assumptions.push(
      `Credits of $${input.credits_usd.toLocaleString()} applied — effective rate reflects net annual spend after credits.`
    );
  }

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
  if (input.tier_changed === 'YES') {
    commercial_risks.push(
      'Pricing tier changed since last year — renewal pricing may reflect new tier structure.',
    );
  }
  if (input.packaging_changed === 'YES') {
    commercial_risks.push(
      'Packaging structure changed since last year — bundle lock-in risk may apply to current configuration.',
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
  if (input.rate_protection_status === 'active') {
    suggested_questions.push(
      'Invoke your rate protection clause if the renewal increase exceeds the contractual cap.',
    );
  }
  if (input.expected_next_year_acv_usd != null && input.expected_next_year_acv_usd > input.acv_usd * 1.15) {
    suggested_questions.push(
      `Expected ACV growth exceeds 15%. Ask whether your renewal can pre-price the additional volume at today's rate.`,
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

  function acvContext(r: EvidenceRow): string {
    if (r.acv_usd) return `$${(r.acv_usd / 1_000_000).toFixed(0)}M ACV`;
    if (r.acv_band_min_usd && r.acv_band_max_usd) {
      return `$${(r.acv_band_min_usd / 1_000_000).toFixed(0)}M–$${(r.acv_band_max_usd / 1_000_000).toFixed(0)}M ACV band`;
    }
    return 'ACV not disclosed';
  }

  const qeRecords: QuoteEvidenceRecord[] = PUBLIC_QUOTE_ROWS.map(r => ({
    evidence_id: r.evidence_id,
    source_description: r.source_description ?? '',
    product_reported: r.products?.[0] ?? r.normalized_product_id ?? 'Platform total',
    normalized_product_id: r.normalized_product_id,
    acv_context: acvContext(r),
    quoted_annual_price_usd: r.quoted_product_annual_price_usd ?? null,
    term: r.contract_term ?? 'Quote',
    limitation_flags: r.limitation_flags ?? [],
    what_it_supports: r.quoted_product_annual_price_usd
      ? `Observed public quote price for ${r.normalized_product_id ?? 'this product'} at ${acvContext(r)}`
      : 'Non-calculational context evidence',
    what_it_does_not_support: 'Universal module price or guaranteed removal saving for any customer',
    exclude_from_calculations: r.exclude_from_calculations === true,
  }));

  const usable = qeRecords.filter(r => !r.exclude_from_calculations && r.quoted_annual_price_usd !== null).length;
  const productsCovered = [...new Set(
    PUBLIC_QUOTE_ROWS
      .filter(r => r.normalized_product_id && !r.exclude_from_calculations)
      .map(r => r.normalized_product_id!)
  )];

  const quote_evidence_summary: QuoteEvidenceSummary = {
    dataset_name: PUBLIC_QUOTES_DATASET_META.dataset_name,
    total_records: PUBLIC_QUOTES_DATASET_META.total_records,
    usable_records: usable,
    excluded_records: PUBLIC_QUOTES_DATASET_META.total_records - usable,
    products_covered: productsCovered,
    records: qeRecords,
  };

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
    quote_evidence_summary,
  };
}
