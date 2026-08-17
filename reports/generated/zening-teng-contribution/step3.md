# Step 3 — Proof Check

Made on: 2026-08-17T03:05:19.992Z

## 1. Data and judgment split

- `record`: saved resume facts, Gate rules, and the saved H-1B row.
- `script-output`: PDF text, counts, math, PASS/FAIL, and Gate results.
- `local-evidence`: saved test rules, limits, test cases, and review rules.
- `external-source`: PDF.js name and version.
- `your-input`: the PDF file picked by the user.
- `model-inference`: none in this run. Any future AI idea must use this label.
- `missing`: real resume truth, all ATS results, live job status, full sponsorship chance, visa law, and a real Apply choice.

Code may read, count, compare, and do math. A person must judge meaning, safety, company matching, and the final choice.

The full field-by-field split is in `step3.json` under `boundary`. Each item has exact fields, a label, a source, the code job, and the human job.

## 2. Every number has a source

Each line names its code and record.

- **ATS:** good run = 2 pages, 13/13 fields, 1/1 order, PASS; broken run = 1 page, 7/13 fields, 0/1 order, FAIL. Code: `scripts/resumes/ats-parse-test.mjs`. Records: `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json` and `reports/generated/ats-paste-test/break-attempt/paste-test-audit.json`.
- **Gate rule values:** sponsorship weight 0.35; Apply line 0.3; Gate test values 0 and 1. Code: `scripts/score/role-scorer.mjs` and `scripts/score/gate-behavior-harness.mjs`. Records: `chapters/11-the-bayesian-role-scorer.md`, `chapters/16-the-build-and-the-honest-run.md`, and `data/examples/gate-behavior-cases.json`.
- **H-1B:** 30369 rows, 20 columns, 1557 complete rows, 0 math errors. Row 80 is 1LIFE HEALTHCARE INC: 2 approvals, 0 denials, 100% saved rate, 100% checked rate, test value 1, math PASS. Code: `scripts/score/gate-database-evidence.mjs`. Records: `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` and `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **Good Gate run:** 3/3 cases and 19/19 checks passed. Open Gates gave 0.35. Liveness at 0 gave 0 / Skip. Timeline at 0 gave 0 / Skip. Code: `scripts/score/gate-behavior-harness.mjs` and `scripts/score/role-scorer.mjs`. Record: `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **Bad Gate run:** 0/3 cases and 0/19 checks passed. The open case gave 2.35. Liveness at 0 gave 1.35 / Apply / FAIL. Timeline at 0 gave 1.35 / Apply / FAIL. Code: `scripts/score/gate-behavior-core.mjs`. Record: `reports/generated/gate-behavior/gate-behavior-audit.json`.

All smaller numbers are in `step3.json` under `number_trace`. Each has a label, script, and record.

This run has no `model-inference` number. It prints no AI score as a fact.

## 3. Ethics gate — PASS

A privacy or honesty FAIL stops Step 3. Step 4 must not run.

- **Privacy — PASS:** no private path is staged or tracked; `node scripts/doctor.mjs --strict` passed.
- **Honesty — PASS:** totals and math match saved records; bad code was caught; every number is traced; missing facts stay `missing` or `NOT_IMPLEMENTED`.

Zening Teng allowed Step 4 on 2026-08-16. Record: `logs/zening-teng-step3-review-v0.12.0.json`.

The code did not approve itself. This is not proof for every ATS, job, company, or visa case.
