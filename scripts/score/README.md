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

```powershell
npm.cmd run gate:behavior
```

By default, the harness reads
`data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`. It selects the first
complete H-1B record in stored file order, checks the saved approval rate
against approvals and denials, and uses the normalized historical rate only to
create a nonzero pre-gate value. It does not invent a company score.

The command writes two public artifacts:

- `reports/generated/gate-behavior/gate-behavior-audit.json` for machines.
- `reports/generated/gate-behavior/gate-behavior-audit.md` for people.

Exit `0` means every production case passed and the deliberate mutation was
caught. Exit `1` means a contract or mutation-detection check failed. Exit `2`
means the fixture could not be read, validated, or written.

## Run the regression suite

```powershell
npm.cmd run test:gate-behavior
```

The independent fixture in `data/examples/gate-behavior-cases.json` covers:

| Case | Expected behavior |
|---|---|
| Both gates open | The composite retains the database-derived pre-gate value. |
| Liveness zero | Composite `0`; machine recommendation `Skip`. |
| Timeline zero | Composite `0`; machine recommendation `Skip`. |

The two zero-gate cases are mutation witnesses. The deliberately broken formula
adds the gates like votes, so each closed-gate case incorrectly remains nonzero.
The harness must reject both witnesses or the overall machine result fails.

The gate values `0` and `1` come from the Chapter 11/16 test contract. They are
test controls, not claims that a real posting is open or that a real person's
visa timeline works.

## Check the original scorer command

The harness imports the scorer's pure function. This smoke check confirms the
existing CLI remains runnable after that testability refactor while keeping its
temporary output out of the tracked reports:

```powershell
npm.cmd run score -- "data\examples\ch11-roles.json" --out-dir ".build\gate-behavior-scorer-check" --md ".build\gate-behavior-scorer-check\role-scores.md"
```

## Scope boundary

This harness proves the scorer's mechanics. The stored CSV has historical H-1B
fields, but it does not provide a complete Chapter 7 sponsorship probability,
a public ATS observation, or a personal visa timeline. Those outputs are marked
`NOT_IMPLEMENTED`. The stored entity join also lacks raw match evidence, so it
remains unverified. The report keeps `HUMAN_REVIEW_REQUIRED` even after all
machine checks pass.
