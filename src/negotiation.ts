// src/negotiation.ts — Step 7: structured negotiation output

import type {
  UserInput,
  NegotiationOutput,
  CandidateProduct,
  CounterfactualResult,
} from './types.js';
import { ResultType, DiscountStatus, BundleStructure } from './types.js';
import type { CounterfactualSummary, TargetPriceResult } from './counterfactual.js';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function buildWhatToAsk(candidate: CandidateProduct, input: UserInput): string {
  const base = `Request a written quote from Procore for your current configuration with ${candidate.product_id} removed, holding all other contract terms constant.`;
  if (input.contract_term === 'annual') {
    return base + ' Also ask whether converting to a multi-year agreement would provide better pricing.';
  }
  return base;
}

function buildConfigRequested(candidate: CandidateProduct, input: UserInput): string {
  const others = input.products.filter((p) => p !== candidate.product_id);
  const otherStr = others.length > 0 ? others.join(', ') : 'remaining products';
  return `Current configuration minus ${candidate.product_id}; retaining ${otherStr}.`;
}

function buildUnknowns(candidate: CandidateProduct, input: UserInput): string[] {
  const unknowns: string[] = [
    'The resulting renewal price for the proposed configuration is not known until Procore provides a written quote.',
    'Whether your current discount rate will be preserved in the reconfigured contract.',
  ];
  if (candidate.blocked_reason) {
    unknowns.push(`Dependency/requirement confirmation still needed: ${candidate.blocked_reason}`);
  }
  if (
    input.bundle_structure === BundleStructure.BUNDLED ||
    input.bundle_structure === BundleStructure.POOLED
  ) {
    unknowns.push(
      'The commercial impact of removing a line item from a bundled/pooled contract structure is not known without a comparable written quote.',
    );
  }
  return unknowns;
}

function buildConfirmInWriting(candidate: CandidateProduct, input: UserInput): string[] {
  const items = [
    'A written Procore quote for the proposed configuration.',
    'Confirmation that the quoted price is comparable (same ACV, same term, same other products).',
    'Whether your current discount and rate protection apply to the reconfigured contract.',
  ];
  if (
    input.bundle_structure === BundleStructure.BUNDLED ||
    input.bundle_structure === BundleStructure.POOLED
  ) {
    items.push(
      `The commercial impact of removing ${candidate.product_id} from your current bundled/pooled pricing structure.`,
    );
  }
  if (candidate.blocked_reason?.includes('ERP') || candidate.product_id === 'project_financials') {
    items.push(
      'That removing Project Financials will not break your active ERP/accounting integration.',
    );
  }
  return items;
}

function buildRisks(candidate: CandidateProduct, input: UserInput): string[] {
  const risks: string[] = [
    'If your current contract has a favorable legacy rate, reconfiguration may expose you to current-market pricing.',
    'Removing a product without a written comparable quote means the actual savings cannot be verified in advance.',
  ];
  if (input.discount_status === DiscountStatus.DONT_KNOW) {
    risks.push(
      'Your current discount is unknown. It may not survive a reconfiguration, making the net saving smaller than expected.',
    );
  }
  if (candidate.blocked_reason) {
    risks.push(
      `Unresolved eligibility: ${candidate.blocked_reason} If this dependency exists, removal could disrupt active workflows.`,
    );
  }
  return risks;
}

export function buildNegotiationOutput(
  input: UserInput,
  summary: CounterfactualSummary,
): NegotiationOutput | null {
  if (summary.overall_result === ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED) return null;
  if (summary.counterfactual_results.length === 0) return null;

  // Use the first counterfactual result as the primary candidate
  const cfResult: CounterfactualResult = summary.counterfactual_results[0];
  const candidate = cfResult.candidate;

  const targetPriceEntry: TargetPriceResult | undefined = summary.target_prices.find(
    (tp) => tp.product_id === candidate.product_id,
  );

  const why =
    cfResult.result_class === ResultType.VERIFIED_BEFORE_AFTER
      ? `The two user-supplied quotes differ by $${fmt(cfResult.dollar_saving!)} per year. This is a verified quote-to-quote difference. This amount cannot automatically be attributed to the removal of a specific product without a written quote confirming the configuration change.`
      : `${candidate.product_id} has been identified as a potential optimization candidate. ` +
        `A comparable written quote is required to determine whether a defensible saving exists.`;

  return {
    what_to_ask: buildWhatToAsk(candidate, input),
    why,
    configuration_requested: buildConfigRequested(candidate, input),
    target_price: targetPriceEntry?.max_acceptable_price,
    max_acceptable_price: targetPriceEntry
      ? targetPriceEntry.max_acceptable_price
      : undefined,
    evidence_ids: cfResult.evidence_ids,
    unknowns: buildUnknowns(candidate, input),
    confirm_in_writing: buildConfirmInWriting(candidate, input),
    risks: buildRisks(candidate, input),
  };
}
