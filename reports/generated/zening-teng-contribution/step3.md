# Verified-data evidence — Reallocation Verification Harness

- Generated: 2026-08-16T04:30:33.912Z
- Machine evidence result: **PASS**

- Scope: one unified contribution containing the Chapter 13 ATS paste-test and Chapter 11/16 gate-behavior harness.

This is the machine evidence packet for Step 3. It reconciles records and exposes the boundary; it does not self-certify human adequacy or honesty.

## Ethics gate evidence

| Check | Status | Expected | Observed | Record |
|---|---|---|---|---|
| privacy:no-private-staged | **PASS** | no private/, data/ats/, résumé PDF, or .env path staged | none | git diff --cached --name-only |
| privacy:no-private-tracked | **PASS** | no non-scaffold private/PII path tracked | none | git ls-files |
| privacy:doctor-clean | **PASS** | strict doctor reports runnable, privacy clean, all recipe frontmatter, and no TODO-count mismatch |   ✓ no private/PII paths are tracked \|   with lifecycle frontmatter: 44   missing: 0 \|   environment: ✓ runnable | node scripts/doctor.mjs --strict |
| honesty:ats-positive-reconciles | **PASS** | positive verdict/counts recompute to PASS | 13/13 fields; 1/1 order; PASS | reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json |
| honesty:ats-break-reconciles | **PASS** | break verdict/counts recompute to deterministic FAIL | 7/13 fields; 0/1 order; FAIL | reports/generated/ats-paste-test/break-attempt/paste-test-audit.json |
| honesty:gate-production-reconciles | **PASS** | production counts recompute and verdict is PASS | 6/6 cases; 40/40 assertions | reports/generated/gate-behavior/gate-behavior-audit.json |
| honesty:mutation-is-caught | **PASS** | wrong gate-as-vote implementation fails; every named witness is caught | liveness-zero-high-votes:0.8/Apply/FAIL; timeline-zero-high-votes:0.85/Apply/FAIL | reports/generated/gate-behavior/gate-behavior-audit.json |
| honesty:controlled-input-labels | **PASS** | every controlled gate factor labeled local-evidence | local-evidence | data/examples/gate-behavior-cases.json |
| honesty:no-self-attestation | **PASS** | machine output preserves human review boundary | HUMAN_REVIEW_REQUIRED | reports/generated/gate-behavior/gate-behavior-audit.json |
| honesty:ats-limitation-visible | **PASS** | universal ATS compatibility explicitly not claimed | One parser is a conservative floor, not proof of compatibility with every ATS. \| String presence and order do not verify the truth or quality of resume claims. \| Visual adequacy requires human review. | reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json |
| provenance:boundary-labels | **PASS** | all boundary rows use assignment-approved labels | local-evidence, your-input, external-source, script-output, record, missing, model-inference | BOUNDARY_ROWS in scripts/verified-data-evidence.mjs |
| provenance:every-number-traced | **PASS** | every numeric audit leaf has label, script, and record | none untraced | number_trace in this evidence JSON |

Privacy machine gate: **PASS**. Mechanical honesty/provenance gate: **PASS**. Human ethics decision: **HUMAN_REVIEW_REQUIRED**.

## Verified-vs-inferred boundary

