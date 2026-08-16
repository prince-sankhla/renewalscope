# PROCORE RENEWAL OPTIMIZER — FINAL IMPLEMENTATION CONTRACT

Version: 1.0
Date: 2026-08-13
Status: AUTHORITATIVE FOR MVP IMPLEMENTATION

## 0. Mission

Build a trustworthy Procore renewal optimization product for construction companies.

The product takes a customer's current Procore commercial configuration and structured business/usage inputs, evaluates renewal economics against the evidence base, identifies valid optimization opportunities, quantifies savings only when the counterfactual price is defensible, and otherwise explains uncertainty professionally.

This is NOT a generic SaaS spend tracker, generic price calculator, Procore clone, or chatbot.

The product must be evidence-first, deterministic for financial logic, explainable, conservative about unsupported claims, and useful even when exact savings cannot be established.

---

## 1. NON-NEGOTIABLE SAFETY / TRUTH RULES

1. Never invent Procore prices, discounts, dependencies, eligibility, package behavior, or savings.
2. Preserve evidence classes exactly:
   - FACT = official / primary documented commercial or product fact
   - OBSERVATION = directly reported customer/public procurement evidence
   - BENCHMARK = secondary/aggregated/comparative evidence
   - UNKNOWN = insufficient evidence
3. UNKNOWN stays UNKNOWN until stronger evidence or user-provided evidence resolves it.
4. Never treat a product's current quote line-item price as automatic savings after removal.
5. Never calculate a dollar saving from a benchmark alone.
6. Never mix company ACV with project-value evidence.
7. Keep evidence IDs/provenance attached to every material recommendation.
8. Never claim Procore affiliation.
9. Never guarantee savings.
10. Never tell a user that a configuration change is definitely valid if commercial removability/dependency evidence is incomplete.
11. Prefer:
   - "Ask Procore whether..."
   - "Request a comparable quote..."
   - "Compare a quote holding other terms constant..."
   instead of unsupported:
   - "Remove X and you will save Y."
12. A user's current quote is evidence of their current commercial state, not proof of the counterfactual renewal price.

---

## 2. WHAT THE PRODUCT DOES

The product has five jobs:

A. Reconstruct the customer's current renewal economics.
B. Understand which products/capabilities are actually needed.
C. Generate only commercially/operationally plausible optimization candidates.
D. Determine whether a defensible counterfactual price exists.
E. Produce a clear free result and a detailed paid report/negotiation plan.

---

## 3. INITIAL MVP: MANUAL-FIRST

Do NOT build a PDF/quote parser in the first MVP.

The user enters structured data manually through controlled UI inputs.

Use:
- dropdowns
- radio buttons
- multi-selects
- checkboxes
- numeric currency/percentage fields

Avoid open-ended free text wherever the engine needs deterministic signals.

Later, a PDF parser can populate exactly the same input schema. The schema must therefore be designed cleanly now.

---

## 4. USER JOURNEY — COMPLETE

### Step 1 — Landing / positioning

Explain in one screen:

"Analyze your Procore renewal configuration, benchmark your commercial position, identify potential optimization opportunities, and determine whether savings can be defensibly quantified."

Do not promise savings.

CTA:
"Start Free Analysis"

---

### Step 2 — Commercial baseline

Collect:

REQUIRED
- Current annual renewal/subscription spend
- Current Procore products/capabilities
- Annual Construction Volume (ACV)
- Contract term
- Product-level annual/net prices where available

RECOMMENDED
- Current discount (% or $ or "shown in quote" / "don't know")
- Bundle/package structure
- Pooled-volume structure
- Credits/adjustments
- Rate protection status

OPTIONAL
- Previous renewal information
- Alternative quote
- Target savings
- Construction type

Never force users to understand Procore's internal pricing terminology.

---

### Step 3 — Product usage questionnaire

For each selected product/capability:

"How much do you actually use this?"

Options:
- Critical — used daily
- Regular — used weekly
- Occasional
- Rarely used
- Not used
- Not sure

Then ask only relevant follow-ups.

---

### Step 4 — Requirement check

For candidate products:

"Do you need this capability?"

