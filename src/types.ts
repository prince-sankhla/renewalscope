// src/types.ts — all domain types, enums, and interfaces

// ── Evidence classification ────────────────────────────────────────────────

export enum ConfidenceLevel {
  FACT = 'FACT',
  OBSERVATION = 'OBSERVATION',
  BENCHMARK = 'BENCHMARK',
  UNKNOWN = 'UNKNOWN',
}

// ── Final result classification (§5 of implementation spec) ───────────────

export enum ResultType {
  VERIFIED_BEFORE_AFTER = 'VERIFIED_BEFORE_AFTER',
  SAVINGS_IDENTIFIED = 'SAVINGS_IDENTIFIED',
  OPPORTUNITY_NOT_QUANTIFIABLE = 'OPPORTUNITY_NOT_QUANTIFIABLE',
  NO_DEFENSIBLE_SAVINGS_IDENTIFIED = 'NO_DEFENSIBLE_SAVINGS_IDENTIFIED',
  // WARNING is an internal/secondary annotation signal, not a top-level result class.
  WARNING = 'WARNING',
}

export enum EvidenceConfidence {
  OBSERVATION = 'OBSERVATION',
  BENCHMARK = 'BENCHMARK',
  VERIFIED_PUBLIC_DOCUMENT = 'VERIFIED_PUBLIC_DOCUMENT',
  DUPLICATE = 'DUPLICATE',
}

export type EvidenceSourceType =
  | 'PUBLIC_QUOTE'
  | 'PUBLIC_CUSTOMER_OBSERVATION'
  | 'OFFICIAL'
  | 'USER_SUPPLIED';

export type LimitationFlag =
  | 'POOLED_CV'
  | 'MAX_PRICE_QUOTE'
  | 'BAND_NORMALIZED'
  | 'ESTIMATE_NOT_FINAL'
  | 'RESELLER_QUOTE'
  | 'PROJECT_SPECIFIC_LICENSE'
  | 'INCOMPLETE_RECORD';

export type AcvType = 'company' | 'project' | 'unknown';

// ── Product questionnaire enums ────────────────────────────────────────────

export enum UsageRating {
  CRITICAL = 'CRITICAL',       // used daily
  REGULAR = 'REGULAR',         // used weekly
  OCCASIONAL = 'OCCASIONAL',
  RARELY = 'RARELY',
  NOT_USED = 'NOT_USED',
  NOT_SURE = 'NOT_SURE',
}

export enum RequirementStatus {
  BUSINESS_CRITICAL = 'BUSINESS_CRITICAL',
  CLIENT_CONTRACT = 'CLIENT_CONTRACT',
  INTERNAL_POLICY = 'INTERNAL_POLICY',
  NOT_REQUIRED = 'NOT_REQUIRED',
  NOT_SURE = 'NOT_SURE',
}

export enum ReplacementOption {
  ANOTHER_TOOL = 'ANOTHER_TOOL',
  INTERNAL_PROCESS = 'INTERNAL_PROCESS',
  NOT_NEEDED = 'NOT_NEEDED',
  NO_REPLACEMENT = 'NO_REPLACEMENT',
  NOT_SURE = 'NOT_SURE',
}

export enum DependencyFlag {
  YES = 'YES',
  NO = 'NO',
  NOT_SURE = 'NOT_SURE',
}

// ── Commercial input enums ─────────────────────────────────────────────────

export enum DiscountStatus {
  PCT_KNOWN = 'PCT_KNOWN',
  USD_KNOWN = 'USD_KNOWN',
  SHOWN_IN_QUOTE = 'SHOWN_IN_QUOTE',
  DONT_KNOW = 'DONT_KNOW',
}

export enum BundleStructure {
  BUNDLED = 'BUNDLED',
  POOLED = 'POOLED',
  STANDARD = 'STANDARD',
  UNKNOWN = 'UNKNOWN',
}

export enum TierChangedFlag {
  YES = 'YES',
  NO = 'NO',
  NOT_SURE = 'NOT_SURE',
}

export type TargetSavingsPct = 5 | 10 | 15 | 20 | null;

// ── Product/capability model enums (§11–§12 of implementation spec) ────────

