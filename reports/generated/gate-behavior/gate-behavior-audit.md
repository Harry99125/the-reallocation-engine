# Gate Behavior Harness — Chapter 11 / Chapter 16

Generated: 2026-08-16T23:53:14.670Z

Machine handoff result: **PASS**. Human decision: **HUMAN_REVIEW_REQUIRED**.

The production scorer passed 3 of 3 cases and 19 of 19 assertions. The deliberate gate-as-vote bug was **CAUGHT**.

## Database record used

Source: `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`

SHA-256: `b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb`

The script read 30369 stored rows and 20 columns. It found 1557 complete H-1B records and 0 approval-rate arithmetic mismatches.

It used stored record 80: **1LIFE HEALTHCARE INC**. The record says 2 approvals, 0 denials, and an approval rate of 100.0000%. Recomputing approvals divided by total petitions gives 100.0000%, so the arithmetic check is **PASS**.

Selection rule: first complete H-1B record in stored CSV order; no company was hand-picked.

**Important:** the normalized historical approval rate is used only as a nonzero, database-derived proxy for this mechanical gate test. It is not the complete Chapter 7 sponsorship probability and it is not a recommendation about this company.

## Executable contract

`composite = (sum of weighted votes) × liveness × timeline`

The 0 and 1 gate values are Chapter 11/16 contract controls, not claims about a live job or a real visa timeline. A zero in either gate must produce composite `0` and `Skip`.

The sponsorship coefficient 0.35 and current production Apply threshold 0.3 come from the Chapter 11 project rule and scorer configuration. They are algorithm settings, not database observations or new calibration findings.

## Production scorer results

- **open-gates-control: PASS.** positive control: open gates preserve the database-derived pre-gate value Expected 0.3500 / not asserted for the open control; observed 0.3500 / NOT_ASSERTED_TEST_CONTROL.

- **liveness-zero-database-vote: PASS.** named mutation witness: zero liveness must erase the database-derived pre-gate value Expected 0.0000 / Skip; observed 0.0000 / Skip.

- **timeline-zero-database-vote: PASS.** named mutation witness: zero timeline must erase the database-derived pre-gate value Expected 0.0000 / Skip; observed 0.0000 / Skip.

## Deliberate break: gate-as-vote

The sentinel is intentionally wrong. It adds the two contract gates as votes instead of multiplying by them. These are test outputs, not real role scores.

- **liveness-zero-database-vote: CAUGHT.** Contract expected 0.0000 / Skip; broken code returned 1.3500 / Apply. Failed checks: composite, recommendation, gate-product, gates-stay-out-of-votes, gate-trace-shape, gate-trace-values, closed-gate-reason.

- **timeline-zero-database-vote: CAUGHT.** Contract expected 0.0000 / Skip; broken code returned 1.3500 / Apply. Failed checks: composite, recommendation, gate-product, gates-stay-out-of-votes, gate-trace-shape, gate-trace-values, closed-gate-reason.

## Not implemented

- Full sponsorship probability: **NOT_IMPLEMENTED_MISSING_LCA_RATE_COMPANY_SIZE_AND_PINNED_THRESHOLDS**.
- Real job liveness: **NOT_IMPLEMENTED_NO_PUBLIC_ATS_OBSERVATION_IN_DATABASE**.
- Personal visa timeline: **NOT_IMPLEMENTED_PRIVATE_PERSONAL_RECORD_REQUIRED**.
- Real role recommendation: **NOT_IMPLEMENTED_TEST_SCENARIO_IS_NOT_A_JOB_POSTING**.

## Limits

- The stored mapped CSV does not include the raw DOL/USCIS employer rows or match metadata, so the company join remains unverified.
- Historical petition approval rate is not the same thing as the Chapter 7 full sponsorship probability.
- The harness proves scorer mechanics only. A person still owns the final adequacy decision.