| Emitted field/number family | Label | Record | Machine can verify | Human keeps |
|---|---|---|---|---|
| ATS schema_version, harness, mode, chapter | **local-evidence** | Harness contract and Chapter 13 | Presence and allowed mode | Whether this contract is adequate for the intended workflow |
| ATS document_id | **your-input** | Expectation manifest in verify mode; input filename in inspect mode | Identifier is nonempty and consistently copied | Whether the identifier names the intended résumé |
| ATS parser.name, parser.version, parser.source_type | **external-source** | Exact pdfjs-dist dependency in package.json plus installed module metadata | Parser identity/version used for this run | Whether this parser represents a target commercial ATS |
| ATS inputs.* paths and file types | **your-input** | CLI arguments | Existence, supported extension, and private-output policy | Whether the input is appropriate and safe to inspect |
| ATS inputs.expectation_manifest and inputs.source_markdown | **local-evidence** | data/examples/aarav-patel-ats-expected.json | Manifest/source existence and source-line agreement | Whether the declared public sample is suitable evidence |
| paste-test.txt extracted text | **script-output** | PDF text items from the named input, written to paste-test.txt | Extraction and deterministic normalization | Semantic completeness, visual adequacy, and factual truth |
| ATS metrics.pages.value | **script-output** | PDF page tree | Page count returned by PDF.js | Whether pagination is professionally acceptable |
| ATS verify fields[*].id/category/expected/match/occurrence/required | **record** | resumes/aarav-patel-cv.md source lines, located by data/examples/aarav-patel-ats-expected.json | Manifest shape and expectation/source drift | Whether the declared fields are sufficient for the intended hiring workflow |
| ATS verify fields[*].status/observed_index/evidence.observed_record | **script-output** | scripts/resumes/ats-parse-test.mjs comparison against paste-test.txt | Presence under the declared match and occurrence rules | Whether a present string conveys the correct résumé claim |
| ATS verify order_checks[*].status/positions/reason and evidence | **script-output** | Field results and paste-test.txt offsets | Declared linear order and missing fields | Whether the reading order is usable in every ATS |
| ATS verify verdict, metrics.required_fields/order_checks, summary | **script-output** | Per-field and per-order records in the same audit JSON | Counts and PASS/FAIL reconciliation | Whether mechanical PASS is adequate to submit |
| ATS inspect parser_floor and checks[*] | **script-output** | PDF page tree, text layer, Unicode/control characters, line structure, and text-item geometry | The named deterministic parser-floor rules | Whether the extracted résumé is complete and useful |
| ATS inspect inventory.* and page_metrics.* | **script-output** | paste-test.txt lines and PDF.js text-item geometry | Counts under the documented regex/geometry rules | Inventory meaning; these counts are heuristic, not résumé quality |
| ATS decision and boundary/limitations text | **local-evidence** | Chapter 13 scope and maintained harness policy | HUMAN_REVIEW_REQUIRED and limitation text are present | The actual adequacy decision |
| Gate schema_version, harness, fixture, sources, contract | **local-evidence** | data/examples/gate-behavior-cases.json and Chapters 11/16 | Fixture and source binding | Whether the chapter contract is adequate for a real decision |
| Gate generated timestamp | **script-output** | System clock read by scripts/score/gate-behavior-harness.mjs | A timestamp was emitted for this execution | Whether the evidence is recent enough for the intended use |
| Gate production implementation and case id/purpose/mutation_witness | **local-evidence** | scripts/score/gate-behavior-harness.mjs and data/examples/gate-behavior-cases.json | Identifiers and controlled-case declarations are copied consistently | Whether the cases are representative |
| Gate production cases[*].expected.* and expected check values | **local-evidence** | data/examples/gate-behavior-cases.json controlled truth table | Fixture shape and exact comparison | Whether the controlled cases cover all important real-world states |
| Gate production observed composite/recommendation/reason/gate_product | **script-output** | scripts/score/role-scorer.mjs run on each controlled fixture role | Formula result and trace shape/value | Truth of any upstream real-role factor |
| Gate case/check status and production summary counts | **script-output** | scripts/score/gate-behavior-core.mjs comparisons | Every status and aggregate count reconciles | Adequacy of the assertions |
| Gate deliberate_break mutation result, detection, witnesses, failed checks | **script-output** | Deliberate gate-as-vote implementation in scripts/score/gate-behavior-core.mjs | The wrong implementation fails and both named witnesses are caught | Whether other plausible mutations should also be tested |
| Gate machine_result | **script-output** | Production contract verdict plus mutation-detection result | Mechanical handoff condition | No adequacy claim follows automatically |
| Gate human_decision | **local-evidence** | SNICKERDOODLE.md human-gate policy | Value remains HUMAN_REVIEW_REQUIRED | Named review, ethics clearance, and final go/no-go |
| Real résumé truth, universal ATS compatibility, live posting truth, visa legality, final Apply decision | **missing** | No qualifying record exists inside these two harnesses | The reports do not claim these capabilities | Supply independent evidence or leave the result unknown |
| Model judgments | **model-inference** | Not emitted by the controlled public sample; any future model-derived value must carry this label | Controlled fixture sources are not mislabeled as model or external records | Judge any future inference against reality |

## Number trace and metric readout

Every numeric leaf in the three machine audits is enumerated in `step3.json` under `number_trace`, with its JSON path, value, producing script, provenance label, and source record. The headline figures are:

| Figure | Script | Record | Observed |
|---|---|---|---|
| ATS positive pages / required fields / order checks | scripts/resumes/ats-parse-test.mjs | reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json and its paste-test.txt | 2 pages; 13/13 fields; 1/1 order |
| ATS deliberate break pages / required fields / order checks | scripts/resumes/ats-parse-test.mjs | reports/generated/ats-paste-test/break-attempt/paste-test-audit.json and its paste-test.txt | 1 page; 7/13 fields; 0/1 order; verdict FAIL |
| Gate production cases / assertions | scripts/score/gate-behavior-harness.mjs + scripts/score/role-scorer.mjs | reports/generated/gate-behavior/gate-behavior-audit.json | 6/6 cases; 40/40 assertions |
| Gate-as-vote witnesses | scripts/score/gate-behavior-core.mjs | reports/generated/gate-behavior/gate-behavior-audit.json | liveness-zero-high-votes: 0.8 / Apply / FAIL; timeline-zero-high-votes: 0.85 / Apply / FAIL |

## Human attestation handoff

A named human must now read this report plus the three underlying Markdown audits, confirm that no sample résumé claim or limitation is misleading, and record what was run/seen/expected plus what was not tested. Until then, the recipe remains `RUNNABLE-SAMPLE`, `attestation: null`, and Step 4 must not begin.

### Did not test

- Compatibility with commercial ATS products other than the named PDF.js parser.
- Factual truth or persuasiveness of any real résumé.
- Current liveness, sponsorship, role quality, or legal correctness of a real visa timeline.
- Calibration of scorer weights or the wisdom of a real Apply/Consider/Skip decision.
- A live/private run; that belongs to Step 4 after a named human clears this ethics gate.

### Broke during testing, fixed

- The ATS failure report initially described a FAIL run as though all strings were present and ordered; rendering was made verdict-aware and regression-covered.
- The gate fixture initially reused real-run provenance labels for controlled values; all controlled factors are now labeled `local-evidence`.
- On Windows, `doctor` initially missed the installed `python` runtime, skipped privacy under Git safe-directory protection, and missed CRLF recipe frontmatter; the checks now use a Windows Python fallback, explicit repository-scoped Git safety, and CRLF-safe parsing.