// Top-level commercial product categories currently disclosed by Procore.
// UNCATEGORIZED is used where the source documents do not state an explicit
// category for a product — do not guess a category that isn't sourced.
export enum ProductCategory {
  PRECONSTRUCTION = 'PRECONSTRUCTION',
  PROJECT_EXECUTION = 'PROJECT_EXECUTION',
  RESOURCE_MANAGEMENT = 'RESOURCE_MANAGEMENT',
  FINANCIAL_MANAGEMENT = 'FINANCIAL_MANAGEMENT',
  UNCATEGORIZED = 'UNCATEGORIZED',
}

export type PricingBasis = 'acv' | 'fte' | 'unknown';

// Relationship type between a commercial product and a dependent tool/workflow/integration,
// per §11–§12: represent the relationship type rather than a simplistic "A depends on B".
export enum DependencyRelationType {
  CAPABILITY_LICENSING = 'CAPABILITY_LICENSING',
  CAPABILITY_WORKFLOW = 'CAPABILITY_WORKFLOW',
  INTEGRATION = 'INTEGRATION',
  SOFT_DATA_CONSUMPTION = 'SOFT_DATA_CONSUMPTION',
  BUSINESS_DEPENDENCY = 'BUSINESS_DEPENDENCY',
}

// Candidate eligibility state, derived from requirement/dependency evidence.
// NOT_APPLICABLE is used when a documented relationship does not require
// confirmation by default (e.g. Analytics → Operational modules).
export type CandidateEligibility = 'ELIGIBLE' | 'BLOCKED' | 'UNCERTAIN' | 'NOT_APPLICABLE';

// ── Per-product structured input ───────────────────────────────────────────

export interface ProductInput {
  product_id: string;
  usage: UsageRating;
  requirement: RequirementStatus;
  replacement: ReplacementOption;
  dependency: DependencyFlag;
  /** Line-item annual price from user's quote, if known */
  annual_price_usd?: number;
}

// ── Evidence row ───────────────────────────────────────────────────────────

export interface EvidenceRow {
  evidence_id: string;
  confidence: EvidenceConfidence;
  acvType: AcvType;
  acv_usd?: number;
  annual_cost_usd?: number;
  rate_per_1m?: number;
  renewal_increase_pct?: number;
  prev_rate_per_1m?: number;
  products?: string[];
  contract_term?: string;
  note?: string;
  source_url?: string;
  duplicate_of?: string;
  source_type?: EvidenceSourceType;
  source_description?: string;
  source_date?: string;
  normalized_product_id?: string;
  acv_band_min_usd?: number;
  acv_band_max_usd?: number;
  quoted_product_annual_price_usd?: number;
  limitation_flags?: LimitationFlag[];
  exclude_from_rate_benchmark?: boolean;
  exclude_from_calculations?: boolean;
}

// ── User input (commercial baseline + product questionnaire) ───────────────

export interface UserInput {
  // Required commercial baseline
  annual_cost_usd: number;
  acv_usd: number;
  /** Flat list derived from product_inputs; kept for backward compat with benchmark matching */
  products: string[];
  contract_term: 'annual' | 'multi_year';

  // Structured per-product inputs (replaces the flat products[] for engine logic)
  product_inputs?: ProductInput[];

  // Recommended commercial fields
  discount_status?: DiscountStatus;
  discount_pct?: number;             // populated when discount_status === PCT_KNOWN
  discount_usd?: number;             // populated when discount_status === USD_KNOWN
  bundle_structure?: BundleStructure;
  credits_usd?: number;

  // Renewal signals
  renewal_increase_pct?: number;
  tier_changed?: TierChangedFlag;
  packaging_changed?: TierChangedFlag;
  rate_protection_status?: 'active' | 'unclear' | 'none';
  expected_next_year_acv_usd?: number;

  // Optional goal / profile
  target_savings_pct?: TargetSavingsPct;
  construction_type?: 'commercial' | 'industrial' | 'civil_infrastructure' | 'other';

  // Optional before/after quote evidence (VERIFIED_BEFORE_AFTER path)
  before_annual_cost_usd?: number;
  after_annual_cost_usd?: number;

  // Legacy optional field (v1 compatibility)
  prior_rate_per_1m_usd?: number;
}

// ── Rate stats and benchmark ───────────────────────────────────────────────

