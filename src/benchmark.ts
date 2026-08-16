// src/benchmark.ts — rate calculation, comparable matching, benchmark positioning

import type { EvidenceRow, RateStats, BenchmarkResult, RatePosition } from './types.js';
import { EvidenceConfidence } from './types.js';
import { EVIDENCE_ROWS } from './evidence.js';

export function calcEffectiveRate(annual_cost_usd: number, acv_usd: number): number {
  if (acv_usd <= 0) throw new Error('acv_usd must be positive');
  return (annual_cost_usd / acv_usd) * 1_000_000;
}

// Returns rows that have a rate_per_1m and whose acvType matches the user's ACV band.
// We do NOT mix project-value rows with company-ACV rows per EVID-002.
export function findComparableRows(
  user_acv: number,
  acvType: 'company' | 'project' | 'unknown',
  rows: EvidenceRow[] = EVIDENCE_ROWS,
): EvidenceRow[] {
  const acvLow = user_acv * 0.1;
  const acvHigh = user_acv * 10;

  return rows.filter((r) => {
    if (r.confidence === EvidenceConfidence.DUPLICATE) return false;
    if (r.rate_per_1m === undefined) return false;
    if (r.acvType === 'project' && acvType === 'company') return false;
    if (r.acvType === 'company' && acvType === 'project') return false;
    if (r.acv_usd !== undefined && (r.acv_usd < acvLow || r.acv_usd > acvHigh)) return false;
    return true;
  });
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function calcRateStats(rows: EvidenceRow[]): RateStats {
  const rates = rows
    .map((r) => r.rate_per_1m!)
    .filter((v) => v !== undefined)
    .sort((a, b) => a - b);

  if (rates.length === 0) {
    return { min: 0, max: 0, p25: 0, p50: 0, p75: 0, mean: 0, count: 0 };
  }

  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;

  return {
    min: rates[0],
    max: rates[rates.length - 1],
    p25: percentile(rates, 25),
    p50: percentile(rates, 50),
    p75: percentile(rates, 75),
    mean,
    count: rates.length,
  };
}

export function ratePosition(rate: number, stats: RateStats): RatePosition {
  if (rate < stats.p25) return 'below_p25';
  if (rate < stats.p50) return 'p25_to_p50';
  if (rate < stats.p75) return 'p50_to_p75';
  return 'above_p75';
}

export function buildBenchmarkResult(
  user_acv: number,
  user_annual_cost: number,
  acvType: 'company' | 'project' | 'unknown' = 'company',
): BenchmarkResult | null {
  const comparables = findComparableRows(user_acv, acvType);
  if (comparables.length === 0) return null;

  const user_rate = calcEffectiveRate(user_annual_cost, user_acv);
  const stats = calcRateStats(comparables);
  const position = ratePosition(user_rate, stats);

  return {
    user_rate,
    stats,
    position,
    comparable_evidence_ids: comparables.map((r) => r.evidence_id),
    min_evidence_count_met: comparables.length >= 3,
  };
}
