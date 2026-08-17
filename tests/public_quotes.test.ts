// tests/public_quotes.test.ts — Phase 8 public quote evidence integration tests
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { PUBLIC_QUOTE_ROWS, PUBLIC_QUOTES_DATASET_META } from '../src/data/procore_public_quotes.js';
import { ALL_EVIDENCE_ROWS, EVIDENCE_ROWS, getProductQuoteRows } from '../src/evidence.js';
import { findComparableRows, findProductQuoteRows } from '../src/benchmark.js';
import { runEngine } from '../src/engine.js';
import {
  ResultType, DiscountStatus, BundleStructure,
  UsageRating, RequirementStatus, ReplacementOption, DependencyFlag,
} from '../src/types.js';

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    annual_cost_usd: 147596,
    acv_usd: 80_000_000,
    products: ['project_management', 'quality_safety', 'project_financials', 'invoice_management'],
    contract_term: 'annual',
    discount_status: DiscountStatus.PCT_KNOWN,
    discount_pct: 10,
    bundle_structure: BundleStructure.STANDARD,
    ...overrides,
  };
}

// ── Dataset integrity ─────────────────────────────────────────────────────────

describe('PUBLIC_QUOTE_ROWS dataset integrity', () => {
  it('row count matches metadata total_records', () => {
    assert.equal(PUBLIC_QUOTE_ROWS.length, PUBLIC_QUOTES_DATASET_META.total_records);
    assert.equal(PUBLIC_QUOTE_ROWS.length, 22);
  });

  it('all PQ rows have source_type === PUBLIC_QUOTE', () => {
    for (const r of PUBLIC_QUOTE_ROWS) {
      assert.equal(r.source_type, 'PUBLIC_QUOTE', `${r.evidence_id} missing source_type`);
    }
  });

  it('no PQ row has rate_per_1m defined', () => {
    for (const r of PUBLIC_QUOTE_ROWS) {
      assert.equal(r.rate_per_1m, undefined, `${r.evidence_id} should not have rate_per_1m`);
    }
  });

  it('all PQ rows have exclude_from_rate_benchmark === true', () => {
    for (const r of PUBLIC_QUOTE_ROWS) {
      assert.equal(r.exclude_from_rate_benchmark, true, `${r.evidence_id} should have exclude_from_rate_benchmark`);
    }
  });

  it('PQ-007, PQ-008, PQ-009, PQ-010 have exclude_from_calculations === true', () => {
    const ids = ['PQ-007', 'PQ-008', 'PQ-009', 'PQ-010'];
    for (const id of ids) {
      const row = PUBLIC_QUOTE_ROWS.find(r => r.evidence_id === id);
      assert.ok(row, `${id} not found`);
      assert.equal(row!.exclude_from_calculations, true, `${id} should be excluded from calculations`);
    }
  });

  it('PQ-012 has exclude_from_calculations === true', () => {
    const row = PUBLIC_QUOTE_ROWS.find(r => r.evidence_id === 'PQ-012');
    assert.ok(row, 'PQ-012 not found');
    assert.equal(row!.exclude_from_calculations, true);
  });

  it('PQ-021, PQ-022 have exclude_from_calculations === true', () => {
    for (const id of ['PQ-021', 'PQ-022']) {
      const row = PUBLIC_QUOTE_ROWS.find(r => r.evidence_id === id);
      assert.ok(row, `${id} not found`);
      assert.equal(row!.exclude_from_calculations, true, `${id} should be excluded from calculations`);
    }
  });

  it('PQ-012 has no quoted_product_annual_price_usd', () => {
    const row = PUBLIC_QUOTE_ROWS.find(r => r.evidence_id === 'PQ-012');
    assert.ok(row, 'PQ-012 not found');
    assert.equal(row!.quoted_product_annual_price_usd, undefined);
  });

  it('no PQ evidence_id appears in EVIDENCE_ROWS (no cross-contamination)', () => {
    const regularIds = new Set(EVIDENCE_ROWS.map(r => r.evidence_id));
    for (const r of PUBLIC_QUOTE_ROWS) {
      assert.equal(regularIds.has(r.evidence_id), false, `${r.evidence_id} cross-contaminates EVIDENCE_ROWS`);
    }
  });

  it('no duplicate evidence_id across ALL_EVIDENCE_ROWS', () => {
    const seen = new Set<string>();
    for (const r of ALL_EVIDENCE_ROWS) {
      assert.equal(seen.has(r.evidence_id), false, `Duplicate evidence_id: ${r.evidence_id}`);
      seen.add(r.evidence_id);
    }
  });

  it('all BAND_NORMALIZED records have acv_band_min_usd and acv_band_max_usd set', () => {
    const bandRows = PUBLIC_QUOTE_ROWS.filter(r => r.limitation_flags?.includes('BAND_NORMALIZED'));
    assert.ok(bandRows.length > 0, 'Expected some BAND_NORMALIZED rows');
    for (const r of bandRows) {
      assert.ok(r.acv_band_min_usd !== undefined, `${r.evidence_id} missing acv_band_min_usd`);
      assert.ok(r.acv_band_max_usd !== undefined, `${r.evidence_id} missing acv_band_max_usd`);
    }
  });
});

// ── Benchmark isolation ───────────────────────────────────────────────────────

describe('findComparableRows — PQ rows excluded from rate benchmark', () => {
  it('findComparableRows(80M, company) returns no PQ rows', () => {
    const rows = findComparableRows(80_000_000, 'company');
    const pqIds = new Set(PUBLIC_QUOTE_ROWS.map(r => r.evidence_id));
    for (const r of rows) {
      assert.equal(pqIds.has(r.evidence_id), false, `PQ row ${r.evidence_id} leaked into rate benchmark`);
    }
  });
});