Options:
- Business-critical
- Required by client/contract
- Required by internal policy
- Not required
- Not sure

If required, the candidate is blocked or downgraded.

---

### Step 5 — Replacement/workflow check

"If this capability were not in your Procore configuration, how would the work be handled?"

Options:
- Another software/tool
- Internal process
- Workflow is not needed
- No replacement
- Not sure

This is used to validate operational feasibility.

---

### Step 6 — Dependency check

Do not make users understand technical dependency graphs.

Ask simple questions only where needed.

Options:
- Yes
- No
- Not sure

The engine itself should know documented capability/tool relationships.

Commercial product, category, capability, and tool are separate concepts.

---

### Step 7 — Renewal change questions

Recommended:

"Did Procore propose a new tier or package for this renewal?"
- Yes
- No
- Not sure

"Did any feature become a-la-carte or change packaging?"
- Yes
- No
- Not sure

These signals are especially relevant to renewal optimization.

---

### Step 8 — Engine analysis

The deterministic engine:

1. Reconstructs current spend.
2. Calculates effective rate where valid.
3. Matches comparable evidence.
4. Positions the customer against P25/P50/P75 where sample/evidence gates permit.
5. Checks commercial structure.
6. Checks legacy-rate risk.
7. Checks renewal increase evidence.
8. Evaluates usage/requirements/dependencies.
9. Generates candidate configurations.
10. Tests whether each candidate has defensible commercial evidence.
11. Calculates:
   - verified savings,
   - potential savings/range,
   - or no quantification.
12. Produces negotiation targets where useful.
13. Produces evidence-linked explanations.

LLM may help explain results in natural language, but must not invent or independently calculate the underlying financial result.

---

# 5. SAVINGS ENGINE — FINAL BEHAVIOR

There are four meaningful result classes.

### A. VERIFIED_BEFORE_AFTER

Use when there is a comparable written quote pair or actual before/after commercial outcome.

Formula:

annual_before - annual_after = verified annual savings

This is the strongest claim.

---

### B. SAVINGS_IDENTIFIED / POTENTIAL

Use when a defensible counterfactual price/range can be derived from sufficiently comparable evidence and explicit assumptions.

Show:
- current annual spend
- candidate configuration
- estimated alternative price/range
- potential annual savings/range
- confidence
- evidence
- assumptions

Do NOT present an inferred price as an official Procore price.

---

### C. OPPORTUNITY_NOT_QUANTIFIABLE

Use when a valid optimization candidate exists but the resulting renewal price cannot be defensibly established.

Example:

"Invoice Management is reported as not used and no known requirement prevents a configuration change. Your current attributable spend is $16,945/year. However, available evidence is insufficient to determine the resulting renewal price. Request a comparable quote before treating this as a dollar saving."

Do not show "$16,945 savings."

---

### D. NO_DEFENSIBLE_SAVINGS_IDENTIFIED

Use when no valid optimization candidate survives requirements/dependencies/evidence checks.

Professional wording:

"Based on the information provided and the available evidence, we did not identify a lower-cost configuration whose savings can be defended."

Do NOT say:
"You cannot save money."

---

## 6. TARGET-PRICE FALLBACK

If a candidate is valid but alternative price is unknown, and the user provides a savings target:

maximum acceptable alternative price = current spend × (1 - target %)

Example:
Current = $147,596
Target = 10%
Maximum acceptable alternative = $132,836.40

This is a NEGOTIATION TARGET, not a prediction of what Procore will quote.

---

# 7. BENCHMARKING

Benchmarks are context, not guarantees.

Use P25/P50/P75 where the evidence sample is sufficiently comparable and evidence-count gates allow it.

Always distinguish:
- company ACV
- project construction value
- product scope
- contract term
- commercial structure

A project-level $20k observation on a $15M job must not silently become a company-ACV benchmark.

---

# 8. COMMERCIAL RULES

Current Procore commercial economics can depend on:
- product mix
- construction volume / ACV
- contract term
- bundle/package
- pooled volume
- discounts
- credits/adjustments
- customer-specific negotiation

Therefore:
- no universal module price formula
- no "module price = X% of renewal" rule
- no assumption that a discount survives a reconfiguration
- no assumption that removing a line item reduces total renewal by that line-item amount

