# CLAUDE HANDOFF — PROCORE RENEWAL OPTIMIZER

You are taking over an existing Procore Renewal Optimization Engine codebase.

DO NOT restart the project.
DO NOT throw away the existing brain.
DO NOT redesign the architecture just because you would prefer a different one.

Read these files FIRST:

1. PROCORE_RENEWAL_OPTIMIZER_IMPLEMENTATION_SPEC.md
2. PROCORE_RENEWAL_OPTIMIZER_RULES_AND_TESTS.json
3. PROCORE_RENEWAL_OPTIMIZER_PRODUCT_AND_INPUT_DATA.json

The existing repository also contains the earlier brain/source-of-truth files. Preserve their working implementation unless a change is required to satisfy the FINAL implementation contract.

## Your first task

Before coding:

1. Inspect the entire current repository.
2. Inspect the existing brain implementation.
3. Inspect its current tests.
4. Map existing functionality against the FINAL implementation spec.
5. Identify exactly which final requirements are already implemented and which are missing.
6. Do not rewrite working components unnecessarily.

Then produce a short implementation-readiness report.

## Critical rules

- Do not invent Procore pricing.
- Do not invent product dependencies.
- Do not invent savings.
- Do not turn benchmarks into guaranteed prices.
- Keep UNKNOWN as UNKNOWN.
- Preserve evidence IDs and provenance.
- Keep arithmetic deterministic.
- Keep LLMs out of the financial calculation path.
- Do not build PDF parsing in the initial MVP.
- Do not build payments/auth/database infrastructure unless explicitly required by the existing architecture and current MVP scope.
- Do not build a generic chatbot.
- Do not build a generic SaaS spend-management product.
- Do not imply Procore affiliation.

## Important evolution from the old implementation

The old brain correctly implemented a conservative UNKNOWN guard and verified before/after savings.

The FINAL contract additionally allows:

1. A defensible potential savings/range when sufficiently comparable evidence supports a counterfactual scenario.
2. A distinct OPPORTUNITY_NOT_QUANTIFIABLE result when a candidate exists but the alternative price cannot be defended.
3. A target-price fallback that calculates a negotiation threshold, NOT a predicted Procore price.
4. A manual structured questionnaire for usage, requirements, replacement workflow and renewal changes.
5. Freemium outputs.
6. A negotiation/report layer.
7. The eventual frontend.

Do not weaken the old guards to implement these. Extend them.

## Required implementation order

PHASE 1
- Map existing engine to final contract.
- Preserve existing tests.
- Fix contradictions only where final contract explicitly supersedes an older rule.

PHASE 2
- Implement final customer input schema.
- Implement validation.
- Implement adaptive candidate-question logic.

PHASE 3
- Implement product/capability/tool dependency model.
- Ensure requirement and dependency guards block invalid candidates.

PHASE 4
- Implement candidate configuration generation.
- Keep candidate generation separate from commercial pricing.

PHASE 5
- Implement counterfactual pricing:
  - verified quote pair
  - sufficiently comparable evidence
  - bounded potential range
  - otherwise UNKNOWN
- Never produce false precision.

PHASE 6
- Implement target-price calculation.

PHASE 7
- Implement final EngineResult / result classification:
  VERIFIED_BEFORE_AFTER
  SAVINGS_IDENTIFIED
  OPPORTUNITY_NOT_QUANTIFIABLE
  NO_DEFENSIBLE_SAVINGS_IDENTIFIED

PHASE 8
- Implement free result payload.
- Implement detailed paid-report payload without requiring payment integration yet.

PHASE 9
- Implement negotiation recommendations from structured engine outputs.

PHASE 10
- Implement frontend only after the engine contracts are stable.

## Frontend must ultimately implement this flow

Landing
→ Start Free Analysis
→ Commercial baseline
→ Products
→ Usage
→ Requirement
→ Replacement/dependency
→ Renewal questions
→ Run Analysis
→ Free result
→ Detailed report / paid unlock

Use controlled options instead of free text whenever possible.

## Free result behavior

The user MUST receive a useful answer before payment.

Possible outcomes:

A. Potential savings identified
B. No defensible savings identified
C. Optimization opportunity identified — savings not yet quantifiable
D. Verified savings

Never hide the basic verdict behind the paywall.

## Paid report behavior

Unlock:
- full configuration comparison
- evidence chain
- calculation
- assumptions
- confidence
- dependencies
- commercial risks
- negotiation target
- questions to ask Procore
- detailed recommendations

## Engineering quality

After each meaningful implementation phase:

- run tests
- run typecheck/build
- fix regressions
- add tests for new rules
- report changed files
- report what is now complete
- report what remains

Do not stop at scaffolding.

The end goal is a small, professional, trustworthy Procore renewal optimization product — not a demo that generates impressive-looking numbers.
