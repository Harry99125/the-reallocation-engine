# Step 4 — Honest Run

## Short answer

I completed the current honest run on August 16, 2026, after Zening Teng reviewed the database-backed reports and approved recipe 0.12.0 with database SHA-256 `b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb`.

After that approval, I reran the database-backed gate harness, the public ATS positive case, and the deliberate ATS break. Step 3 then regenerated with privacy PASS, honesty/provenance PASS, and the current named review recorded.

I ran the ATS checker against the approved real résumé. That run stayed under `private/`. I did not copy the résumé, extracted text, file path, or résumé-derived counts into this public report.

I then used the public regression fixture to show the exact terminal behavior that another person can reproduce. The public fixture is test data. It is not the real résumé used in the private run.

## Real résumé run

The real résumé run completed with the maintained PDF.js parser. The program kept its decision at `HUMAN_REVIEW_REQUIRED`.

That wording matters. It means the program ran and produced a private inspection report. It does not mean the résumé is correct, persuasive, or guaranteed to work in every commercial ATS.

The private files remain in the gitignored `private/ats-paste-test/` area. No private result is used as a public score.

## Public terminal run

These are short excerpts copied from the public run on August 16, 2026.

The complete public PDF passed its declared field and order checks:

```text
ATS paste test: PASS
  parser: pdfjs-dist 6.2.108
  pages: 2
  required fields: 13/13 PASS
  order checks: 1/1 PASS
  human gate: read paste-test.txt; this harness does not certify every ATS
```

The deliberately incomplete PDF failed:

```text
ATS paste test: FAIL
  parser: pdfjs-dist 6.2.108
  pages: 1
  required fields: 7/13 PASS
  order checks: 0/1 PASS
  human gate: read paste-test.txt; this harness does not certify every ATS
```

That failing command returned exit code `1`. For this one deliberate break, exit code `1` is the expected result. It shows that the checker rejected missing fields and broken order.

The gate harness printed:

```text
PASS gate contract: production 3/3 cases; gate-as-vote mutation caught
Database: data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv (b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb)
Record: 1LIFE HEALTHCARE INC; approvals 2; denials 0; stored rate 100.0000%
NOT IMPLEMENTED: real liveness, personal timeline, full sponsorship probability, or real-role recommendation
Human decision: HUMAN_REVIEW_REQUIRED
reports\generated\gate-behavior\gate-behavior-audit.md
```

The full records are the [complete PDF audit](../ats-paste-test/aarav-patel/paste-test-audit.json), [broken PDF audit](../ats-paste-test/break-attempt/paste-test-audit.json), and [gate audit](../gate-behavior/gate-behavior-audit.json).

## Plausibility check

I did not only look for green test output. I checked whether the results made sense.

- The script read 30,369 database rows and 20 columns.
- It found 1,557 complete H-1B records and 0 approval-rate arithmetic mismatches.
- It selected the first complete record in stored file order instead of choosing a company by hand.
- That stored record had 2 approvals, 0 denials, and a 100% approval rate. The script recomputed 100%.
- With both contract gates open, the scorer kept the database-derived pre-gate value at `0.35`.
- With liveness at zero, it returned `0 / Skip`.
- With timeline at zero, it returned `0 / Skip`.

Those values come from the database file, the Chapter 11 sponsorship weight, the Chapter 11/16 zero-or-one gate contract, and the scorer output saved in `reports/generated/gate-behavior/gate-behavior-audit.json`.

The `0.35` result is only a mechanical test value. The source database stores a historical H-1B approval rate, not the full sponsorship probability. The test also does not have a current ATS observation or a personal visa timeline. The report says `NOT IMPLEMENTED` instead of creating those values.

The stored entity join is another limit. The repository does not contain the raw employer names or match metadata needed to verify that join. I therefore did not present this as a real-company recommendation.

The ATS results also make sense. The complete public fixture passed all declared checks. The incomplete fixture lost six required fields and failed the order check. The program did not turn that incomplete evidence into a pass.

## Break attempts

I used two real break attempts.

First, I removed content from the public PDF fixture. The checker reported `7/13` fields, `0/1` order checks, `FAIL`, and exit code `1`.

Second, I changed the gate formula on purpose so liveness and timeline were added like scores. With either gate closed, the wrong code returned `1.35 / Apply`. These were deliberately broken test outputs, not real application decisions. The harness rejected both witnesses.

These results are recorded in the broken PDF audit and the gate audit linked above.

## What the machine could not know

The machine could not know whether:

- another commercial ATS will parse the real résumé the same way;
- the résumé statements are true or strong;
- the résumé looks professional;
- a real posting is still open;
- the stored company-to-H-1B join is correct;
- the historical approval rate is enough to estimate full sponsorship probability;
- a real visa timeline is legally correct;
- the scorer's weights fit one person's search;
- the person should apply.

Those are not hidden failures. They are the limit of this contribution.

## Result

Step 4 is complete for recipe 0.12.0.

The approved real résumé was inspected privately. After the current review, the public controls were rerun, both deliberate failures were caught, and Step 3 reconciled the new records. The result still requires human judgment and does not claim universal ATS compatibility or a real-job recommendation.