---

# 9. LEGACY-RATE SAFETY

If a customer's effective rate appears unusually favorable versus comparable evidence:

Surface a WARNING before recommending restructuring.

Explain that restructuring can expose a customer to current-market pricing.

Do not recommend changing configuration solely to save money.

---

# 10. RENEWAL RULES

Examples from the rule engine:

- 1-year term → surface option to ask about a multi-year pool quote.
- Expected next-year ACV > current ACV × 1.15 → surface option to ask about pre-priced volume treatment.
- 1-year term OR rate protection unclear → surface option to ask whether renewal rate protection can be added.
- Renewal increase supplied → compare against project evidence panel; never call a universal "normal" increase.
- >5% and >14% renewal-increase observations may be used as evidence-linked warning thresholds only when the evidence rules permit; never present them as universal Procore policy.

---

# 11. PRODUCT / CAPABILITY MODEL

Do NOT model every UI navigation item as an independently priced product.

Maintain hierarchy:

Commercial Product
→ Product Category
→ Capability
→ Tool / Workflow
→ Licensing / dependency relationship

Current disclosed top-level product categories include:
- Preconstruction
- Project Execution
- Resource Management
- Financial Management

Current commercial packaging also evolves; treat current official Procore documentation as the source of truth for current taxonomy and packaging.

Quality & Safety requires special handling:
- It is a commercial/product concept.
- Its individual tools/capabilities must be represented separately.
- Project Management relationships must not be treated as proof that every tool is independently removable.

---

# 12. DEPENDENCY EXAMPLES

Known examples from official support evidence include relationships involving:
- Inspections
- Incidents
- Observations
- Forms
- Daily Log
- Project Management
- Project Financials
- Accounting/ERP integrations

The implementation must represent the relationship type rather than assuming a simplistic "A depends on B" for every workflow.

If evidence is incomplete:
UNKNOWN.

---

# 13. EVIDENCE HIERARCHY

Priority:

1. Official Procore documentation / SEC filings = FACT
2. Customer-reported direct evidence = OBSERVATION
3. Secondary/aggregated evidence = BENCHMARK
4. Missing/uncertain = UNKNOWN

Every evidence item should carry:
- evidence_id
- source
- date
- evidence_type
- confidence
- product scope
- ACV type
- contract term if known
- before cost if known
- after cost if known
- savings if actually established
- limitations
- provenance

---

# 14. FREE PRODUCT RESULT

The user must receive a useful answer before any paywall.

Free analysis should show:

- overall verdict
- current annual spend
- effective rate when valid
- benchmark position when valid
- main optimization opportunity/opportunities
- potential savings amount/range ONLY if defensible
- confidence
- short explanation
- key warning(s)
- what needs to be confirmed

Three common free outcomes:

1. "Potential savings identified"
2. "No defensible savings identified"
3. "Optimization opportunity identified — savings not yet quantifiable"

A fourth stronger result:
"Verified savings" when comparable before/after evidence exists.

---

# 15. PAID REPORT

Paid unlock should provide depth, not hide the basic answer.

Paid report can include:

- current configuration table
- product/capability analysis
- candidate configuration(s)
- current vs alternative economics
- calculation
- evidence IDs and source trail
- benchmark comparisons
- assumptions
- confidence rationale
- dependency/requirement findings
- legacy-rate warnings
- commercial risks
- negotiation target
- suggested questions to ask Procore
- negotiation priorities
- renewal strategy
- detailed audit trail

Do not invent negotiation leverage that is not supported by evidence.

---

# 16. NEGOTIATION ENGINE

Negotiation output should be structured:

1. What to ask Procore
2. Why to ask
3. Configuration being requested
4. Target price, if determinable
5. Maximum acceptable price, if target-based
6. Evidence supporting the request
7. What is unknown
8. What must be confirmed in writing
9. Risks / tradeoffs

Use language like:
"Request a written quote for..."
"Ask Procore to hold X constant while repricing Y..."
"Ask whether rate protection can be added..."
"Compare the proposed multi-year pool quote against the current renewal..."

Never:
"Procore will give you..."
"You will definitely save..."

---

