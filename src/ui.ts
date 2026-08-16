// src/ui.ts — wizard UI for RenewalScope

import { runEngine } from './engine.js';
import type { EngineOutput } from './engine.js';
import { DiscountStatus, BundleStructure, ResultType, UsageRating, RequirementStatus, ReplacementOption, DependencyFlag } from './types.js';
import type { ProductInput, EngineResult } from './types.js';
import { PRODUCT_CATALOG } from './products.js';

// ── State ─────────────────────────────────────────────────────────────────────

interface WizardState {
  step: number;
  annual_cost_usd: number | null;
  acv_usd: number | null;
  contract_term: 'annual' | 'multi_year' | 'other';
  selected_products: string[];
  product_inputs: ProductInput[];
  discount_status: DiscountStatus | null;
  discount_pct: number | null;
  discount_usd: number | null;
  bundle_structure: BundleStructure | null;
  rate_protection_status: 'active' | 'unclear' | 'none' | null;
  renewal_increase_pct: number | null;
  expected_next_year_acv_usd: number | null;
  target_savings_pct: 5 | 10 | 15 | 20 | null;
  before_annual_cost_usd: number | null;
  after_annual_cost_usd: number | null;
}

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  project_management: 'RFIs, submittals, scheduling, punch lists, documents',
  quality_safety: 'Inspections, incidents, observations, forms, daily log',
  project_financials: 'Budgets, cost management, financial workflows',
  invoice_management: 'Invoice workflows and billing',
  analytics: 'Reporting, dashboards, unified data',
  pay: 'Subcontractor payments, compliance, lien waivers',
  resource_tracking: 'Labor, productivity, resource tracking',
  estimating: 'Estimating and takeoff workflows',
  bid_management: 'Bid distribution, collection, coverage',
};

function makeInitialState(): WizardState {
  return {
    step: 1,
    annual_cost_usd: null,
    acv_usd: null,
    contract_term: 'annual',
    selected_products: [],
    product_inputs: [],
    discount_status: null,
    discount_pct: null,
    discount_usd: null,
    bundle_structure: null,
    rate_protection_status: null,
    renewal_increase_pct: null,
    expected_next_year_acv_usd: null,
    target_savings_pct: null,
    before_annual_cost_usd: null,
    after_annual_cost_usd: null,
  };
}

let state: WizardState = makeInitialState();

// Module-level storage for PDF generation
let lastInput: Record<string, unknown> | null = null;
let lastOutput: EngineOutput | null = null;

