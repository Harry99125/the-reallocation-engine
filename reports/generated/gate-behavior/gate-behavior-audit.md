# Gate Behavior Harness — Chapter 11 / Chapter 16

- Generated: 2026-08-16T00:22:04.238Z
- Machine handoff result: **PASS**
- Human decision: **HUMAN_REVIEW_REQUIRED**
- Production cases: 6/6 passed
- Production assertions: 40/40 passed
- Deliberate gate-as-vote mutation detected: **PASS**

## Executable contract

`composite = (sum of weighted votes) × liveness × timeline`

Liveness and timeline remain outside the vote list. An exact zero in either gate must produce composite `0` and machine recommendation `Skip`, even with perfect sponsorship and fit.

## Production scorer results

| Case | Liveness × timeline behavior | Expected | Observed | Result |
|---|---|---|---|---|
| open-gates-control | positive control: strong votes may Apply only when both gates are open | 0.6500 / Apply | 0.6500 / Apply | **PASS** |
| liveness-zero-high-votes | named mutation witness: a ghost posting cannot be rescued by perfect votes | 0.0000 / Skip | 0.0000 / Skip | **PASS** |
| timeline-zero-high-votes | named mutation witness: an impossible timeline cannot be rescued by perfect votes | 0.0000 / Skip | 0.0000 / Skip | **PASS** |
| both-gates-zero-high-votes | both closed gates still produce one hard-stop outcome | 0.0000 / Skip | 0.0000 / Skip | **PASS** |
| fractional-gates-scale | nonzero gates scale the vote sum multiplicatively | 0.2600 / Consider | 0.2600 / Consider | **PASS** |
| closed-gate-policy-boundary | the configured closed-gate boundary is a hard stop even when its factor is not exactly zero | 0.0325 / Skip | 0.0325 / Skip | **PASS** |

## Deliberate break: gate-as-vote

The sentinel implementation intentionally adds liveness and timeline as weighted terms. The two high-vote witnesses below would receive a plausible-looking Apply if that named capstone bug reached production.

| Witness | Contract expected | Mutated result | Failed assertions | Detection |
|---|---|---|---|---|
| liveness-zero-high-votes | 0.0000 / Skip | 0.8000 / Apply | composite, recommendation, gate-product, gates-stay-out-of-votes, gate-trace-shape, gate-trace-values, closed-gate-reason | **CAUGHT** |
| timeline-zero-high-votes | 0.0000 / Skip | 0.8500 / Apply | composite, recommendation, gate-product, gates-stay-out-of-votes, gate-trace-shape, gate-trace-values, closed-gate-reason | **CAUGHT** |

## Evidence and limits

- Fixture: `data/examples/gate-behavior-cases.json`
- Contract sources: `chapters/11-the-bayesian-role-scorer.md` and `chapters/16-the-build-and-the-honest-run.md`.
- This harness verifies scorer mechanics. It does not establish whether an upstream liveness observation or a personal timeline factor is true.
- Weight calibration and the final go/no-go decision remain human judgments.
