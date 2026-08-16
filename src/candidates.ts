// src/candidates.ts — candidate generation (Step 5)

import type { UserInput, CandidateProduct } from './types.js';
import { UsageRating } from './types.js';
import { evaluateProductEligibility } from './products.js';

export interface CandidateGenerationResult {
  candidates: CandidateProduct[];
  blocked: CandidateProduct[];
  skipped_product_ids: string[];
}

export function generateCandidates(input: UserInput): CandidateGenerationResult {
  if (!input.product_inputs || input.product_inputs.length === 0) {
    return { candidates: [], blocked: [], skipped_product_ids: [] };
  }

  const candidates: CandidateProduct[] = [];
  const blocked: CandidateProduct[] = [];
  const skipped: string[] = [];

  for (const p of input.product_inputs) {
    if (p.usage === UsageRating.CRITICAL || p.usage === UsageRating.REGULAR) {
      skipped.push(p.product_id);
      continue;
    }

    const elig = evaluateProductEligibility(p.product_id, p.requirement, p.dependency);

    const base: CandidateProduct = {
      product_id: p.product_id,
      usage: p.usage,
      requirement: p.requirement,
      replacement: p.replacement,
      dependency: p.dependency,
      annual_price_usd: p.annual_price_usd,
    };

    if (elig.eligibility === 'BLOCKED') {
      blocked.push({ ...base, blocked_reason: elig.reasons.join('; ') });
    } else if (elig.eligibility === 'UNCERTAIN') {
      candidates.push({ ...base, blocked_reason: elig.reasons.join('; ') });
    } else {
      candidates.push(base);
    }
  }

  return { candidates, blocked, skipped_product_ids: skipped };
}

export function hasNoDefensiblePath(result: CandidateGenerationResult): boolean {
  return result.candidates.length === 0;
}
