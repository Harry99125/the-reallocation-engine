# Step 3 — Where the Numbers Came From

Generated: 2026-08-16T10:38:05.297Z

## Short answer

The machine checks passed: **PASS**. The privacy check passed, and the reported numbers match the saved records.

Named review recorded: **Zening Teng** approved Step 4 on 2026-08-16.

## Checks I ran

| Check | Status | Result | Record |
|---|---|---|---|
| No private files staged | **PASS** | No private paths found | git diff --cached --name-only |
| No private files tracked | **PASS** | No private paths found | git ls-files |
| Strict doctor check | **PASS** | Runnable, privacy clean, and recipe files valid | node scripts/doctor.mjs --strict |
| Complete résumé totals | **PASS** | 13/13 fields; 1/1 order; PASS | reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json |
| Broken résumé totals | **PASS** | 7/13 fields; 0/1 order; FAIL | reports/generated/ats-paste-test/break-attempt/paste-test-audit.json |
| Production gate totals | **PASS** | 3/3 cases; 19/19 assertions | reports/generated/gate-behavior/gate-behavior-audit.json |
| Wrong gate examples | **PASS** | liveness-zero-database-vote:1.35/Apply/FAIL; timeline-zero-database-vote:1.35/Apply/FAIL | reports/generated/gate-behavior/gate-behavior-audit.json |
| Stored H-1B record | **PASS** | Database hash and approval-rate arithmetic match | data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv |
| Chapter gate controls | **PASS** | Only Chapter contract controls 0 and 1 are used | data/examples/gate-behavior-cases.json |
| Missing inputs stay missing | **PASS** | No missing live or personal value was filled in | reports/generated/gate-behavior/gate-behavior-audit.json |
| Human review remains open | **PASS** | The result is still HUMAN_REVIEW_REQUIRED | reports/generated/gate-behavior/gate-behavior-audit.json |
| Named Step 3 review | **PASS** | Zening Teng; 2026-08-16; APPROVED_FOR_STEP_4 | logs/zening-teng-step3-review-v0.12.0.json |
| ATS limitation is shown | **PASS** | The report says one parser cannot represent every ATS | reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json |
| Source labels are allowed | **PASS** | All labels come from the assignment list | BOUNDARY_ROWS in scripts/verified-data-evidence.mjs |
| Every number has a source | **PASS** | No untraced numbers found | number_trace in this evidence JSON |

Privacy: **PASS**. Number and source checks: **PASS**. Human review: **APPROVED_FOR_STEP_4_BY_NAMED_HUMAN**.

## What the labels mean

- `record`: a value copied from a saved source record.
- `script-output`: a value calculated by a program.
- `local-evidence`: a saved rule or test definition, not a real-company fact.
- `external-source`: information reported by an outside dependency.
- `your-input`: a value supplied by the person running the command.
- `model-inference`: an AI judgment, not a fact.
- `missing`: the program does not have the evidence.

## What is checked and what still needs a person

The assignment asks for every output group to be listed. That is why this section uses a table.

