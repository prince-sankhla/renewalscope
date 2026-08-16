# PROCORE BRAIN SPEC — v1

## 1. What the brain is

The brain is **not** a Procore price predictor.

It is an evidence-driven decision engine:

**User configuration + contract facts + public evidence → comparable evidence → conservative flags/recommendations → explanation + confidence**

The engine must separate:
- **FACT** — directly supported by Procore
- **OBSERVATION** — directly reported customer/public evidence
- **BENCHMARK** — aggregated/secondary evidence
- **UNKNOWN** — insufficient evidence

## 2. Core safety rule

Never turn `UNKNOWN` into `FACT`.

In particular, the current evidence does **not** establish a complete commercial dependency/removability matrix for Procore products. Therefore the engine must not say:

> "Remove X and save $Y."

Instead it may say:

> "Ask Procore for a quote with X removed while holding the other terms constant, then compare the two configurations."

## 3. What can produce a dollar saving

A dollar saving is allowed only when there is a comparable **before → after** outcome:

`verified_before_annual_cost - verified_after_annual_cost`

or when the user supplies two comparable quotes.

Benchmark rates alone cannot create a claimed saving.

## 4. Current recommendation layers

### Layer A — Official commercial structures

These can produce **POTENTIAL** recommendations when the user's inputs match documented structures:
- multi-year pool
- volume opt-in
- renewal rate protection

The engine must say "ask Procore whether..." rather than asserting eligibility.

### Layer B — Benchmark comparison

Use the customer evidence dataset to show where the user's stated cost/rate sits relative to comparable public observations.

Do not call a single number "the normal Procore price."

Do not mix project-value observations with company-ACV observations.

### Layer C — Configuration optimization

Currently **guarded**.

A configuration change can become actionable only when reliable evidence establishes the relevant commercial relationship. Until then:

`UNKNOWN → request comparable written quote → compare`

## 5. Legacy-rate protection

If a user's rate is unusually favorable relative to comparable evidence, the engine should prioritize a **WARNING**:

> "Your rate appears favorable relative to reported ranges. Confirm the commercial impact in writing before restructuring the contract; changing a legacy configuration can expose you to current pricing."

Do not recommend restructuring merely because the benchmark suggests a lower current-market rate.

## 6. Output contract

Every result must be one of:

- **VERIFIED** — official rule + user data directly establish applicability.
- **POTENTIAL** — documented option appears relevant, but eligibility/price is unconfirmed.
- **WARNING** — material commercial risk detected.
- **UNKNOWN** — evidence is insufficient; no unsupported recommendation or saving figure.

## 7. Current evidence position

The current workbook contains 22 evidence rows. These are **not 22 independent customers**. Some are multiple observations from the same public discussions, while some are secondary reproductions or public procurement estimates.

The dataset is therefore suitable for **directional benchmarking and evidence discovery**, not for claiming statistical market pricing.

## 8. What remains intentionally unknown

- Complete commercial product-dependency matrix
- Universal product removability rules
- Exact customer-specific price for a module
- Universal discount schedule
- Universal renewal increase
- Eligibility of a particular customer for a commercial structure
- Guaranteed savings from changing configuration

These must remain UNKNOWN until supported by better evidence.

## 9. Implementation order

1. Implement the evidence/confidence model and output contract.
2. Implement official commercial-structure rules.
3. Implement benchmark comparison with evidence separation.
4. Keep configuration optimization behind the UNKNOWN guard.
5. Activate dollar-savings claims only from comparable before/after evidence.

**This document is the decision-engine contract. It should be handed to Claude before implementation.**