export interface RateStats {
  min: number;
  max: number;
  p25: number;
  p50: number;
  p75: number;
  mean: number;
  count: number;
}

export type RatePosition = 'below_p25' | 'p25_to_p50' | 'p50_to_p75' | 'above_p75';

export interface BenchmarkResult {
  user_rate: number;
  stats: RateStats;
  position: RatePosition;
  comparable_evidence_ids: string[];
  /** False when the evidence sample is too small for reliable percentile output */
  min_evidence_count_met: boolean;
}

// ── Rule / engine result ───────────────────────────────────────────────────

export interface RuleResult {
  result_type: ResultType;
  confidence: ConfidenceLevel;
  recommendation_text: string;
  comparable_evidence: string[];
  explanation: string;
  dollar_saving?: number;
  saving_range?: [number, number];
  assumptions?: string[];
  candidate_product_id?: string;
  target_price?: number;
}

export interface EngineResult {
  result_type: ResultType;
  confidence: ConfidenceLevel;
  recommendation_text: string;
  comparable_evidence: string[];
  explanation: string;
  dollar_saving?: number;
  saving_range?: [number, number];
  assumptions?: string[];
  candidate_product_id?: string;
  target_price?: number;
}

// ── Candidate (generated by candidate stage, not yet implemented) ──────────

export interface CandidateProduct {
  product_id: string;
  usage: UsageRating;
  requirement: RequirementStatus;
  replacement: ReplacementOption;
  dependency: DependencyFlag;
  annual_price_usd?: number;
  /** Populated when the candidate is blocked by a requirement or dependency check */
  blocked_reason?: string;
}

// ── Counterfactual result (populated by counterfactual stage) ─────────────

export interface CounterfactualResult {
  result_class: ResultType;
  candidate: CandidateProduct;
  dollar_saving?: number;
  saving_range?: [number, number];
  target_price?: number;
  assumptions: string[];
  evidence_ids: string[];
  confidence: ConfidenceLevel;
  explanation: string;
}

export type ProductQuoteComparability = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ProductQuoteMatch {
  row: EvidenceRow;
  comparability: ProductQuoteComparability;
  comparability_reason: string;
}

export interface QuoteEvidenceRecord {
  evidence_id: string;
  source_description: string;
  product_reported: string;
  normalized_product_id: string | undefined;
  acv_context: string;
  quoted_annual_price_usd: number | null;
  term: string;
  limitation_flags: string[];
  what_it_supports: string;
  what_it_does_not_support: string;
  exclude_from_calculations: boolean;
}

export interface QuoteEvidenceSummary {
  dataset_name: string;
  total_records: number;
  usable_records: number;
  excluded_records: number;
  products_covered: string[];
  records: QuoteEvidenceRecord[];
}

// ── Negotiation output (populated by negotiation stage) ───────────────────

export interface NegotiationOutput {
  what_to_ask: string;
  why: string;
  configuration_requested: string;
  target_price?: number;
  max_acceptable_price?: number;
  evidence_ids: string[];
  unknowns: string[];
  confirm_in_writing: string[];
  risks: string[];
}

// ── Freemium result payloads ───────────────────────────────────────────────

export interface FreeResult {
  verdict: ResultType;
  current_spend: number;
  effective_rate?: number;
  benchmark_position?: RatePosition;
  main_opportunity?: string;
  /** Only populated when result_class is VERIFIED_BEFORE_AFTER or SAVINGS_IDENTIFIED */
  savings_amount?: number;
  savings_range?: [number, number];
  confidence: ConfidenceLevel;
  explanation: string;
  warnings: string[];
  what_to_confirm: string[];
  benchmark_evidence_note?: string;
}

export interface PaidReport {
  current_configuration: ProductInput[];
  candidate_configurations: CandidateProduct[][];
  counterfactual_results: CounterfactualResult[];
  benchmark?: BenchmarkResult;
  evidence_trail: string[];      // evidence_ids referenced by the analysis
  assumptions: string[];
  confidence_rationale: string;
  dependency_findings: string[];
  legacy_rate_warnings: string[];
  commercial_risks: string[];
  negotiation?: NegotiationOutput;
  suggested_questions: string[];
  renewal_strategy: string;
  audit_trail: string[];
  quote_evidence_summary?: QuoteEvidenceSummary;
}