// Human-readable label maps
const USAGE_LABELS: Record<string, string> = {
  CRITICAL: 'Used daily', REGULAR: 'Used weekly', OCCASIONAL: 'Used occasionally',
  RARELY: 'Used rarely', NOT_USED: 'Not used', NOT_SURE: 'Not sure',
};
const REQUIREMENT_LABELS: Record<string, string> = {
  BUSINESS_CRITICAL: 'Business critical', CLIENT_CONTRACT: 'Client/contract requirement',
  INTERNAL_POLICY: 'Internal policy', NOT_REQUIRED: 'Not required', NOT_SURE: 'Not sure',
};
const DEPENDENCY_LABELS: Record<string, string> = {
  YES: 'Dependency confirmed', NO: 'No known dependency', NOT_SURE: 'Dependency unknown',
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function fmtUSD(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function fmtRate(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function setHidden(id: string, hidden: boolean): void {
  const el = $(id);
  if (el) el.hidden = hidden;
}

function showError(containerId: string, msg: string): void {
  const el = $(containerId);
  if (el) el.innerHTML = `<div class="error-msg">${msg}</div>`;
}

function clearError(containerId: string): void {
  const el = $(containerId);
  if (el) el.innerHTML = '';
}

function updateProgress(): void {
  const fill = $('progress-fill') as HTMLElement | null;
  const text = $('progress-text');
  if (fill) fill.style.width = `${(state.step / 5) * 100}%`;
  if (text) text.textContent = `Step ${state.step} of 5`;
}

function goToStep(n: number): void {
  for (let i = 1; i <= 5; i++) setHidden(`step-${i}`, i !== n);
  state.step = n;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

function validateStep1(): string | null {
  const cost = ($('annual_cost_usd') as HTMLInputElement | null)?.value;
  const acv = ($('acv_usd') as HTMLInputElement | null)?.value;
  if (!cost || parseFloat(cost) <= 0) return 'Please enter a valid annual spend greater than 0.';
  if (!acv || parseFloat(acv) <= 0) return 'Please enter a valid ACV greater than 0.';
  return null;
}

function saveStep1(): void {
  state.annual_cost_usd = parseFloat(($('annual_cost_usd') as HTMLInputElement).value);
  state.acv_usd = parseFloat(($('acv_usd') as HTMLInputElement).value);
  const term = ($('contract_term') as HTMLSelectElement).value;
  state.contract_term = (term as 'annual' | 'multi_year' | 'other') || 'annual';
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function renderProductCards(): void {
  const container = $('product-cards');
  if (!container) return;
  const products = PRODUCT_CATALOG.filter(p => p.mvp_supported === true);
  container.innerHTML = products.map(p => {
    const desc = PRODUCT_DESCRIPTIONS[p.id] ?? '';
    const sel = state.selected_products.includes(p.id);
    return `<div class="product-card${sel ? ' selected' : ''}" data-product-id="${p.id}" role="checkbox" aria-checked="${sel}" tabindex="0">` +
      `<div class="pc-label">${p.label}</div>` +
      `<div class="pc-desc">${desc}</div>` +
      `</div>`;
  }).join('');

  container.querySelectorAll<HTMLElement>('.product-card').forEach(card => {
    card.addEventListener('click', () => toggleProduct(card));
    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleProduct(card); }
    });
  });
}

function toggleProduct(card: HTMLElement): void {
  const id = card.dataset['productId'] ?? '';
  if (!id) return;
  if (state.selected_products.includes(id)) {
    state.selected_products = state.selected_products.filter(p => p !== id);
    card.classList.remove('selected');
    card.setAttribute('aria-checked', 'false');
  } else {
    state.selected_products.push(id);
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');
  }
}

function validateStep2(): string | null {
  if (state.selected_products.length === 0) return 'Please select at least one product.';
  return null;
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function renderProductDetails(): void {
  const container = $('product-details');
  if (!container) return;
  container.innerHTML = state.selected_products.map(pid => {
    const prod = PRODUCT_CATALOG.find(p => p.id === pid);
    const label = prod?.label ?? pid;
    const ex = state.product_inputs.find(pi => pi.product_id === pid);
    const u = ex?.usage ?? '';
    const r = ex?.requirement ?? '';
    const rep = ex?.replacement ?? '';
    const d = ex?.dependency ?? '';
    const price = ex?.annual_price_usd ?? '';
    const opt = (val: string, label2: string, cur: string) =>
      `<option value="${val}"${cur === val ? ' selected' : ''}>${label2}</option>`;
    return `<div class="product-detail-block" data-product-id="${pid}">` +
      `<div class="pd-heading">${label}</div>` +
      `<div class="pd-grid">` +
      `<div class="field"><label>Usage</label><select class="pd-usage">` +
      `<option value="">Select…</option>` +
      opt(UsageRating.CRITICAL, 'Used daily', u) +
      opt(UsageRating.REGULAR, 'Used weekly', u) +
      opt(UsageRating.OCCASIONAL, 'Used occasionally', u) +
      opt(UsageRating.RARELY, 'Used rarely', u) +
      opt(UsageRating.NOT_USED, 'Not used', u) +
      opt(UsageRating.NOT_SURE, 'Not sure', u) +
      `</select></div>` +
      `<div class="field"><label>Business Requirement</label><select class="pd-requirement">` +
      `<option value="">Select…</option>` +
      opt(RequirementStatus.BUSINESS_CRITICAL, 'Business critical', r) +
      opt(RequirementStatus.CLIENT_CONTRACT, 'Client contract requirement', r) +
      opt(RequirementStatus.INTERNAL_POLICY, 'Internal policy requirement', r) +
      opt(RequirementStatus.NOT_REQUIRED, 'Not required', r) +
      opt(RequirementStatus.NOT_SURE, 'Not sure', r) +
      `</select></div>` +
      `<div class="field"><label>Replacement Option</label><select class="pd-replacement">` +
      `<option value="">Select…</option>` +
      opt(ReplacementOption.ANOTHER_TOOL, 'Another tool available', rep) +
      opt(ReplacementOption.INTERNAL_PROCESS, 'Internal process', rep) +
      opt(ReplacementOption.NOT_NEEDED, 'Not needed if removed', rep) +
      opt(ReplacementOption.NO_REPLACEMENT, 'No replacement exists', rep) +
      opt(ReplacementOption.NOT_SURE, 'Not sure', rep) +
      `</select></div>` +
      `<div class="field"><label>Has Dependencies</label><select class="pd-dependency">` +
      `<option value="">Select…</option>` +
      opt(DependencyFlag.YES, 'Yes, has dependencies', d) +
      opt(DependencyFlag.NO, 'No dependencies', d) +
      opt(DependencyFlag.NOT_SURE, 'Not sure', d) +
      `</select></div>` +
      `</div>` +
      `<div class="field" style="max-width:240px;margin-top:8px;"><label>Line-item annual price (USD)<span class="hint">Optional</span></label>` +
      `<input type="number" class="pd-price" placeholder="24000" min="0" value="${price}" /></div>` +
      `</div>`;
  }).join('');
}

function validateStep3(): string | null {
  const blocks = document.querySelectorAll<HTMLElement>('.product-detail-block');
  for (const block of blocks) {
    const pid = block.dataset['productId'] ?? '';
    const prod = PRODUCT_CATALOG.find(p => p.id === pid);
    const label = prod?.label ?? pid;
    if (!block.querySelector<HTMLSelectElement>('.pd-usage')?.value) return `Please select usage for ${label}.`;
    if (!block.querySelector<HTMLSelectElement>('.pd-requirement')?.value) return `Please select a requirement for ${label}.`;
    if (!block.querySelector<HTMLSelectElement>('.pd-replacement')?.value) return `Please select a replacement option for ${label}.`;
    if (!block.querySelector<HTMLSelectElement>('.pd-dependency')?.value) return `Please select dependency status for ${label}.`;
  }
  return null;
}

function saveStep3(): void {
  const inputs: ProductInput[] = [];
  document.querySelectorAll<HTMLElement>('.product-detail-block').forEach(block => {
    const pid = block.dataset['productId'];
    if (!pid) return;
    const usage = block.querySelector<HTMLSelectElement>('.pd-usage')!.value as UsageRating;
    const requirement = block.querySelector<HTMLSelectElement>('.pd-requirement')!.value as RequirementStatus;
    const replacement = block.querySelector<HTMLSelectElement>('.pd-replacement')!.value as ReplacementOption;
    const dependency = block.querySelector<HTMLSelectElement>('.pd-dependency')!.value as DependencyFlag;
    const priceVal = block.querySelector<HTMLInputElement>('.pd-price')?.value;
    const input: ProductInput = { product_id: pid, usage, requirement, replacement, dependency };
    if (priceVal && parseFloat(priceVal) > 0) input.annual_price_usd = parseFloat(priceVal);
    inputs.push(input);
  });
  state.product_inputs = inputs;
}

// ── Step 4 ────────────────────────────────────────────────────────────────────

function updateDiscountFields(): void {
  const ds = ($('discount_status') as HTMLSelectElement | null)?.value ?? '';
  const pf = $('discount-pct-field');
  const uf = $('discount-usd-field');
  if (pf) pf.hidden = ds !== DiscountStatus.PCT_KNOWN;
  if (uf) uf.hidden = ds !== DiscountStatus.USD_KNOWN;
}

function saveStep4(): void {
  const ds = ($('discount_status') as HTMLSelectElement | null)?.value ?? '';
  state.discount_status = ds ? (ds as DiscountStatus) : null;
  const dpct = ($('discount_pct') as HTMLInputElement | null)?.value ?? '';
  state.discount_pct = dpct ? parseFloat(dpct) : null;
  const dusd = ($('discount_usd') as HTMLInputElement | null)?.value ?? '';
  state.discount_usd = dusd ? parseFloat(dusd) : null;
  const bs = ($('bundle_structure') as HTMLSelectElement | null)?.value ?? '';
  state.bundle_structure = bs ? (bs as BundleStructure) : null;
  const rp = ($('rate_protection_status') as HTMLSelectElement | null)?.value ?? '';
  state.rate_protection_status = rp ? (rp as 'active' | 'unclear' | 'none') : null;
  const ri = ($('renewal_increase_pct') as HTMLInputElement | null)?.value ?? '';
  state.renewal_increase_pct = ri ? parseFloat(ri) : null;
  const eny = ($('expected_next_year_acv_usd') as HTMLInputElement | null)?.value ?? '';
  state.expected_next_year_acv_usd = eny ? parseFloat(eny) : null;
  const tsp = ($('target_savings_pct') as HTMLSelectElement | null)?.value ?? '';
  state.target_savings_pct = tsp ? (parseInt(tsp, 10) as 5 | 10 | 15 | 20) : null;
  const bef = ($('before_annual_cost_usd') as HTMLInputElement | null)?.value ?? '';
  state.before_annual_cost_usd = bef ? parseFloat(bef) : null;
  const aft = ($('after_annual_cost_usd') as HTMLInputElement | null)?.value ?? '';
  state.after_annual_cost_usd = aft ? parseFloat(aft) : null;
}

// ── Step 5: Review ────────────────────────────────────────────────────────────

function renderReview(): void {
  const container = $('review-summary');
  if (!container) return;
  const termLabel = state.contract_term === 'annual' ? 'Annual' : state.contract_term === 'multi_year' ? 'Multi-year' : 'Other';
  const productLabels = state.selected_products
    .map(id => PRODUCT_CATALOG.find(p => p.id === id)?.label ?? id).join(', ') || '—';
  const rows: Array<[string, string]> = [
    ['Annual Spend', state.annual_cost_usd != null ? fmtUSD(state.annual_cost_usd) : '—'],
    ['ACV', state.acv_usd != null ? fmtUSD(state.acv_usd) : '—'],
    ['Contract Term', termLabel],
    ['Products', productLabels],
  ];
  if (state.discount_status) rows.push(['Discount Status', state.discount_status.replace(/_/g, ' ')]);
  if (state.discount_pct != null) rows.push(['Discount %', `${state.discount_pct}%`]);
  if (state.discount_usd != null) rows.push(['Discount USD', fmtUSD(state.discount_usd)]);
  if (state.bundle_structure) rows.push(['Bundle', state.bundle_structure]);
  if (state.rate_protection_status) rows.push(['Rate Protection', state.rate_protection_status]);
  if (state.renewal_increase_pct != null) rows.push(['Renewal Increase', `${state.renewal_increase_pct}%`]);
  if (state.target_savings_pct != null) rows.push(['Savings Target', `${state.target_savings_pct}%`]);
  if (state.before_annual_cost_usd != null) rows.push(['Before Quote', fmtUSD(state.before_annual_cost_usd)]);
  if (state.after_annual_cost_usd != null) rows.push(['After Quote', fmtUSD(state.after_annual_cost_usd)]);
  container.innerHTML = `<table class="review-table"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>` +
    rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') +
    `</tbody></table>`;
}

// ── Loading animation ─────────────────────────────────────────────────────────

function runLoadingAnimation(): Promise<void> {
  return new Promise(resolve => {
    let i = 0;
    function tick(): void {
      const li = $(`ls-${i}`);
      if (li) {
        li.classList.add('done');
        const check = li.querySelector('.check');
        if (check) check.textContent = '✓';
      }
      i++;
      if (i < 5) {
        setTimeout(tick, 300);
      } else {
        setTimeout(resolve, 200);
      }
    }
    setTimeout(tick, 300);
  });
}

// ── Build engine input ────────────────────────────────────────────────────────

function buildEngineInput(): Record<string, unknown> {
  const input: Record<string, unknown> = {
    annual_cost_usd: state.annual_cost_usd,
    acv_usd: state.acv_usd,
    contract_term: state.contract_term === 'other' ? 'annual' : state.contract_term,
    products: state.selected_products,
    product_inputs: state.product_inputs,
  };
  if (state.discount_status) input['discount_status'] = state.discount_status;
  if (state.discount_pct != null) input['discount_pct'] = state.discount_pct;
  if (state.discount_usd != null) input['discount_usd'] = state.discount_usd;
  if (state.bundle_structure) input['bundle_structure'] = state.bundle_structure;
  if (state.rate_protection_status) input['rate_protection_status'] = state.rate_protection_status;
  if (state.renewal_increase_pct != null) input['renewal_increase_pct'] = state.renewal_increase_pct;
  if (state.expected_next_year_acv_usd != null) input['expected_next_year_acv_usd'] = state.expected_next_year_acv_usd;
  if (state.target_savings_pct != null) input['target_savings_pct'] = state.target_savings_pct;
  if (state.before_annual_cost_usd != null) input['before_annual_cost_usd'] = state.before_annual_cost_usd;
  if (state.after_annual_cost_usd != null) input['after_annual_cost_usd'] = state.after_annual_cost_usd;
  return input;
}

// ── Results: Executive Summary ────────────────────────────────────────────────

function verdictLabel(v: ResultType): string {
  switch (v) {
    case ResultType.VERIFIED_BEFORE_AFTER: return 'Verified Savings';
    case ResultType.SAVINGS_IDENTIFIED: return 'Savings Identified';
    case ResultType.OPPORTUNITY_NOT_QUANTIFIABLE: return 'Opportunity Identified';
    case ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED: return 'No Defensible Savings';
    default: return String(v).replace(/_/g, ' ');
  }
}

function renderExecutiveSummary(output: EngineOutput): void {
  const container = $('results-executive-summary');
  if (!container) return;
  const fr = output.free_result;
  const isVerified = fr.verdict === ResultType.VERIFIED_BEFORE_AFTER;
  const showSavings = isVerified && fr.savings_amount != null && fr.savings_amount > 0;
  const candidateCount = output.candidates?.candidates.length ?? 0;
  const blockedCount = output.candidates?.blocked.length ?? 0;
  const stat = (label: string, value: string, cls = '') =>
    `<div class="exec-stat"><div class="exec-stat-label">${label}</div>` +
    `<div class="exec-stat-value${cls ? ' ' + cls : ''}">${value}</div></div>`;
  let statsHtml = stat('Current Annual Spend', fmtUSD(fr.current_spend));
  if (showSavings) statsHtml += stat('Verified Savings', fmtUSD(fr.savings_amount!), 'green');
  statsHtml += stat('Optimization Candidates', String(candidateCount));
  statsHtml += stat('Blocked Products', String(blockedCount));
  statsHtml += stat('Verdict', verdictLabel(fr.verdict));
  let noticesHtml = '';
  const topWarnings = output.warnings.slice(0, 2);
  if (topWarnings.length > 0)
    noticesHtml += `<div class="alert warning" style="margin-top:16px;"><strong>Notices:</strong><br>` +
      topWarnings.map(w => `• ${w}`).join('<br>') + `</div>`;
  const topAssumptions = output.assumptions.slice(0, 2);
  if (topAssumptions.length > 0)
    noticesHtml += `<div class="alert info" style="margin-top:12px;"><strong>Commercial Assumptions:</strong><br>` +
      topAssumptions.map(a => `• ${a}`).join('<br>') + `</div>`;
  container.innerHTML = `<div class="card"><div class="card-title">Executive Summary</div>` +
    `<div class="exec-summary-grid">${statsHtml}</div>${noticesHtml}</div>`;
}

// ── Results: Product Audit ────────────────────────────────────────────────────

function renderProductAudit(output: EngineOutput): void {
  const container = $('results-product-audit');
  if (!container) return;
  const productInputs = (lastInput?.['product_inputs'] as ProductInput[] | undefined) ?? [];
  if (productInputs.length === 0) { container.innerHTML = ''; return; }
  const rows = productInputs.map(pi => {
    const prod = PRODUCT_CATALOG.find(p => p.id === pi.product_id);
    const candInfo = getCandidateStatus(pi.product_id, output);
    return {
      name: prod?.label ?? pi.product_id,
      usage: USAGE_LABELS[pi.usage] ?? pi.usage,
      req: REQUIREMENT_LABELS[pi.requirement] ?? pi.requirement,
      dep: DEPENDENCY_LABELS[pi.dependency] ?? pi.dependency,
      spend: pi.annual_price_usd != null ? fmtUSD(pi.annual_price_usd) + '/yr' : '—',
      candStatus: candInfo.status, why: candInfo.why,
      savStatus: getSavingsStatus(pi.product_id, output),
    };
  });
  const tableRows = rows.map(r =>
    `<tr><td><strong>${r.name}</strong></td><td>${r.usage}</td><td>${r.req}</td><td>${r.dep}</td>` +
    `<td>${r.spend}</td><td>${r.candStatus}</td><td>${r.savStatus || '—'}</td><td>${r.why || '—'}</td></tr>`
  ).join('');
  const cards = rows.map(r =>
    `<div class="audit-card"><div class="audit-card-title">${r.name}</div>` +
    `<div class="audit-card-row"><span class="audit-card-label">Usage</span><span>${r.usage}</span></div>` +
    `<div class="audit-card-row"><span class="audit-card-label">Requirement</span><span>${r.req}</span></div>` +
    `<div class="audit-card-row"><span class="audit-card-label">Dependency</span><span>${r.dep}</span></div>` +
    `<div class="audit-card-row"><span class="audit-card-label">Spend</span><span>${r.spend}</span></div>` +
    `<div class="audit-card-row"><span class="audit-card-label">Status</span><span>${r.candStatus}</span></div>` +
    (r.savStatus ? `<div class="audit-card-row"><span class="audit-card-label">Savings</span><span>${r.savStatus}</span></div>` : '') +
    (r.why ? `<div class="audit-card-row"><span class="audit-card-label">Note</span><span>${r.why}</span></div>` : '') +
    `</div>`
  ).join('');
  container.innerHTML = `<div class="card"><div class="card-title">Product Audit</div>` +
    `<div style="overflow-x:auto;"><table class="audit-table"><thead><tr>` +
    `<th>Product</th><th>Usage</th><th>Requirement</th><th>Dependency</th>` +
    `<th>Line-item Spend</th><th>Candidate Status</th><th>Savings Status</th><th>Note</th>` +
    `</tr></thead><tbody>${tableRows}</tbody></table></div>` +
    `<div id="audit-cards-mobile">${cards}</div></div>`;
}

// ── Results: Counterfactual ───────────────────────────────────────────────────

function renderCounterfactualSection(output: EngineOutput): void {
  const container = $('results-counterfactual');
  if (!container) return;
  const cfResults = output.counterfactual?.counterfactual_results ?? [];
  if (cfResults.length === 0) { container.innerHTML = ''; return; }
  const cards = cfResults.map(cf => {
    const prod = PRODUCT_CATALOG.find(p => p.id === cf.candidate.product_id);
    const name = prod?.label ?? cf.candidate.product_id;
    const rc = cf.result_class;
    const isCommOpp = rc === ResultType.SAVINGS_IDENTIFIED && (cf.dollar_saving == null || cf.dollar_saving === 0);
    const displayClass = rc;
    const badgeLabel = isCommOpp ? 'COMMERCIAL OPPORTUNITY'
      : rc === ResultType.VERIFIED_BEFORE_AFTER ? 'VERIFIED BEFORE/AFTER'
      : rc === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE ? 'OPPORTUNITY — NOT QUANTIFIABLE'
      : rc.replace(/_/g, ' ');
    const badgeCls = (rc === ResultType.VERIFIED_BEFORE_AFTER || (rc === ResultType.SAVINGS_IDENTIFIED && !isCommOpp))
      ? 'VERIFIED_BEFORE_AFTER' : rc === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE ? 'OPPORTUNITY_NOT_QUANTIFIABLE' : 'NO_DEFENSIBLE_SAVINGS_IDENTIFIED';
    let extraHtml = '';
    if (rc === ResultType.VERIFIED_BEFORE_AFTER && cf.dollar_saving != null && cf.dollar_saving > 0)
      extraHtml = `<div class="cf-saving">Verified quote-to-quote difference: ${fmtUSD(cf.dollar_saving)}/year</div>`;
    else if (rc === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE)
      extraHtml = `<div class="cf-opportunity">Savings not yet quantifiable</div>`;
    return `<div class="cf-result-card ${displayClass}">` +
      `<div class="cf-card-header"><span class="cf-product-name">${name}</span>` +
      `<span class="result-badge ${badgeCls}">${badgeLabel}</span></div>` +
      `<div class="cf-explanation">${cf.explanation}</div>${extraHtml}</div>`;
  }).join('');
  container.innerHTML = `<div class="card"><div class="card-title">Counterfactual Analysis</div>${cards}</div>`;
}

// ── Results: Evidence ─────────────────────────────────────────────────────────

function evidenceSourceType(id: string): string {
  if (id.startsWith('REDDIT-')) return 'Customer observation (Reddit)';
  if (id.startsWith('WEB-')) return 'Web/secondary source';
  return 'Public observation';
}

function renderEvidenceSection(output: EngineOutput): void {
  const container = $('results-evidence');
  if (!container) return;
  const trailIds = output.paid_report.evidence_trail ?? [];
  const benchIds = output.benchmark?.comparable_evidence_ids ?? [];
  const allIds = [...new Set([...trailIds, ...benchIds])];
  if (allIds.length === 0) { container.innerHTML = ''; return; }
  const items = allIds.map(id =>
    `<div class="evidence-item"><details>` +
    `<summary>${id} — ${evidenceSourceType(id)}</summary>` +
    `<div class="ev-meta">` +
    `<div class="ev-meta-row"><span class="ev-meta-label">Source type:</span> ${evidenceSourceType(id)}</div>` +
    `<div class="ev-meta-row"><span class="ev-meta-label">Supports:</span> Benchmark context and effective rate comparison</div>` +
    `<div class="ev-meta-row"><span class="ev-meta-label">Does not support:</span> Exact post-removal renewal pricing</div>` +
    `</div></details></div>`
  ).join('');
  container.innerHTML = `<div class="card"><div class="card-title">Evidence Trail</div>` +
    `<p class="section-note">Evidence IDs referenced in this analysis. Expand each to see source context.</p>` +
    `${items}</div>`;
}

// ── PDF generation ─────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function generatePDF(output: EngineOutput, input: Record<string, unknown>): void {
  const jspdfLib = (window as any).jspdf as { jsPDF: new(opts?: unknown) => any } | undefined;
  if (!jspdfLib) { alert('PDF library not loaded. Please refresh the page and try again.'); return; }

  const doc = new jspdfLib.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;
  const maxY = pageH - 35; // Leave space for footer

  // Colors
  const forest = [18, 59, 42];
  const green = [31, 138, 91];
  const mint = [234, 247, 240];
  const charcoal = [27, 31, 30];
  const muted = [107, 114, 128];
  const amber = [217, 119, 6];
  const red = [220, 38, 38];

  // Generate Report ID
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  const reportId = `RS-${dateStr}-${randomHex}`;

  let pageNum = 0;

  // Helper: Add new page with header/footer
  function addPage(): void {
    doc.addPage();
    pageNum++;
    addPageHeader();
    y = 32;
  }

  // Helper: Check if we need new page
  function checkPage(needed = 15): void {
    if (y + needed > maxY) {
      addPage();
    }
  }

  // Helper: Add watermark
  function addWatermark(): void {
    doc.setTextColor(31, 138, 91);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    const txt = 'RenewalScope';
    const txtW = doc.getTextWidth(txt);
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
    doc.text(txt, (pageW - txtW) / 2, pageH / 2, { angle: -45 });
    doc.restoreGraphicsState();
  }

  // Helper: Page header (after cover)
  function addPageHeader(): void {
    if (pageNum === 0) return; // Skip cover

    // Logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...forest);
    doc.text('RenewalScope', margin, 15);

    // Document title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text('Procore Renewal Analysis', margin + 45, 15);

    // Report ID
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(reportId, pageW - margin, 15, { align: 'right' });

    // Header divider
    doc.setDrawColor(...green);
    doc.setLineWidth(0.5);
    doc.line(margin, 18, pageW - margin, 18);

    addWatermark();
  }

  // Helper: Page footer
  function addPageFooter(current: number, total: number): void {
    const footerY = pageH - 20;

    // Footer divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageW - margin, footerY - 5);

    // Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...forest);
    doc.text('RenewalScope', margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text('Evidence-backed renewal intelligence.', margin, footerY + 4);

    // Page number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    if (current > 0) {
      doc.text(`Page ${current} of ${total}`, pageW - margin, footerY, { align: 'right' });
    }

    // Disclaimer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text('Independent analysis · Not affiliated with Procore Technologies, Inc.', pageW / 2, footerY + 4, { align: 'center' });
  }

  // Helper: Section heading
  function h1(text: string): void {
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...forest);
    doc.text(text, margin, y);
    y += 12;
  }

  function h2(text: string): void {
    checkPage(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...green);
    doc.text(text, margin, y);
    y += 10;
  }

  function h3(text: string): void {
    checkPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...charcoal);
    doc.text(text, margin, y);
    y += 8;
  }

  function body(text: string, color = charcoal): void {
    checkPage(10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach((line: string) => {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    });
  }

  function badge(text: string, color: 'green' | 'amber' | 'gray' | 'red'): void {
    const colors = {
      green: { bg: [209, 250, 229], text: [6, 95, 70] },
      amber: { bg: [254, 243, 199], text: [146, 64, 14] },
      gray: { bg: [243, 244, 246], text: [75, 85, 99] },
      red: { bg: [254, 226, 226], text: [153, 27, 27] }
    };
    const c = colors[color];

    doc.setFillColor(...c.bg);
    doc.setDrawColor(...c.bg);
    const w = doc.getTextWidth(text) + 6;
    doc.roundedRect(margin, y - 4, w, 6, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...c.text);
    doc.text(text, margin + 3, y);
    y += 6;
  }

  function divider(): void {
    checkPage(8);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  function metricCard(label: string, value: string, color: 'green' | 'default' = 'default'): { w: number; h: number } {
    const cardW = 85;
    const cardH = 28;

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, cardW, cardH, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label.toUpperCase(), margin + 6, y + 8);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    if (color === 'green') {
      doc.setTextColor(...green);
    } else {
      doc.setTextColor(...charcoal);
    }
    doc.text(value, margin + 6, y + 20);

    return { w: cardW, h: cardH };
  }

  // ============================================================
  // COVER PAGE
  // ============================================================

  pageNum = 0;

  // Cover header bar
  doc.setFillColor(...forest);
  doc.rect(0, 0, pageW, 70, 'F');

  // Logo/Brand on cover
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('RenewalScope', pageW / 2, 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(234, 247, 240);
  doc.text('Evidence-backed renewal intelligence.', pageW / 2, 45, { align: 'center' });

  // Diagonal shape accent
  doc.setFillColor(31, 138, 91);
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
  const points = [[pageW * 0.6, 70], [pageW, 70], [pageW, 120], [pageW * 0.7, 120]];
  doc.triangle(points[0][0], points[0][1], points[1][0], points[1][1], points[2][0], points[2][1], 'F');
  doc.restoreGraphicsState();

  y = 95;

  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...forest);
  doc.text('Procore Renewal Analysis', pageW / 2, y, { align: 'center' });
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  doc.text('Evidence-based commercial review & negotiation guidance', pageW / 2, y, { align: 'center' });
  y += 35;

  // Metadata box
  const metaX = 45;
  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(metaX, y, 120, 65, 3, 3, 'FD');

  const metaY = y + 12;
  const rowH = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...muted);

  let my = metaY;
  doc.text('PREPARED FOR:', metaX + 10, my);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text('Customer', metaX + 10, my + 5);

  my += rowH + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('REPORT ID:', metaX + 10, my);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text(reportId, metaX + 10, my + 5);

  my += rowH + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('GENERATED:', metaX + 10, my);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateFormatted, metaX + 10, my + 5);

  my += rowH + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('ANALYSIS TYPE:', metaX + 10, my);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  doc.text('Renewal Optimization', metaX + 10, my + 5);

  my += rowH + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('CONTRACT TERM:', metaX + 10, my);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoal);
  const term = String(input['contract_term'] ?? 'Annual');
  doc.text(term.charAt(0).toUpperCase() + term.slice(1), metaX + 10, my + 5);

  // Cover footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text('Independent analysis · Not affiliated with Procore Technologies, Inc.', pageW / 2, pageH - 15, { align: 'center' });

  addPageFooter(0, 1); // Will update page count later

  // ============================================================
  // PAGE 2: EXECUTIVE SUMMARY
  // ============================================================

  addPage();

  h1('Executive Summary');
  y += 5;

  const fr = output.free_result;

  // Verdict badge
  if (fr.verdict === ResultType.VERIFIED_BEFORE_AFTER) {
    badge('VERIFIED SAVINGS IDENTIFIED', 'green');
  } else if (fr.verdict === ResultType.SAVINGS_IDENTIFIED) {
    badge('SAVINGS IDENTIFIED', 'green');
  } else if (fr.verdict === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
    badge('OPPORTUNITY IDENTIFIED — SAVINGS NOT QUANTIFIABLE', 'amber');
  } else {
    badge('NO DEFENSIBLE SAVINGS IDENTIFIED', 'gray');
  }

  y += 8;

  // Metric cards grid
  const startY = y;
  metricCard('CURRENT ANNUAL SPEND', fmtUSD(fr.current_spend));

  if (fr.verdict === ResultType.VERIFIED_BEFORE_AFTER && fr.savings_amount != null && fr.savings_amount > 0) {
    const card = metricCard('VERIFIED SAVINGS', fmtUSD(fr.savings_amount) + ' / year', 'green');
    y = startY;
    metricCard('CURRENT ANNUAL SPEND', fmtUSD(fr.current_spend));
    doc.text('', margin + 90, y); // Position for second card
    y = startY;
    const origMargin = margin;
    (doc as any).internal.pageSize.width; // Keep reference
    doc.text('', 0, 0); // Reset position

    // Draw second card at offset
    const saveY = y;
    const saveMargin = margin;
    const offsetX = 95;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin + offsetX, y, 85, 28, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text('VERIFIED SAVINGS', margin + offsetX + 6, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...green);
    doc.text(fmtUSD(fr.savings_amount) + ' / year', margin + offsetX + 6, y + 20);

    y = saveY + 32;
  } else {
    y += 32;
  }

  // Second row of metrics
  const row2Y = y;
  const candCount = output.candidates?.candidates.length ?? 0;
  metricCard('OPTIMIZATION CANDIDATES', String(candCount));

  const blockedCount = output.candidates?.blocked.length ?? 0;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin + 95, row2Y, 85, 28, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text('BLOCKED PRODUCTS', margin + 95 + 6, row2Y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...charcoal);
  doc.text(String(blockedCount), margin + 95 + 6, row2Y + 20);

  y = row2Y + 35;

  body(fr.explanation);
  y += 5;

  divider();

  // ============================================================
  // PAGE 3: COMMERCIAL BASELINE
  // ============================================================

  checkPage(60);
  h2('Commercial Baseline');
  y += 3;

  const kv = (label: string, value: string) => {
    checkPage(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...charcoal);
    doc.text(value, margin + 55, y);
    y += 7;
  };

  kv('Annual Spend', fmtUSD(fr.current_spend));
  kv('ACV', fmtUSD(Number(input['acv_usd'] ?? 0)));
  kv('Contract Term', String(input['contract_term'] ?? 'Annual'));

  if (input['renewal_increase_pct']) {
    kv('Renewal Increase', input['renewal_increase_pct'] + '%');
  }

  if (input['discount_pct']) {
    kv('Discount', input['discount_pct'] + '%');
  }

  if (input['bundle_structure']) {
    kv('Bundle Structure', String(input['bundle_structure']).replace(/_/g, ' '));
  }

  if (fr.effective_rate != null) {
    kv('Effective Rate', fmtRate(fr.effective_rate) + ' per $1M ACV');
  }

  if (fr.benchmark_position) {
    kv('Benchmark Position', fr.benchmark_position.replace(/_/g, ' ').toUpperCase());
  }

  y += 5;
  divider();

  // Benchmark visualization
  const bm = output.benchmark;
  if (bm?.min_evidence_count_met) {
    h2('Benchmark Context');
    y += 3;
    body('Directional benchmark from public observations; not an official Procore price list.', muted);
    y += 5;

    kv('Your Rate', fmtRate(bm.user_rate) + ' per $1M ACV');
    kv('25th Percentile', fmtRate(bm.stats.p25));
    kv('Median (50th)', fmtRate(bm.stats.p50));
    kv('75th Percentile', fmtRate(bm.stats.p75));
    kv('Observed Range', fmtRate(bm.stats.min) + ' - ' + fmtRate(bm.stats.max));
    kv('Evidence Count', String(bm.stats.count));

    y += 5;
    divider();
  }

  // ============================================================
  // PRODUCT AUDIT
  // ============================================================

  const productInputs = (input['product_inputs'] as ProductInput[] | undefined) ?? [];
  if (productInputs.length > 0) {
    checkPage(40);
    h2('Product Audit');
    y += 5;

    productInputs.forEach(pi => {
      checkPage(25);
      const prod = PRODUCT_CATALOG.find(p => p.id === pi.product_id);
      const name = prod?.label ?? pi.product_id;
      const cs = getCandidateStatus(pi.product_id, output);

      // Product name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...forest);
      doc.text(name, margin, y);
      y += 7;

      // Product details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...muted);

      const details = [
        `Usage: ${USAGE_LABELS[pi.usage] ?? pi.usage}`,
        `Requirement: ${REQUIREMENT_LABELS[pi.requirement] ?? pi.requirement}`,
        `Dependency: ${DEPENDENCY_LABELS[pi.dependency] ?? pi.dependency}`,
      ];

      if (pi.annual_price_usd != null) {
        details.push(`Annual Spend: ${fmtUSD(pi.annual_price_usd)}`);
      }

      details.push(`Status: ${cs.status}`);

      const sav = getSavingsStatus(pi.product_id, output);
      if (sav) {
        details.push(`Savings: ${sav}`);
      }

      details.forEach(d => {
        doc.text('  • ' + d, margin + 2, y);
        y += 5;
      });

      y += 3;
    });

    divider();
  }

  // ============================================================
  // COUNTERFACTUAL ANALYSIS
  // ============================================================

  const cfResults = output.counterfactual?.counterfactual_results ?? [];
  if (cfResults.length > 0) {
    checkPage(30);
    h2('Counterfactual Analysis');
    y += 3;
    body('Testing alternative configurations against available evidence.', muted);
    y += 8;

    cfResults.forEach(cf => {
      checkPage(35);
      const prod = PRODUCT_CATALOG.find(p => p.id === cf.candidate.product_id);
      const name = prod?.label ?? cf.candidate.product_id;

      // Product name with result badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...green);
      doc.text(name, margin, y);
      y += 7;

      // Status badge
      if (cf.result_class === ResultType.VERIFIED_BEFORE_AFTER) {
        badge('VERIFIED QUOTE-TO-QUOTE DIFFERENCE', 'green');
        y += 2;
      } else if (cf.result_class === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
        badge('SAVINGS NOT YET QUANTIFIABLE', 'amber');
        y += 2;
      }

      // Explanation
      body(cf.explanation);
      y += 3;

      // Verified difference callout
      if (cf.result_class === ResultType.VERIFIED_BEFORE_AFTER && cf.dollar_saving != null && cf.dollar_saving > 0) {
        doc.setFillColor(...mint);
        doc.setDrawColor(...green);
        doc.roundedRect(margin, y, contentW, 12, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...green);
        doc.text('Verified quote-to-quote difference: ' + fmtUSD(cf.dollar_saving) + '/year', margin + 6, y + 8);
        y += 15;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...muted);
        body('Attribution to a specific product is not established from quote amounts alone.', muted);
      }

      y += 5;
    });

    divider();
  }

  // ============================================================
  // EVIDENCE TRAIL
  // ============================================================

  const trailIds = output.paid_report.evidence_trail ?? [];
  const benchIds = output.benchmark?.comparable_evidence_ids ?? [];
  const allEvidence = [...new Set([...trailIds, ...benchIds])];

  if (allEvidence.length > 0) {
    checkPage(30);
    h2('Evidence Trail');
    y += 3;
    body('Evidence sources referenced in this analysis.', muted);
    y += 8;

    allEvidence.slice(0, 10).forEach(evidenceId => {
      checkPage(18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...charcoal);
      doc.text(evidenceId, margin, y);
      y += 6;

      const sourceType = evidenceId.startsWith('REDDIT-') ? 'Customer observation (Reddit)' :
        evidenceId.startsWith('WEB-') ? 'Web/secondary source' : 'Public observation';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text('  Source: ' + sourceType, margin + 2, y);
      y += 5;
      doc.text('  Supports: Benchmark context and effective rate comparison', margin + 2, y);
      y += 5;
      doc.text('  Does not support: Exact post-removal renewal pricing', margin + 2, y);
      y += 8;
    });

    divider();
  }

  // ============================================================
  // COMMERCIAL OPPORTUNITIES & RISKS
  // ============================================================

  if (output.assumptions.length > 0 || output.warnings.length > 0) {
    checkPage(40);
    h2('Commercial Assumptions & Notices');
    y += 5;

    if (output.assumptions.length > 0) {
      h3('Assumptions');
      y += 3;
      output.assumptions.forEach(assumption => {
        checkPage(8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...charcoal);
        const lines = doc.splitTextToSize('  • ' + assumption, contentW - 4);
        lines.forEach((line: string) => {
          checkPage(6);
          doc.text(line, margin + 2, y);
          y += 5;
        });
      });
      y += 5;
    }

    if (output.warnings.length > 0) {
      h3('Notices');
      y += 3;
      output.warnings.forEach(warning => {
        checkPage(8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...amber);
        const lines = doc.splitTextToSize('  ⚠ ' + warning, contentW - 4);
        lines.forEach((line: string) => {
          checkPage(6);
          doc.text(line, margin + 2, y);
          y += 5;
        });
      });
      y += 5;
    }

    divider();
  }

  // ============================================================
  // NEGOTIATION PLAN
  // ============================================================

  const neg = output.negotiation;
  if (neg) {
    checkPage(50);
    h2('Negotiation Plan');
    y += 5;

    // What to ask
    h3('What to Ask');
    y += 2;
    body(neg.what_to_ask);
    y += 5;

    // Why
    h3('Why');
    y += 2;
    body(neg.why);
    y += 5;

    // Configuration
    h3('Configuration Requested');
    y += 2;
    body(neg.configuration_requested);
    y += 5;

    // Target price
    if (neg.target_price != null) {
      checkPage(18);
      h3('Negotiation Target');
      y += 2;

      doc.setFillColor(...mint);
      doc.setDrawColor(...green);
      doc.roundedRect(margin, y, 80, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text('TARGET PRICE', margin + 6, y + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...green);
      doc.text(fmtUSD(neg.target_price), margin + 6, y + 16);

      y += 25;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...muted);
      body('Negotiation target — not a predicted Procore quote.', muted);
      y += 3;
    }

    // Max acceptable
    if (neg.max_acceptable_price != null) {
      checkPage(18);
      h3('Maximum Acceptable Price');
      y += 2;

      doc.setFillColor(254, 226, 226);
      doc.setDrawColor(...red);
      doc.roundedRect(margin, y, 80, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text('WALK-AWAY PRICE', margin + 6, y + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...red);
      doc.text(fmtUSD(neg.max_acceptable_price), margin + 6, y + 16);

      y += 25;
    }

    // Confirm in writing
    if (neg.confirm_in_writing.length > 0) {
      h3('Confirm in Writing');
      y += 3;
      neg.confirm_in_writing.forEach(item => {
        checkPage(8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...charcoal);
        const lines = doc.splitTextToSize('  ✓ ' + item, contentW - 4);
        lines.forEach((line: string) => {
          checkPage(6);
          doc.text(line, margin + 2, y);
          y += 5;
        });
      });
      y += 3;
    }

    divider();
  }

  // ============================================================
  // FINAL DECISION
  // ============================================================

  checkPage(50);
  h2('Final Decision Framework');
  y += 5;

  // What we know
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, contentW, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text('WHAT WE KNOW', margin + 4, y + 5.5);
  y += 11;

  let knownText = '';
  if (fr.verdict === ResultType.VERIFIED_BEFORE_AFTER && fr.savings_amount) {
    knownText = `We have a verified $${fr.savings_amount.toLocaleString()}/year quote-to-quote difference.`;
  } else if (fr.verdict === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
    knownText = 'An optimization candidate was identified, but savings cannot be quantified without additional evidence.';
  } else {
    knownText = 'No products survived requirement and dependency checks as optimization candidates.';
  }
  body(knownText);
  y += 8;

  // What we don't know
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(margin, y, contentW, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('WHAT WE DON\'T KNOW', margin + 4, y + 5.5);
  y += 11;

  let unknownText = '';
  if (fr.verdict === ResultType.VERIFIED_BEFORE_AFTER) {
    unknownText = 'Whether this difference is specifically attributable to removing any individual product without configuration-mapped quotes.';
  } else if (fr.verdict === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
    unknownText = 'The resulting Procore renewal price for the proposed configuration.';
  } else {
    unknownText = 'Whether future configuration changes could produce eligible candidates.';
  }
  body(unknownText);
  y += 8;

  // Next action
  doc.setFillColor(234, 247, 240);
  doc.setDrawColor(31, 138, 91);
  doc.roundedRect(margin, y, contentW, 8, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...forest);
  doc.text('NEXT ACTION', margin + 4, y + 5.5);
  y += 11;

  const nextAction = fr.what_to_confirm[0] ?? 'Cross-check findings against your actual Procore renewal quote.';
  body(nextAction);
  y += 8;

  divider();

  // ============================================================
  // DISCLAIMER
  // ============================================================

  checkPage(40);
  h2('Disclaimer');
  y += 5;

  const disclaimers = [
    'Independent analysis. Not affiliated with Procore Technologies, Inc.',
    'No savings are guaranteed. All financial calculations are deterministic and evidence-based.',
    'Benchmark figures are directional context from public observations, not official Procore pricing.',
    'Always cross-check findings against your actual Procore renewal quote before making decisions.',
    'This analysis does not constitute legal, financial, or procurement advice. Consult appropriate professionals for specific guidance.',
  ];

  disclaimers.forEach(disclaimer => {
    checkPage(10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    const lines = doc.splitTextToSize('• ' + disclaimer, contentW - 2);
    lines.forEach((line: string) => {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    });
    y += 2;
  });

  // ============================================================
  // FINAL: Update page numbers
  // ============================================================

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(i - 1, totalPages - 1);
  }

  // Save
  const saveDateStr = new Date().toISOString().split('T')[0];
  doc.save(`RenewalScope_Procore_Renewal_Analysis_${saveDateStr}.pdf`);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Results: Status hero ──────────────────────────────────────────────────────

function renderStatusHero(output: EngineOutput): void {
  const container = $('results-status-hero');
  if (!container) return;
  const verdict = output.free_result.verdict;
  const savings = output.free_result.savings_amount;
  // Show savings only if > 0 AND verdict is VERIFIED_BEFORE_AFTER or SAVINGS_IDENTIFIED
  const showSavings = savings != null && savings > 0 &&
    (verdict === ResultType.VERIFIED_BEFORE_AFTER || verdict === ResultType.SAVINGS_IDENTIFIED);

  let heroClass = '';
  let badgeClass = 'none';
  let badgeText = 'Analysis Complete';
  let titleText = 'Analysis Complete';

  if (verdict === ResultType.VERIFIED_BEFORE_AFTER) {
    heroClass = 'verified'; badgeClass = 'verified';
    badgeText = 'Verified Savings'; titleText = 'Verified Savings Identified';
  } else if (verdict === ResultType.SAVINGS_IDENTIFIED) {
    heroClass = 'verified'; badgeClass = 'verified';
    badgeText = 'Savings Identified'; titleText = 'Potential Savings Identified';
  } else if (verdict === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
    heroClass = 'uncertain'; badgeClass = 'uncertain';
    badgeText = 'Opportunity Identified'; titleText = 'Optimization Opportunity';
  } else if (verdict === ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED) {
    heroClass = 'none'; badgeClass = 'none';
    badgeText = 'No Defensible Savings'; titleText = 'No Defensible Savings Identified';
  }

  const savingsLabel = verdict === ResultType.VERIFIED_BEFORE_AFTER ? 'Verified Annual Savings' : 'Identified Savings';
  const savingsHTML = showSavings
    ? `<div class="spend-item"><div class="spend-label">${savingsLabel}</div>` +
      `<div class="spend-value savings">${fmtUSD(savings!)}</div></div>` : '';

  container.innerHTML = `<div class="status-hero ${heroClass}">` +
    `<div class="status-badge ${badgeClass}">${badgeText}</div>` +
    `<div class="status-title">${titleText}</div>` +
    `<div class="status-subtitle">${output.free_result.explanation}</div>` +
    `<div class="spend-display">` +
    `<div class="spend-item"><div class="spend-label">Current Annual Spend</div>` +
    `<div class="spend-value">${fmtUSD(output.free_result.current_spend)}</div></div>` +
    savingsHTML + `</div></div>`;
}

// ── Results: Product Audit helpers ────────────────────────────────────────────

function getCandidateStatus(productId: string, output: EngineOutput): { status: string; why: string } {
  const cands = output.candidates;
  if (!cands) return { status: 'Not evaluated', why: '' };
  if (cands.skipped_product_ids.includes(productId))
    return { status: 'Not a candidate (actively used)', why: 'Product is actively used' };
  const blocked = cands.blocked.find(c => c.product_id === productId);
  if (blocked) return { status: 'Blocked', why: blocked.blocked_reason ?? 'Blocked by requirement or dependency' };
  const candidate = cands.candidates.find(c => c.product_id === productId);
  if (candidate) {
    if (candidate.blocked_reason) return { status: 'Uncertain', why: candidate.blocked_reason };
    return { status: 'Eligible candidate', why: '' };
  }
  return { status: 'Not evaluated', why: '' };
}

function getSavingsStatus(productId: string, output: EngineOutput): string {
  if (!output.counterfactual) return '';
  const cf = output.counterfactual.counterfactual_results.find(r => r.candidate.product_id === productId);
  if (!cf) return '';
  if (cf.result_class === ResultType.VERIFIED_BEFORE_AFTER && cf.dollar_saving != null && cf.dollar_saving > 0)
    return `Verified quote-to-quote difference: ${fmtUSD(cf.dollar_saving)}/year`;
  if (cf.result_class === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE)
    return 'Savings not yet quantifiable';
  return '';
}

// ── Results: Benchmark ────────────────────────────────────────────────────────

function renderBenchmark(output: EngineOutput): void {
  const container = $('results-benchmark');
  if (!container) return;
  const bm = output.benchmark;
  // Only show when min_evidence_count_met === true
  if (!bm || !bm.min_evidence_count_met) { container.innerHTML = ''; return; }

  const range = bm.stats.max - bm.stats.min;
  const offset = bm.user_rate - bm.stats.min;
  const pct = range > 0 ? Math.min(100, Math.max(0, (offset / range) * 100)) : 50;
  const posMap: Record<string, string> = {
    below_p25: 'Your rate appears favorable relative to comparable public observations. Confirm any commercial impact in writing before restructuring.',
    p25_to_p50: 'Your rate falls in the lower half of comparable observations.',
    p50_to_p75: 'Your rate is near or above the median of comparable observations.',
    above_p75: 'Your rate is in the upper range of comparable observations.',
  };
  const posText = posMap[bm.position] ?? '';

  container.innerHTML = `<div class="card"><div class="card-title">Commercial Context</div>` +
    `<div class="benchmark-card">` +
    `<div class="benchmark-header">Your Effective Rate</div>` +
    `<div class="rate-display"><span class="rate-value">${fmtRate(bm.user_rate)}</span><span class="rate-label">per $1M ACV</span></div>` +
    `<div class="benchmark-position">${posText}</div>` +
    `<div class="bar-track" style="position:relative;overflow:visible;">` +
    `<div class="bar-fill" style="width:${pct}%"></div>` +
    `<div class="bar-marker" style="left:${pct}%"></div></div>` +
    `<div class="bar-stats">` +
    `<span>p25: <strong>${fmtRate(bm.stats.p25)}</strong></span>` +
    `<span>median: <strong>${fmtRate(bm.stats.p50)}</strong></span>` +
    `<span>p75: <strong>${fmtRate(bm.stats.p75)}</strong></span></div>` +
    `<div style="font-size:0.8125rem;color:var(--text-muted);margin-top:12px;">` +
    `<strong>Evidence:</strong> ${bm.comparable_evidence_ids.join(', ')}</div>` +
    `</div></div>`;
}

// ── Results: Results list ─────────────────────────────────────────────────────

function renderResultsList(output: EngineOutput): void {
  const container = $('results-list');
  if (!container) return;
  if (output.results.length === 0) {
    container.innerHTML = `<div class="alert info">No specific findings to report based on the information provided.</div>`;
    return;
  }
  container.innerHTML = output.results.map((r: EngineResult) => {
    // SAVINGS_IDENTIFIED with no dollar_saving → COMMERCIAL OPPORTUNITY (amber)
    const isCommercialOpp = r.result_type === ResultType.SAVINGS_IDENTIFIED &&
      (r.dollar_saving == null || r.dollar_saving === 0);
    const displayType = isCommercialOpp ? 'COMMERCIAL_OPPORTUNITY' : r.result_type;
    const badgeLabel = isCommercialOpp ? 'COMMERCIAL OPPORTUNITY' : r.result_type.replace(/_/g, ' ');
    // NEVER show savings for OPPORTUNITY_NOT_QUANTIFIABLE
    // Only show savings for VERIFIED_BEFORE_AFTER with a positive dollar_saving
    const canShowSaving = r.result_type === ResultType.VERIFIED_BEFORE_AFTER &&
      r.dollar_saving != null && r.dollar_saving > 0;
    const savingHTML = canShowSaving
      ? `<div class="result-saving">Verified annual saving: ${fmtUSD(r.dollar_saving!)}</div>` : '';
    const evidenceHTML = r.comparable_evidence.length > 0
      ? `<div class="result-evidence">Evidence: ` +
        r.comparable_evidence.map(id => `<span class="ev-id">${id}</span>`).join('') + `</div>` : '';
    return `<div class="result-item ${displayType}">` +
      `<div class="result-header"><span class="result-badge ${displayType}">${badgeLabel}</span>` +
      `<span class="conf-badge">${r.confidence}</span></div>` +
      `<div class="result-text">${r.recommendation_text}</div>` +
      (r.explanation ? `<div class="result-explanation">${r.explanation}</div>` : '') +
      savingHTML + evidenceHTML + `</div>`;
  }).join('');
}

// ── Results: Warnings & Assumptions ──────────────────────────────────────────

function renderWarningsAndAssumptions(output: EngineOutput): void {
  const container = $('results-warnings');
  if (!container) return;
  let html = '';
  if (output.warnings.length > 0)
    html += `<div class="alert warning"><strong>Notices:</strong><br>` +
      output.warnings.map(w => `• ${w}`).join('<br>') + `</div>`;
  if (output.assumptions.length > 0)
    html += `<div class="alert info"><strong>Assumptions:</strong><br>` +
      output.assumptions.map(a => `• ${a}`).join('<br>') + `</div>`;
  container.innerHTML = html;
}

// ── Results: Negotiation plan ─────────────────────────────────────────────────

function renderNegotiation(output: EngineOutput): void {
  const container = $('results-negotiation');
  if (!container) return;
  const neg = output.negotiation;
  if (!neg) { container.innerHTML = ''; return; }

  const priceBox = (label: string, value: number) =>
    `<div class="price-box"><div class="price-box-label">${label}</div>` +
    `<div class="price-box-value">${fmtUSD(value)}</div>` +
    `<div class="price-box-note">Not a predicted Procore quote</div></div>`;

  const listSection = (label: string, items: string[]) => items.length === 0 ? '' :
    `<div class="neg-section"><div class="neg-label">${label}</div>` +
    `<ul class="neg-list">${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;

  let html = `<div class="negotiation-card"><div class="negotiation-title">Negotiation Plan</div>` +
    `<div class="neg-section"><div class="neg-label">What to Ask</div><div class="neg-content">${neg.what_to_ask}</div></div>` +
    `<div class="neg-section"><div class="neg-label">Why</div><div class="neg-content">${neg.why}</div></div>` +
    `<div class="neg-section"><div class="neg-label">Configuration Requested</div><div class="neg-content">${neg.configuration_requested}</div></div>`;

  // target_price — ALWAYS show with "Not a predicted Procore quote"
  if (neg.target_price != null)
    html += `<div class="neg-section"><div class="neg-label">Target Price</div>${priceBox('Target', neg.target_price)}</div>`;
  // max_acceptable_price — ALWAYS show with "Not a predicted Procore quote"
  if (neg.max_acceptable_price != null)
    html += `<div class="neg-section"><div class="neg-label">Max Acceptable Price</div>${priceBox('Walk-away price', neg.max_acceptable_price)}</div>`;

  html += listSection('Unknowns', neg.unknowns);
  html += listSection('Risks', neg.risks);
  html += listSection('Confirm in Writing', neg.confirm_in_writing);
  html += `</div>`;
  container.innerHTML = html;
}

// ── Results: What to confirm ──────────────────────────────────────────────────

function renderWhatToConfirm(output: EngineOutput): void {
  const container = $('results-confirm');
  if (!container) return;
  const items = output.free_result.what_to_confirm;
  if (!items || items.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = `<div class="card"><div class="card-title">What to Confirm</div>` +
    `<ul class="neg-list">${items.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
}

function renderKnownUnknown(output: EngineOutput): void {
  const el = $('results-known-unknown');
  if (!el) return;
  const verdict = output.free_result.verdict;
  const savings = output.free_result.savings_amount;

  let known = '';
  let unknown = '';
  let needed = '';

  if (verdict === ResultType.VERIFIED_BEFORE_AFTER && savings) {
    known = `The two user-supplied quotes differ by $${savings.toLocaleString()}/year.`;
    unknown = 'Whether this difference is specifically attributable to removing any individual product.';
    needed = 'A written quote confirming the exact configuration change between the two quotes.';
  } else if (verdict === ResultType.OPPORTUNITY_NOT_QUANTIFIABLE) {
    const cand = output.candidates?.candidates[0];
    known = cand ? `${PRODUCT_CATALOG.find(p => p.id === cand.product_id)?.label ?? cand.product_id} appears eligible for optimization review.` : 'An optimization candidate was identified.';
    unknown = 'The resulting Procore renewal price for the proposed configuration.';
    needed = 'A comparable written Procore quote for the proposed configuration.';
  } else if (verdict === ResultType.NO_DEFENSIBLE_SAVINGS_IDENTIFIED) {
    known = 'No products survived the requirement and dependency checks as optimization candidates.';
    unknown = 'Whether future configuration changes could produce eligible candidates.';
    needed = 'Updated product usage and requirement information.';
  }

  if (!known) { el.innerHTML = ''; return; }

  el.innerHTML = `<div class="card">
    <div class="card-title">Evidence Boundaries</div>
    <div class="known-unknown-grid">
      <div class="ku-item known"><div class="ku-label">What we know</div><div class="ku-text">${known}</div></div>
      <div class="ku-item unknown"><div class="ku-label">What we don't know</div><div class="ku-text">${unknown}</div></div>
      <div class="ku-item needed"><div class="ku-label">Next evidence needed</div><div class="ku-text">${needed}</div></div>
    </div>
  </div>`;
}

function renderResults(output: EngineOutput): void {
  renderExecutiveSummary(output);
  renderStatusHero(output);
  renderBenchmark(output);
  renderResultsList(output);
  renderKnownUnknown(output);
  // Pro section starts hidden; populated now so it's ready when revealed
  renderProductAudit(output);
  renderCounterfactualSection(output);
  renderEvidenceSection(output);
  renderWarningsAndAssumptions(output);
  renderNegotiation(output);
  renderWhatToConfirm(output);
  // Ensure pro section is hidden at the start of each new result render
  setHidden('pro-report-section', true);
  const btn = $('btn-view-pro-report');
  if (btn) btn.textContent = 'View Professional Report';
}

// ── Run analysis ──────────────────────────────────────────────────────────────

async function runAnalysis(): Promise<void> {
  setHidden('wizard', true);
  setHidden('loading', false);
  setHidden('results-container', true);
  // Reset loading step indicators
  for (let i = 0; i < 5; i++) {
    const li = $(`ls-${i}`);
    if (li) {
      li.classList.remove('done');
      const check = li.querySelector('.check');
      if (check) check.textContent = '';
    }
  }
  try {
    await runLoadingAnimation();
    const raw = buildEngineInput();
    lastInput = raw;
    const output = runEngine(raw) as EngineOutput;
    lastOutput = output;
    setHidden('loading', true);
    setHidden('results-container', false);
    renderResults(output);
  } catch (err) {
    setHidden('loading', true);
    setHidden('wizard', false);
    goToStep(5);
    const msg = err instanceof Error ? err.message : String(err);
    showError('step-5-error', `Analysis failed: ${msg}`);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const hamburger = $('hamburger');
  const mobileMenu = $('mobile-menu');

  hamburger?.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.hidden = !mobileMenu.hidden;
    }
  });

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mobileMenu) {
      mobileMenu.hidden = true;
    }
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
      mobileMenu.hidden = true;
    }
  });

  // Mobile menu links - close menu on click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.hidden = true;
    });
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = (anchor as HTMLAnchorElement).getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (mobileMenu) mobileMenu.hidden = true;
        }
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item?.querySelector('.faq-a');
      const isOpen = btn.classList.contains('open');

      // Close all others
      document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));
      document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));

      // Toggle this one
      if (!isOpen && answer) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });

  // Landing → Wizard (multiple entry points)
  const startWizard = () => {
    setHidden('landing', true);
    setHidden('wizard', false);
    goToStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  $('btn-start')?.addEventListener('click', startWizard);
  $('btn-start-nav')?.addEventListener('click', startWizard);
  $('btn-start-mobile')?.addEventListener('click', () => {
    if (mobileMenu) mobileMenu.hidden = true;
    startWizard();
  });
  $('btn-start-final')?.addEventListener('click', startWizard);

  // "See How It Works" buttons - scroll to how-it-works section
  const scrollToHow = () => {
    const target = document.querySelector('#how-it-works');
    if (target) {
      setHidden('landing', false);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  $('btn-see-how')?.addEventListener('click', scrollToHow);
  $('btn-hero-how')?.addEventListener('click', scrollToHow);

  // Step 1 → 2
  $('btn-next')?.addEventListener('click', () => {
    clearError('step-1-error');
    const err = validateStep1();
    if (err) { showError('step-1-error', err); return; }
    saveStep1();
    renderProductCards();
    goToStep(2);
  });

  // Step 2
  $('btn-back-2')?.addEventListener('click', () => goToStep(1));
  $('btn-next-2')?.addEventListener('click', () => {
    clearError('step-2-error');
    const err = validateStep2();
    if (err) { showError('step-2-error', err); return; }
    renderProductDetails();
    goToStep(3);
  });

  // Step 3
  $('btn-back-3')?.addEventListener('click', () => goToStep(2));
  $('btn-next-3')?.addEventListener('click', () => {
    clearError('step-3-error');
    const err = validateStep3();
    if (err) { showError('step-3-error', err); return; }
    saveStep3();
    goToStep(4);
  });

  // Step 4 — discount visibility
  $('discount_status')?.addEventListener('change', updateDiscountFields);
  updateDiscountFields();

  // Step 4
  $('btn-back-4')?.addEventListener('click', () => goToStep(3));
  $('btn-next-4')?.addEventListener('click', () => {
    saveStep4();
    renderReview();
    goToStep(5);
  });

  // Step 5
  const step5Back = $('btn-back-5');
  if (step5Back) step5Back.addEventListener('click', () => goToStep(4));
  const btnAnalyze = $('btn-analyze');
  if (btnAnalyze) btnAnalyze.addEventListener('click', () => { void runAnalysis(); });

  // New analysis
  $('btn-new-analysis')?.addEventListener('click', () => {
    state = makeInitialState();
    setHidden('results-container', true);
    setHidden('loading', true);
    setHidden('wizard', true);
    setHidden('landing', false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // PDF download
  $('btn-download-pdf')?.addEventListener('click', () => {
    if (lastOutput && lastInput) generatePDF(lastOutput, lastInput);
  });

  // View Professional Report CTA
  $('btn-view-pro-report')?.addEventListener('click', () => {
    setHidden('pro-report-section', false);
    $('pro-report-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const btn = $('btn-view-pro-report');
    if (btn) btn.textContent = 'Professional Report ↓';
  });
});

