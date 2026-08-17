# Step 4 — Honest Run



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
PASS gate contract: production 6/6 cases; gate-as-vote mutation caught
Human decision: HUMAN_REVIEW_REQUIRED
reports\generated\gate-behavior\gate-behavior-audit.md
```

The full records are the [complete PDF audit](../ats-paste-test/aarav-patel/paste-test-audit.json), [broken PDF audit](../ats-paste-test/break-attempt/paste-test-audit.json), and [gate audit](../gate-behavior/gate-behavior-audit.json).

## Plausibility check

I did not only look for green test output. I checked whether the results made sense.

- With both gates open, the scorer returned `0.65 / Apply`.
- With liveness at zero, it returned `0 / Skip`.
- With timeline at zero, it returned `0 / Skip`.
- With both gates at zero, it still returned `0 / Skip`.
- With partial gates, it scaled the score to `0.26 / Consider`.
- At the configured closed-gate boundary, it returned `0.0325 / Skip`.

Those values come from the six production cases in `reports/generated/gate-behavior/gate-behavior-audit.json`. They are controlled test values, not live job or visa data.

The ATS results also make sense. The complete public fixture passed all declared checks. The incomplete fixture lost six required fields and failed the order check. The program did not turn that incomplete evidence into a pass.

## Break attempts

I used two real break attempts.

First, I removed content from the public PDF fixture. The checker reported `7/13` fields, `0/1` order checks, `FAIL`, and exit code `1`.

Second, I changed the gate formula on purpose so liveness and timeline acted like weighted scores. With liveness closed, the wrong code returned `0.80 / Apply`. With timeline closed, it returned `0.85 / Apply`. The harness rejected both witnesses.

These results are recorded in the broken PDF audit and the gate audit linked above.

## What the machine could not know

The machine could not know whether:

- another commercial ATS will parse the real résumé the same way;
- the résumé statements are true or strong;
- the résumé looks professional;
- a real posting is still open;
- a real visa timeline is legally correct;
- the scorer's weights fit one person's search;
- the person should apply.

Those are not hidden failures. They are the limit of this contribution.

## Result

Step 4 is complete as an honest run.

The public controls passed, both deliberate failures were caught, and the approved real résumé was inspected privately. The result still requires human judgment and does not claim universal ATS compatibility or a real-job recommendation.
