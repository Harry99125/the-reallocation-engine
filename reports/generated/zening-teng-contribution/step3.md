# Step 3 — Where the Evidence Came From

Generated: 2026-08-17T01:06:10.588Z

## Result

Script result: **PASS**. Privacy: **PASS**. Number checks: **PASS**.

This report checks where the numbers came from. It also checks that no private file is being committed and that missing evidence was not replaced with a guess.

Human review: **Zening Teng** approved moving to Step 4 on 2026-08-16.

The scripts cannot approve themselves. The recipe stays `RUNNABLE-SAMPLE`, and the gate report still says `HUMAN_REVIEW_REQUIRED`.

## Privacy and honesty checks

Any failure here stops the run.
- **PASS — No private files staged.** No private paths found Source: `git diff --cached --name-only`.
- **PASS — No private files tracked.** No private paths found Source: `git ls-files`.
- **PASS — Strict doctor check.** Runnable, privacy clean, and recipe files valid Source: `node scripts/doctor.mjs --strict`.
- **PASS — Complete résumé totals.** 13/13 fields; 1/1 order; PASS Source: `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json`.
- **PASS — Broken résumé totals.** 7/13 fields; 0/1 order; FAIL Source: `reports/generated/ats-paste-test/break-attempt/paste-test-audit.json`.
- **PASS — Production gate totals.** 3/3 cases; 19/19 assertions Source: `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **PASS — Wrong gate examples.** liveness-zero-database-vote:1.35/Apply/FAIL; timeline-zero-database-vote:1.35/Apply/FAIL Source: `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **PASS — Stored H-1B record.** Database hash and approval-rate arithmetic match Source: `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`.
- **PASS — Chapter gate controls.** Only Chapter contract controls 0 and 1 are used Source: `data/examples/gate-behavior-cases.json`.
- **PASS — Missing inputs stay missing.** No missing live or personal value was filled in Source: `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **PASS — Human review remains open.** The result is still HUMAN_REVIEW_REQUIRED Source: `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **PASS — Named Step 3 review.** Zening Teng; 2026-08-16; APPROVED_FOR_STEP_4 Source: `logs/zening-teng-step3-review-v0.12.0.json`.
- **PASS — ATS limitation is shown.** The report says one parser cannot represent every ATS Source: `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json`.
- **PASS — Source labels are allowed.** All labels come from the assignment list Source: `BOUNDARY_ROWS in scripts/verified-data-evidence.mjs`.
- **PASS — Every number has a source.** No untraced numbers found Source: `number_trace in this evidence JSON`.

Final check: privacy **PASS**; numbers and sources **PASS**; human review **APPROVED_FOR_STEP_4_BY_NAMED_HUMAN**.

## What the source words mean

The assignment requires these labels:

- `record`: copied from a saved record.
- `script-output`: calculated by a script.
- `local-evidence`: a saved rule or test value, not a real-world fact.
- `external-source`: reported by an installed tool.
- `your-input`: supplied by the person running the command.
- `model-inference`: an AI judgment, not a fact.
- `missing`: this project does not have the needed evidence.

## What the scripts check and what a person checks

The assignment requires this table. It separates what a script can prove from what still needs a person. Exact computer field names remain in `step3.json` under `boundary[*].technical_fields`.