| Output | Label | Source | Program checked | Person must decide |
|---|---|---|---|---|
| ATS schema_version, harness, mode, chapter | **local-evidence** | Chapter 13 and the ATS checker rules | The fields exist and the mode is allowed | Whether these rules are enough for the intended use |
| ATS document_id | **your-input** | Expected-field file or input filename | The ID is present and copied correctly | Whether it points to the right résumé |
| ATS parser.name, parser.version, parser.source_type | **external-source** | pdfjs-dist version in package.json and the installed package | Which parser and version ran | Whether that parser is close enough to a commercial ATS |
| ATS inputs.* paths and file types | **your-input** | CLI arguments | The file exists, has a supported type, and follows the privacy rule | Whether this is the right and safe file to inspect |
| ATS inputs.expectation_manifest and inputs.source_markdown | **local-evidence** | data/examples/aarav-patel-ats-expected.json | Both files exist and each expected value matches its source line | Whether the public sample is good enough for the task |
| paste-test.txt extracted text | **script-output** | Text read from the PDF and saved in paste-test.txt | The text was extracted and cleaned with fixed rules | Whether the meaning, design, and claims are correct |
| ATS metrics.pages.value | **script-output** | PDF page tree | The page count returned by PDF.js | Whether the number of pages is acceptable |
| ATS verify fields[*].id/category/expected/match/occurrence/required | **record** | Public résumé lines named by aarav-patel-ats-expected.json | The expected-field file is valid and still matches the résumé source | Whether the chosen fields cover enough of the résumé |
| ATS verify fields[*].status/observed_index/evidence.observed_record | **script-output** | ATS checker comparison with paste-test.txt | Whether each expected field was found with the stated rule | Whether the text makes the right claim |
| ATS verify order_checks[*].status/positions/reason and evidence | **script-output** | Field results and positions in paste-test.txt | Whether fields are missing or out of order | Whether that order will work in every ATS |
| ATS verify verdict, metrics.required_fields/order_checks, summary | **script-output** | Field and order results in the same audit JSON | The totals and final PASS/FAIL result | Whether a passing résumé is ready to submit |
| ATS inspect parser_floor and checks[*] | **script-output** | PDF pages, text, characters, lines, and text positions | The basic parser checks listed by the tool | Whether the extracted résumé is complete and useful |
| ATS inspect inventory.* and page_metrics.* | **script-output** | paste-test.txt lines and PDF.js text positions | Counts made with the saved text and layout rules | What those rough counts mean; they are not a quality score |
| ATS decision and boundary/limitations text | **local-evidence** | Chapter 13 and the checker rules | The report includes HUMAN_REVIEW_REQUIRED and its limits | The final decision about the résumé |
| Gate schema_version, harness, fixture, sources, contract | **record** | Gate test cases, Chapters 11 and 16, and the stored H-1B database | The report points to the saved test file and chapters | Whether these rules are enough for a real decision |
| Gate sponsorship weight, Apply threshold, and zero/one controls | **record** | Chapter 11, Chapter 16, and the stored production scorer configuration | The run used the same saved algorithm settings and contract controls | Whether the approximate threshold and weight are adequately calibrated |
| Gate database path, SHA-256, row/column counts, complete-record count, arithmetic mismatches | **script-output** | data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv | The stored bytes, schema, record count, and approval-rate arithmetic | Whether the mapped company identities are trustworthy enough to use |
| Gate selected H-1B record: company, approvals, denials, approval rate | **record** | First complete H-1B record in stored CSV order | The values occur in the selected stored record and the rate recomputes | Whether the entity join is correct; raw match evidence is missing |
| Gate normalized H-1B rate used as sponsorship.p | **script-output** | Stored Approval_Rate divided by 100 | The unit conversion and scorer arithmetic | It is only a mechanical proxy, not full P(sponsorship) |
| Gate generated timestamp | **script-output** | System clock read by the gate report program | The run saved a time | Whether the report is recent enough |
| Gate production implementation and case id/purpose/mutation_witness | **local-evidence** | Gate report program and gate-behavior-cases.json | The case names and test labels were copied correctly | Whether the three gate cases cover enough situations |
| Gate production cases[*].expected.* and expected check values | **script-output** | Database record plus Chapter 11/16 contract controls in gate-behavior-cases.json | The expected values recompute from the stored record and contract controls | Whether important real situations are missing |
| Gate production observed composite/recommendation/reason/gate_product | **script-output** | Production scorer run on each controlled case | The formula result and saved calculation details | Whether the inputs for a real job are true |
| Gate case/check status and production summary counts | **script-output** | Gate checker comparisons | Each PASS/FAIL result and the final totals | Whether more checks are needed |
| Gate deliberate_break mutation result, detection, witnesses, failed checks | **script-output** | Deliberately wrong code in gate-behavior-core.mjs | The wrong code fails and both examples are caught | Whether other wrong versions should also be tested |
| Gate machine_result | **script-output** | Real scorer result plus the wrong-version result | Whether the real code passed and the wrong code failed | Whether that is enough to approve the work |
| Gate human_decision | **local-evidence** | Human-review rule in SNICKERDOODLE.md | The value stays HUMAN_REVIEW_REQUIRED | The named review and final approval |
| Real résumé truth, universal ATS compatibility, current posting truth, full sponsorship probability, visa legality, final Apply decision | **missing** | The reports explicitly mark these records NOT IMPLEMENTED or unavailable | The reports do not claim to know these things | Find other evidence or leave the answer unknown |
| Model judgments | **model-inference** | The public test does not create AI judgments | Controlled test values are not mislabeled as AI or outside facts | Check any future AI judgment against real evidence |

## Main numbers

The full number-by-number list is in `step3.json` under `number_trace`. It stores each JSON path, value, program, label, and source file. These are the main results:

| Result | Program | Saved record | Value |
|---|---|---|---|
| ATS positive pages / required fields / order checks | scripts/resumes/ats-parse-test.mjs | reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json and its paste-test.txt | 2 pages; 13/13 fields; 1/1 order |
| ATS deliberate break pages / required fields / order checks | scripts/resumes/ats-parse-test.mjs | reports/generated/ats-paste-test/break-attempt/paste-test-audit.json and its paste-test.txt | 1 page; 7/13 fields; 0/1 order; verdict FAIL |
| Gate production cases / assertions | scripts/score/gate-behavior-harness.mjs + scripts/score/role-scorer.mjs | reports/generated/gate-behavior/gate-behavior-audit.json | 3/3 cases; 19/19 assertions |
| Gate database record | scripts/score/gate-database-evidence.mjs | data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv | 1LIFE HEALTHCARE INC; 2 approvals; 0 denials; 100% stored rate; arithmetic PASS |
| Gate-as-vote witnesses | scripts/score/gate-behavior-core.mjs | reports/generated/gate-behavior/gate-behavior-audit.json | liveness-zero-database-vote: 1.35 / Apply / FAIL; timeline-zero-database-vote: 1.35 / Apply / FAIL |

## Human review

Zening Teng confirmed the plain-language evidence summary and approved moving to Step 4. The decision is stored in `logs/zening-teng-step3-review-v0.12.0.json`.

This approval clears the Step 3 assignment gate. It does not make the programs universally correct and does not change the limits below.

### Not tested

- Commercial ATS products other than PDF.js.
- Whether a real résumé is true or persuasive.
- Current job liveness, full sponsorship probability, role quality, or visa timing.
- Whether the scorer weights are good.
- Whether a person should Apply, Consider, or Skip.
- Step 4 is recorded separately in `step4.md`; this Step 3 checker does not judge that run.

### Problems found and fixed

- The first ATS failure report sounded like every field passed. I changed the report and added a test for it.
- The first gate sample used hand-written business values. The harness now reads the stored H-1B database and keeps missing real inputs as `NOT_IMPLEMENTED`.
- On Windows, `doctor` missed Python, Git privacy checks, and CRLF frontmatter. Those checks now work on this machine.