# 17. FRONTEND UX

Style:
- professional
- trustworthy
- clean
- construction/finance oriented
- no "AI toy" aesthetic
- simple white/light interface is acceptable
- clear status labels

Core flow:

Landing
→ Start Free Analysis
→ Commercial baseline
→ Products
→ Usage
→ Requirement
→ Dependency/replacement questions
→ Renewal questions
→ Run Analysis
→ Free result
→ Paid report CTA

The questionnaire should be adaptive. Do not ask every question for every product.

Example:
Not used + not required → fewer follow-ups.
Rarely used + client requirement → ask why it must remain.
Unknown → ask the minimum question needed to resolve uncertainty.

---

# 18. TRUST / DISCLAIMERS

Use:

"We value your money. Please cross-check our estimate against your actual quote before making any renewal decision."

Also state:
- Not affiliated with Procore.
- Benchmarks are not official Procore pricing.
- Savings are estimates unless explicitly marked verified.
- Customer-specific pricing can differ.

---

# 19. LLM BOUNDARY

Deterministic engine owns:
- arithmetic
- evidence filtering
- comparability
- confidence
- result classification
- candidate eligibility
- savings calculation
- target price

LLM may own:
- explanation
- summarization
- natural-language report
- negotiation wording

LLM must receive structured engine output and evidence references.

Never let an LLM invent a missing number and feed it back into the savings engine.

---

# 20. DATA / CODE ARCHITECTURE

Preserve the existing brain architecture. Do NOT restart or redesign unnecessarily.

Extend the current engine rather than replacing it.

Recommended domain layers:

evidence
→ commercial model
→ customer input
→ comparability
→ rules
→ candidate generation
→ counterfactual pricing
→ savings
→ result assembly
→ presentation/report

Keep financial logic deterministic and unit-testable.

---

# 21. TEST REQUIREMENTS

At minimum test:

- effective-rate calculation
- ACV/project-value separation
- evidence filtering
- P25/P50/P75 positioning
- legacy-rate warning
- renewal-increase warning
- unknown configuration guard
- verified before/after savings
- potential/range savings
- no-quantification outcome
- no-opportunity outcome
- target-price calculation
- dependency blocking
- required-by-contract blocking
- unknown requirement handling
- discount-unknown behavior
- bundle/pool comparison guard
- evidence provenance retention
- result priority

Use the final test cases data file as acceptance scenarios.

---

# 22. CURRENT IMPLEMENTATION STATUS

Existing Claude work already includes:
- evidence dataset loading/validation
- duplicate exclusion
- project vs company ACV separation
- effective-rate calculation
- comparable evidence matching
- P25/P50/P75 benchmark positioning
- commercial-structure rule
- high-rate benchmark flag
- legacy-rate warning
- renewal increase warning
- verified before/after savings
- UNKNOWN configuration guard
- result priority
- tests

Do NOT throw this work away.

Remaining product layers:
- final candidate/configuration logic
- final manual input schema integration
- potential/range counterfactual pricing where evidence supports it
- target-price output
- freemium result contract
- negotiation/report layer
- frontend
- later API/database/auth/payment only if needed after MVP

---

# 23. DEFINITION OF DONE FOR MVP

The MVP is done when a real user can:

1. Enter their current Procore commercial information.
2. Select their current products.
3. Answer controlled usage/requirement/replacement questions.
4. Run an analysis.
5. Receive one of the correct result classes.
6. See a defensible saving only when the evidence permits it.
7. See benchmark/effective-rate context when available.
8. See warnings when restructuring could be risky.
9. See what must be requested/confirmed from Procore when savings are unknown.
10. Receive a clear negotiation target when target-price logic is applicable.
11. Understand why the engine reached its conclusion.
12. Have every important financial claim traceable to evidence or user input.

The MVP is NOT done if it merely produces a plausible-looking dollar number.

---

# 24. IMPLEMENTATION PRINCIPLE

Build the smallest trustworthy product.

Do not add features merely because they are technically interesting.

Do not weaken evidence gates to make the product look more impressive.

The product's competitive advantage is not "AI"; it is domain-specific, evidence-backed renewal reasoning that refuses to fake certainty.