// ── getProductQuoteRows ───────────────────────────────────────────────────────

describe('getProductQuoteRows', () => {
  it('excludes PQ-007/008/009/010/012/021/022', () => {
    const excluded = ['PQ-007', 'PQ-008', 'PQ-009', 'PQ-010', 'PQ-012', 'PQ-021', 'PQ-022'];
    const rows = getProductQuoteRows();
    const ids = rows.map(r => r.evidence_id);
    for (const id of excluded) {
      assert.equal(ids.includes(id), false, `${id} should not be in getProductQuoteRows()`);
    }
  });
});

// ── findProductQuoteRows ──────────────────────────────────────────────────────

describe('findProductQuoteRows', () => {
  it('returns at least one HIGH or MEDIUM result for project_management at 80M ACV', () => {
    const results = findProductQuoteRows('project_management', 80_000_000);
    const relevant = results.filter(m => m.comparability === 'HIGH' || m.comparability === 'MEDIUM');
    assert.ok(relevant.length > 0, 'Expected at least one HIGH/MEDIUM match for project_management at 80M');
  });

  it('PQ-002 (Simi Valley, acv=10M) is HIGH for quality_safety at 10M ACV', () => {
    const results = findProductQuoteRows('quality_safety', 10_000_000);
    const highIds = results.filter(m => m.comparability === 'HIGH').map(m => m.row.evidence_id);
    assert.ok(highIds.includes('PQ-002'), 'PQ-002 should be HIGH for quality_safety at 10M ACV');
  });

  it('Denton rows (PQ-007, PQ-008) never appear in findProductQuoteRows results', () => {
    const pmResults = findProductQuoteRows('project_management', 80_000_000);
    const qsResults = findProductQuoteRows('quality_safety', 80_000_000);
    const allIds = [...pmResults, ...qsResults].map(m => m.row.evidence_id);
    assert.equal(allIds.includes('PQ-007'), false, 'PQ-007 (Denton) should be excluded');
    assert.equal(allIds.includes('PQ-008'), false, 'PQ-008 (Denton) should be excluded');
  });

  it('PQ-012 never appears in findProductQuoteRows results', () => {
    const results = findProductQuoteRows('project_financials', 80_000_000);
    const ids = results.map(m => m.row.evidence_id);
    assert.equal(ids.includes('PQ-012'), false, 'PQ-012 should be excluded');
  });

  it('returns empty array for nonexistent product', () => {
    const results = findProductQuoteRows('nonexistent_product', 80_000_000);
    assert.equal(results.length, 0);
  });
});

// ── Engine integration ────────────────────────────────────────────────────────

describe('Engine — verified before/after path unaffected by public quotes', () => {
  it('verified before/after still produces $16,396 saving', () => {
    const input = baseInput({
      before_annual_cost_usd: 147596,
      after_annual_cost_usd: 131200,
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO,
      }],
    });
    const result = runEngine(input as Parameters<typeof runEngine>[0]);
    const cfResult = result.paid_report.counterfactual_results[0];
    assert.equal(cfResult.result_class, ResultType.VERIFIED_BEFORE_AFTER);
    assert.equal(cfResult.dollar_saving, 16396);
  });
});

describe('Engine — OPPORTUNITY_NOT_QUANTIFIABLE with public quote evidence wired in', () => {
  it('evidence_ids non-empty for project_management candidate at 80M ACV', () => {
    const input = baseInput({
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO,
      }],
    });
    const result = runEngine(input as Parameters<typeof runEngine>[0]);
    const cfResult = result.paid_report.counterfactual_results.find(
      r => r.candidate.product_id === 'project_management'
    );
    assert.ok(cfResult, 'Expected counterfactual result for project_management');
    assert.equal(cfResult!.result_class, ResultType.OPPORTUNITY_NOT_QUANTIFIABLE);
    assert.ok(cfResult!.evidence_ids.length > 0, 'Expected non-empty evidence_ids from public quotes');
  });

  it('no dollar_saving in any OPPORTUNITY_NOT_QUANTIFIABLE result even with public quote evidence', () => {
    const input = baseInput({
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO,
      }],
    });
    const result = runEngine(input as Parameters<typeof runEngine>[0]);
    for (const r of result.paid_report.counterfactual_results) {
      if (r.result_class === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
        assert.equal(r.dollar_saving, undefined, `${r.candidate.product_id} should have no dollar_saving`);
      }
    }
  });
});

describe('Engine — report fields', () => {
  it('paid_report.quote_evidence_summary is defined and has total_records === 22', () => {
    const input = baseInput({
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO,
      }],
    });
    const result = runEngine(input as Parameters<typeof runEngine>[0]);
    const qes = result.paid_report.quote_evidence_summary;
    assert.ok(qes !== undefined, 'quote_evidence_summary should be defined');
    assert.equal(qes!.total_records, 22);
  });

  it('free_result.benchmark_evidence_note is defined when user has matching products', () => {
    const input = baseInput({
      product_inputs: [{
        product_id: 'project_management',
        usage: UsageRating.NOT_USED,
        requirement: RequirementStatus.NOT_REQUIRED,
        replacement: ReplacementOption.ANOTHER_TOOL,
        dependency: DependencyFlag.NO,
      }],
    });
    const result = runEngine(input as Parameters<typeof runEngine>[0]);
    assert.ok(result.free_result.benchmark_evidence_note !== undefined, 'benchmark_evidence_note should be defined');
  });
});
