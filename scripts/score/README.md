# Score Scripts

The Chapter 11 role scorer combines weighted votes and then applies two gate
multipliers:

```text
composite = (sum of weighted votes) × liveness × timeline
```

The Chapter 16 integration handoff requires executable proof that liveness and
timeline are not ordinary weighted votes. The gate-behavior harness supplies
that proof against the production scorer and then runs the same contract against
a deliberately broken gate-as-vote mutation.

## Run the gate handoff

```bash
npm run gate:behavior
```

The command writes two public, anonymized artifacts:

- `reports/generated/gate-behavior/gate-behavior-audit.json` for machines.
- `reports/generated/gate-behavior/gate-behavior-audit.md` for people.

Exit `0` means every production case passed and the deliberate mutation was
caught. Exit `1` means a contract or mutation-detection check failed. Exit `2`
means the fixture could not be read, validated, or written.

## Run the regression suite

```bash
npm run test:gate-behavior
```

The independent fixture in `data/examples/gate-behavior-cases.json` covers:

| Case | Expected behavior |
|---|---|
| Both gates open | The composite retains the weighted vote sum. |
| Liveness zero, perfect votes | Composite `0`; machine recommendation `Skip`. |
| Timeline zero, perfect votes | Composite `0`; machine recommendation `Skip`. |
| Both gates zero | Composite `0`; machine recommendation `Skip`. |
| Fractional gates | The gate factors multiply the vote sum. |
| Closed-gate policy boundary | The scorer hard-stops at the configured boundary. |

The two zero-gate cases are mutation witnesses: under the deliberately broken
formula, their strong votes incorrectly rescue them to `Apply`. The harness must
report those witnesses as caught or the overall machine result fails.

## Check the original scorer command

The harness imports the scorer's pure function. This smoke check confirms the
existing CLI remains runnable after that testability refactor while keeping its
temporary output out of the tracked reports:

```bash
npm run score -- data/examples/ch11-roles.json --out-dir .build/gate-behavior-scorer-check --md .build/gate-behavior-scorer-check/role-scores.md
```

## Scope boundary

This harness proves the scorer's mechanics. It cannot prove that an upstream
posting-liveness observation is current or that a person's timeline factor is
correct. Those inputs and the final go/no-go decision still require human
review; the report therefore keeps `HUMAN_REVIEW_REQUIRED` even after all
machine checks pass.