| Part of the report | Evidence label | Where it comes from | What the script can prove | What a person must decide |
|---|---|---|---|---|
| ATS report rules | **local-evidence** | Chapter 13 and the saved ATS test rules | The report names the test and uses an allowed test mode. | Whether those rules are good enough for this assignment. |
| The PDF chosen for the ATS test | **your-input** | The file path typed in the command | The file exists, is a supported type, and is saved in an allowed place. | Whether it is the right PDF and is safe to use. |
| The software that reads the PDF | **external-source** | The installed PDF.js package and its saved version number | Which PDF reader and version actually ran. | Whether that reader is similar enough to a real company ATS. |
| The answer sheet for the public ATS example | **record** | The saved public résumé and its separate expected-field file | The expected text really appears in the public source résumé. | Whether the chosen fields cover the important parts of the résumé. |
| Text and page count taken from the PDF | **script-output** | The selected PDF | The text it extracted and the number of PDF pages. | Whether the text still has the right meaning and whether the length is acceptable. |
| ATS field, order, and final PASS/FAIL results | **script-output** | The extracted text compared with the saved answer sheet | Which listed fields were found, whether they stayed in order, and the totals. | Whether a PASS means the résumé is ready for a real application. |
| General ATS inspection results | **script-output** | The extracted text and the locations of text on each page | Basic reading problems and simple counts of headings, dates, and bullet-like lines. | Whether the résumé is complete and useful. These counts are not a quality score. |
| Warnings about what the ATS test cannot prove | **local-evidence** | Chapter 13 and the checker rules | The report shows its limits and does not make the final decision. | The final decision about the résumé. |
| Gate test rules and saved settings | **record** | Chapters 11 and 16, the saved test cases, and the real scoring program settings | The test used the same saved rules and settings as the real scoring program. | Whether the weight and cutoff are good enough for real decisions. |
| Identity and basic checks of the saved H-1B database | **script-output** | data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv | Which saved file was used, its size and shape, and whether its rate math is correct. | Whether companies were matched correctly when this file was created. |
| The one saved H-1B row used by the test | **record** | First complete H-1B record in stored CSV order | The company and numbers really occur in that saved row and its rate math is correct. | Whether that company was matched correctly. The original matching proof is missing. |
| The H-1B rate changed from percent to decimal for the test | **script-output** | The saved approval rate divided by 100 | The conversion and the later score calculation. | This is only a test starting value, not the full chance of sponsorship. |
| Names and purpose of the three Gate test cases | **local-evidence** | The Gate test program and its saved test-case file | The names and descriptions were copied correctly. | Whether three cases cover enough possible mistakes. |
| Correct Gate results and totals | **script-output** | The saved H-1B row, the chapter rules, and the real scoring program | The expected and actual results, every PASS/FAIL check, the totals, and the run time. | Whether the test inputs are true for a real job and whether more cases are needed. |
| Results from deliberately wrong Gate code | **script-output** | A saved bad version of the formula used only inside the test | The bad code produces the wrong Apply results and the test catches both. | Whether other kinds of bad code should also be tested. |
| Final human review status | **local-evidence** | Human-review rule in SNICKERDOODLE.md | The program leaves the final decision as HUMAN_REVIEW_REQUIRED. | A named person must read the work and approve it. |
| Facts this project does not have | **missing** | No verified record is available in this project | The reports leave these items unknown or say NOT_IMPLEMENTED. | Find real evidence later or leave the answer unknown. |
| Any future AI opinion | **model-inference** | The current public tests do not create an AI opinion | Test values are not presented as facts or AI opinions. | Check any future AI opinion against real evidence. |

## Main numbers and their sources

The full list is in `step3.json` under `number_trace`. These are the main results:

- **Normal ATS PDF:** 2 pages; 13/13 fields; 1/1 order check. Script: `scripts/resumes/ats-parse-test.mjs`. Record: `reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json`.
- **Broken ATS PDF:** 1 page; 7/13 fields; 0/1 order check; result FAIL. Script: `scripts/resumes/ats-parse-test.mjs`. Record: `reports/generated/ats-paste-test/break-attempt/paste-test-audit.json`.
- **Gate checks:** 3/3 cases and 19/19 checks. Scripts: `scripts/score/gate-behavior-harness.mjs` and `scripts/score/role-scorer.mjs`. Record: `reports/generated/gate-behavior/gate-behavior-audit.json`.
- **Stored H-1B record:** 1LIFE HEALTHCARE INC; 2 approvals; 0 denials; 100% saved rate; math PASS. Script: `scripts/score/gate-database-evidence.mjs`. Record: `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`.
- **Wrong Gate code:** liveness-zero-database-vote: 1.35 / Apply / FAIL; timeline-zero-database-vote: 1.35 / Apply / FAIL. Script: `scripts/score/gate-behavior-core.mjs`. Record: `reports/generated/gate-behavior/gate-behavior-audit.json`.

## Human review

Zening Teng read the evidence summary and approved moving to Step 4. The signed decision record is `logs/zening-teng-step3-review-v0.12.0.json`.

This approval clears the assignment phase gate. It does not claim that the tools are correct for every ATS, job, company, or visa case.

## What is still unknown

- Commercial ATS products other than PDF.js.
- Whether a real résumé is true or persuasive.
- Current job liveness.
- A complete sponsorship probability.
- A person’s legal visa timeline.
- Whether the scorer weights are well calibrated.
- The final Apply, Consider, or Skip decision for a real job.

Missing real inputs stay `NOT_IMPLEMENTED`. Step 4 is recorded separately in `step4.md`.

## Problems found and fixed

- The first ATS failure report sounded like every field passed. I changed the report and added a test for it.
- The first gate sample used hand-written business values. The harness now reads the stored H-1B database and keeps missing real inputs as `NOT_IMPLEMENTED`.
- On Windows, `doctor` missed Python, Git privacy checks, and CRLF frontmatter. Those checks now work on this machine.
