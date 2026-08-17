# Recipe Run Log

Human-readable history for recipe-driven work.

Use this file to record what was run, what worked, what failed, and what should
be tested next. Keep entries short. Do not include secrets, real phone numbers,
private emails, or sensitive application notes.

## 2026-06-12 — Wrote Tutorial 00 (Exercise Zero) in full

- **Recipe:** manual
- **Inputs:** `docs/search-profile-design.md` v3, `data/bls/compact/soc_occupation_compact.csv` schema, MYCROFT.md attestation rules
- **Outputs:** `docs/tutorials/00-personal-layer.md` — privacy-first setup (gitignore gate), paste-ready agent prompt (3 tasks with hard stops), resume.json schema with evidence fields and attested timestamp, full 8-question conditional intake tree (visa block only after a "no" at Q4), gaps draft with 3 required student edits (kill a row / rewrite a row / write one startable plan), migration rule, 4 exercises (delete test, inflation hunt, multi-model SOC second opinion, six-hour test), what-can-go-wrong table; index updated to ready
- **Result:** Exercise Zero runnable today in Claude Code with zero new scripts. Extraction-corrections count gives each student a personal fluency-vs-truth measurement on day one.
- **Open issues:** SOC matching quality from free text untested against real student answers; the agent prompt should be re-tested once the config generator lands (Tutorial 01 hand-edit note then changes); per-section attestation flags deliberately omitted in favor of one file-level timestamp — revisit if students attest carelessly.

## 2026-06-12 — Dropped personas for conditional intake; added gaps file + Exercise Zero

- **Recipe:** manual (human design input: don't invent personas, ask for relevant facts — past for resume, future for wants/constraints; generate an editable gaps file; gaps migrate to resume with evidence; this is the first exercise)
- **Inputs:** `docs/search-profile-design.md` v3, `data/bls/compact/soc_occupation_compact.csv` (skill_*_lv / ability_*_lv columns)
- **Outputs:** design doc revised — personas replaced by conditional intake over canonical fields (question tree branches on answers, no labels); new gaps-file section (generated draft from O*NET levels + scanned-posting keyword frequency, human-owned thereafter, regenerate-as-diff, migration-to-resume.json only with evidence); Exercise Zero defined; tutorials index gains Tutorial 00 (planned)
- **Result:** Personal layer is three files with distinct epistemic status: resume.json (attested past), profile.yml (declared future), gaps.md (managed delta). Aspirational resume entries become structurally impossible. Engine extends from application allocator to development allocator (gaps = what to build in the six hours).
- **Open issues:** gap computation quality unknown until tried against a real resume + SOC pair; Tutorial 00 not yet written; intake question tree not yet drafted.

## 2026-06-12 — Added profile metadata + personas to the design

- **Recipe:** manual (human design input: resume facts ≠ search metadata; US citizens shouldn't see visa questions; start with a few personas, add later)
- **Inputs:** `docs/search-profile-design.md` v2
- **Outputs:** new "Profile metadata" section — four starting personas (international student, US new grad, employed-and-quietly-looking, flexible/part-time); two-layer model: canonical profile fields + personas as intake routing/defaults only; scorer weights become a function of profile fields (sponsorship weight ≈ 0 for citizens, timeline gate persona-conditional)
- **Result:** Persona proliferation avoided — combinations are field combinations, not new personas; engine reads fields, never labels. New-persona criterion is evidence-driven (recurring intake combinations the presets serve badly).
- **Open issues:** discretion mechanics for the employed persona (employer-affiliate exclusion list source?); whether persona presets live in data/ as a versioned file (recommended) or in the intake recipe prose.

## 2026-06-12 — Revised profile design: roles-first intake + resume.json layer

- **Recipe:** manual (human design input: never ask for companies; ask what they want to do → SOC codes → suggest companies; resume converted to verified JSON, generated docs derive from it)
- **Inputs:** `docs/search-profile-design.md` v1, `data/bls/compact/soc_occupation_compact.csv`, `scripts/resumes/`
- **Outputs:** design doc revised — 5-step pipeline (intake → SOC resolution with human confirmation gate → generate → review/prune → scan); new resume.json section (upload → extract → field-by-field human attestation → all resume artifacts generated as projections, never rewrites); search/ layout extended; course-project mapping section (student H-1B probability tools and resume-JSON converters are the engine's missing components)
- **Result:** Companies are now an output of the engine, not an input. Resume claims become machine-checkable against attested source fields — verified-data contract extended to the student's own history.
- **Open issues:** unchanged 4 open decisions + new: JSON Resume schema as-is vs extended; where extraction-hallucination checking lives (conformance script vs gate checklist).

## 2026-06-12 — Designed profile-driven config generation

- **Recipe:** manual (triggered by human design question: why does a human hand-edit portals.yml?)
- **Inputs:** `recipes/_profile.template.md`, `scripts/ats/detect-ats.py`, `data/bls/compact/soc_occupation_compact.csv` (alternate_titles columns), `data/80-days-to-stay/`, `scripts/ats/scan.mjs` (REALLOCATION_ENGINE_PORTALS env var)
- **Outputs:** `docs/search-profile-design.md` (intake → search/profile.yml → generated portals.yml with O*NET + curated synonym expansion, evidence-derived company suggestions, gitignored personal `search/` folder); Tutorial 01 Step 1 reframed (hand-editing = looking under the hood, not steady state)
- **Result:** Design connects four existing-but-disconnected pieces: profile template, detect-ats.py, O*NET alternate titles, sponsorship data. Human reads/judges generated config; never writes it.
- **Open issues:** Generator script, synonyms seed file, profile recipe, and `.gitignore` entry not yet built — design awaits approval on 4 open decisions (folder name, intake form, suggestion cap, fate of personal files in data/ats/).

## 2026-06-12 — Verified Greenhouse API liveness; fixed tutorial browser-check step

- **Recipe:** manual (triggered by human observation: `job-boards.greenhouse.io/databricks` redirects to the company careers site; same pattern at Duolingo)
- **Inputs:** `scripts/ats/providers/greenhouse.mjs` (read: provider derives `boards-api.greenhouse.io/v1/boards/<slug>/jobs` and fetches with `redirect: 'error'`); fetched the Databricks and Duolingo API endpoints directly
- **Outputs:** `docs/tutorials/01-first-scan.md` Step 6 rewritten (verify against the API JSON, not the board page, with explanation of the redirect pattern); new what-can-go-wrong row
- **Result:** Both APIs live and serving: Databricks ≈97 KB payload, 100+ postings; Duolingo ≈78 KB, ≈80 postings. The browser redirect is a UI relocation, not an API removal — human-facing board pages increasingly redirect to branded careers sites while the JSON API keeps serving. Scanner unaffected by design (API-only + redirect:'error'). This partially closes the prior open issue "provider fetch not verified": the endpoint is confirmed reachable and serving from this environment's fetch tool, though still not via the scanner process itself.
- **Open issues:** Job counts are approximate (counted from match listings, not a parsed total). If Greenhouse ever moves or gates boards-api, the provider fails loudly (`fetch failed` / redirect error) — correct behavior, but worth a tutorial-02 liveness note. Some companies may genuinely leave Greenhouse; a redirected board page plus a 404 from boards-api is the signature of that case.

## 2026-06-12 — Added tutorials layer (docs/tutorials/)

- **Recipe:** manual
- **Inputs:** `data/ats/portals.example.yml`, `scripts/ats/scan.mjs` (usage header, flags, default paths), `package.json`, MYCROFT.md conventions
- **Outputs:** `docs/tutorials/01-first-scan.md` (full predict→run→inspect→judge→record walkthrough with 6 graduated exercises and a what-can-go-wrong table), `docs/tutorials/README.md` (index; tutorials 02–05 marked planned), `DOMAIN.md` first-win section now points to the tutorial
- **Result:** The first-win command is no longer a bare one-liner; a student can complete the scan loop unassisted. Exercise 6 rehearses the attestation format; exercise 4 teaches the conformance/adequacy boundary by deliberate breakage.
- **Open issues:** Sample output numbers in Step 5 are illustrative (live fetch is blocked in this sandbox — could not capture a real success report). Tutorials 02–05 are titles only. Exercise 4's typo-provider behavior was not executed; the tutorial asks the student to discover it, but an instructor should verify the actual error message once on an unrestricted machine.

## 2026-06-12 — First honest run: BLS extract + ATS scan dry-run

- **Recipe:** manual (pre-recipe verification run under MYCROFT.md contract)
- **Inputs:** `scripts/bls/extract-soc-occupation-table.py` against `data/bls/db-30-2-text/` + `data/bls/oesm24nat/`; `npm run ats:scan -- --dry-run` with `REALLOCATION_ENGINE_PORTALS=data/ats/portals.example.yml`
- **Outputs:** `data/bls/compact/soc_occupation_compact.csv` (1,016 occupations; SHA-256 recorded in audit), `data/bls/bls-audit.md` (962/1,016 = 94.7% matched to OEWS 2024 detailed SOC rows)
- **Result:** BLS extractor runs clean after the `Skills.txt` fix; audit generated and read; CSV schema unchanged (`skill_*` columns intact). ATS scan loaded the example portal config, matched the Greenhouse provider, ran filter/dedup/report logic, and wrote nothing in dry-run mode — machinery verified.
- **Open issues:** ATS scan's live fetch failed in the sandboxed environment (network egress blocked) — provider fetch is **not** verified end-to-end; rerun on an unrestricted machine. BLS extractor was not executed pre-fix, so "failed before fix" is inferred from the missing `Recipes.txt` file, not observed. `playwright`/`sharp` not installed; only `js-yaml`/`glob` were needed for this run.

## 2026-06-12 — Fixed rename-shrapnel bugs; added lifecycle frontmatter

- **Recipe:** manual
- **Inputs:** `scripts/bls/extract-soc-occupation-table.py`, `scripts/ats/analyze-patterns.py`, `scripts/ats/README.md`, 8 core recipe files
- **Outputs:** three one-line fixes (`Recipes.txt`→`Skills.txt`; `modes/RUN_LOG.md`→`logs/RUN_LOG.md` in script and README; audit prose "recipe Level scores"→"skill Level scores"); MYCROFT.md lifecycle frontmatter added to `_shared` (type: contract) and `scan`, `pipeline`, `oferta`, `tracker`, `pdf`, `patterns`, `update` (status: DRAFT, todos_open: 11 each)
- **Result:** Known defects 1–2 from DOMAIN.md closed. Recipe status is now machine-readable.
- **Open issues:** `scripts/cowork-agentic-repo.py` still contains mangled prose ("Recipes and recipes…") — cosmetic, not load-bearing. The 33 non-core recipes have no frontmatter yet.

## 2026-06-11 — Established MYCROFT.md as source of truth

- **Recipe:** manual
- **Inputs:** architecture review of the full repo; Codex cross-review; Gru SDD; principles discussion (Cowork session)
- **Outputs:** `MYCROFT.md` (new — constitution v0.1.0: 8 principles, verification stack, recipe lifecycle, TODO-closure evidence, attestation format), `DOMAIN.md` (new — domain manifest: actual layout, runnable command surface, known gaps/defects), `CLAUDE.md` (rewritten as pointer to MYCROFT.md), `AGENTS.md` (rewritten as pointer; also removed "recipes, recipes" rename shrapnel)
- **Result:** One governing file; precedence rule explicit; current-vs-planned architecture separated (domain layout is current; `data/raw`/`data/verified`/snickerdoodle CLI marked roadmap). Claude Code named as v0 runtime.
- **Open issues:** Known defects listed in DOMAIN.md §Known gaps: BLS `Recipes.txt` bug, `modes/RUN_LOG.md` path bug, scorer unimplemented, no recipe has a logged run, doctor script not built, person-named recipes need privacy review, skill/recipe terminology in manuscript unreconciled. README and `docs/` not yet updated to cite MYCROFT.md.

## 2026-05-28 — Recipe folder converted to verified-data workflows

- **Recipe:** manual
- **Inputs:** `recipes/`, `scripts/`, `README.md`, `DATA_CONTRACT.md`
- **Outputs:** `recipes/_shared.md`, `recipes/README.md`, active recipes, and draft/helper recipe files
- **Result:** Recipes now point students toward repo scripts, audits, and logs instead of prompt-only recipes.
- **Open issues:** Some workflows remain intentionally marked as draft until supporting scripts exist.

## 2026-05-28 — Removed copied Job-Ops source tree

- **Recipe:** manual
- **Inputs:** `data/career-ops-main/`, `scripts/ats/`, `recipes/`, `resumes/`
- **Outputs:** `.gitignore`, `README.md`, `DATA_CONTRACT.md`, provider docs
- **Result:** Removed the copied reference directory after useful pieces had been adapted into maintained repo paths.
- **Open issues:** Provenance now lives in docs and adapted files, not in a local source copy.

## 2026-05-28 — Normalized data directory names

- **Recipe:** manual
- **Inputs:** old mixed-case 80 Days and BLS data directories, `data/sec/form-d/`
- **Outputs:** `data/80-days-to-stay/`, `data/bls/`, lower-kebab SEC extracted folders, updated docs/scripts
- **Result:** Source/reference data directories now use lower-case kebab-case names. Maintained automation now uses lowercase `scripts/` by repo convention.
- **Open issues:** Some source data filenames and JSON field values still preserve upstream naming.

## 2026-06-13 -- Context parity + privacy pass + doctor (consolidated; re-logged after a git reset dropped prior entries)

- **Parity:** brought this repo to the Madison/Mycroft context architecture — ported `conformance.mjs`/`to-markdown.mjs`/`build-instructions.mjs`, added `instructions/` (6 shared rule modules + `reallocation-engine.md` + manifest) compiling to generated root `AGENTS.md`/`CLAUDE.md`, plus `.claude/` hooks (archive-guard + conformance-check) and `.github/workflows/verify.yml` (conformance + instruction drift guard). `MYCROFT.md` confirmed identical to the other Mycroft-domain repos.
- **Privacy pass (gap #6):** 14 person-named case-study recipes anonymized -> `case-*.md` role slugs; student names + Canvas submission-IDs scrubbed. Verified zero residual PII repo-wide. Git **history** also purged via `git filter-repo` (--invert-paths on the 14 old paths + --replace-text on names/IDs); force-pushed.
- **doctor (gap #5):** `scripts/doctor.mjs` (`npm run doctor`) — environment + npm-command-target + domain-dir checks + recipe-status dashboard. Surfaced gap #8: only 7/42 recipes carry lifecycle frontmatter; declared todos_open (77) vs 518 body `[TODO` markers.
- **Note:** a later `git reset`/`filter-repo` reverted edits to pre-existing tracked files (DOMAIN.md gaps reconciliation, this log, package.json scripts, generated AGENTS/CLAUDE) while new files survived; re-applied 2026-06-13. New files were unaffected.
- **Result:** doctor + conformance green; DOMAIN.md known-gaps reconciled (#1,#2,#5,#6 resolved; #3,#4,#7,#8 open).

## 2026-06-13 -- Backfill recipe lifecycle frontmatter (gap #8)

- **Commands:** One-off migration over recipes/ (excl. README + templates): prepended a `status/todos_open/last_gate/attestation/recipe_version` block to the 34 recipes that lacked one, injected the lifecycle keys into `_shared.md` (kept `type: contract`), and reconciled `todos_open` to the true `[TODO`-marker body count everywhere. 7 already-stamped recipes unchanged (idempotent).
- **Result:** doctor now reports 42/42 recipes with frontmatter, 0 missing; declared todos_open == body markers (518 = 518, mismatch gone). Conformance clean. DOMAIN gap #8 resolved.
- **Open issues:** All 42 remain `status: DRAFT` — promotion past DRAFT still requires a real gated run (gap #4) + attestation. Frontmatter is now the substrate for that lifecycle tracking.

## 2026-06-13 -- Build the Bayesian Role Scorer (gap #3)

- **Skill:** Implement the book's Chapter-11 decision core — the composite role scorer / combiner.
- **Inputs:** spec from `chapters/11-the-bayesian-role-scorer.md` (composite form, weights sponsorship 0.35 / fit 0.30, multiplicative liveness+timeline gates, threshold ~0.3, Apply/Consider/Skip, override discipline, auditability thesis) + `docs/search-profile-design.md` (weights are a function of the profile, not constants). Confirmed exact structure by reproducing the chapter's worked example backward.
- **Commands:** Wrote `scripts/score/role-scorer.mjs` — combiner only (reads per-role evidence records; does not compute components). Multiplicative gates × weighted votes; profile-conditional sponsorship weight (→0 when authorization doesn't need sponsorship); per-term audit trace with source labels (record / model-judgment / your-input); documented-override support (override without a reason is ignored, per Ch.11); JSON + Markdown report + skip-rate summary. Config block annotates every weight/threshold with provenance; role_quality weight + Consider floor left as documented `[VERIFY]` defaults (not pinned by the chapter). Built fixture `data/examples/ch11-roles.json` reproducing the chapter's two roles + gate/Consider/override cases. Wired `npm run score`.
- **Result:** Verified against the book — Cambridge biotech composite 0.446 → Apply; identical-fit non-sponsor 0.178 → Skip; ghost posting gated to 0 → Skip; Likely-tier → Consider; documented override flips Skip→Apply and records the reason. Conformance clean; doctor sees the new command. DOMAIN gap #3 resolved.
- **Open issues:** `[VERIFY]` weights (role_quality, Consider floor) need confirmation vs the system design document before real decisions. The scorer is a pure combiner — wiring the upstream feeds (Ch.7/8/9/10) to emit the per-role evidence envelope is separate (the run-envelope schema is still `[TODO: DEFINE]` in recipes/pipeline.md) and tied to the honest run (gap #4).

## 2026-06-14 -- The honest run (gap #4): first gated, logged recipe run

- **Recipe:** `oferta` (Ch.11 Bayesian role scorer), **sample mode**, run id `oferta-2026-06-14-001`.
- **Command:** `npm run score data/examples/ch11-roles.json` (stored script; no ad-hoc code).
- **Inputs:** verified fixture `data/examples/ch11-roles.json` + run-envelope (`mode: sample`).
- **Gates:** 1 Source ✓ · 2 Scope ✓ (sample) · 3 Data-shape ✓ · 4 Script-readiness ✓ · 5 Approval n/a (no live network/writes/model) · 6 Report ✓. Human adequacy gate: **PENDING attestation.**
- **Result:** 5 roles → Apply 2 · Consider 1 · Skip 2 (skip 40%). Cambridge 0.446 / non-sponsor 0.178 reproduce Ch.11. Output fully sourced (record / model-judgment / your-input).
- **Artifacts:** `logs/oferta-2026-06-14.json`, `reports/generated/oferta-2026-06-14.md`, `data/examples/role-scores.{json,md}`.
- **Flags:** skip-rate 40% < 50% (curated fixture, expected); `role_quality` weight 0 [VERIFY] drops the Ch.9 signal (gap #3); 1 documented override.
- **Open:** machine half of P4 done; **human adequacy (P4 second half) outstanding** — attest to promote `oferta` past DRAFT.

## 2026-06-14 -- Rename MYCROFT.md → SNICKERDOODLE.md (constitution rebrand)

- **Why:** disambiguate this repo's constitution from the shared **Mycroft** agent-OS frame it was forked from. Renamed to a cookie-recipe name fitting the book's "recipe" vocabulary.
- **Did:** `git mv MYCROFT.md SNICKERDOODLE.md`; rebranded the file's own identity (`# SNICKERDOODLE`, "Snickerdoodle is an agent-operating system…", lineage line preserved). Swapped every `MYCROFT.md` path/governance reference (instructions/ source, `conformance.mjs` required-files list, `manifest.yml` `@import`, CI comment, `DOMAIN.md`, `status.md`, `archive/README.md`, docs/). Rebranded this-repo "Mycroft" prose (P4, "a Snickerdoodle domain", audit doc); **kept** the cross-repo "Madison and Mycroft" shared-library mention.
- **Rebuilt:** `node scripts/build-instructions.mjs --promote` → `AGENTS.md` + `CLAUDE.md` regenerated; `CLAUDE.md` now imports `@SNICKERDOODLE.md`.
- **Untouched:** `data/` CSVs (real company names containing "mycroft") and prior RUN_LOG history (append-only).
- **Result:** conformance + doctor green; no stale `MYCROFT.md` outside data/history.
## 2026-08-15 -- Capstone ATS PDF paste-test harness (sample + deliberate break)

- **Recipe:** manual (Chapter 13 capstone module; unified validation-harness recipe not written yet).
- **Inputs:** anonymized `output/resumes/aarav-patel-cv.pdf`; local expectation record `data/examples/aarav-patel-ats-expected.json`, traced to named lines in `resumes/aarav-patel-cv.md`; deliberate broken-render fixture `data/examples/ats-paste-test-broken-render.md`.
- **Commands:** `npm run test:ats-parse`; `npm run resumes:paste-test -- output/resumes/aarav-patel-cv.pdf --expect data/examples/aarav-patel-ats-expected.json --out-dir reports/generated/ats-paste-test/aarav-patel`; the same paste-test command against `.build/ats-paste-test/broken-render.pdf` with output under `reports/generated/ats-paste-test/break-attempt`; targeted `node scripts/conformance.mjs ...`; `npm audit --omit=dev`.
- **Outputs:** maintained harness `scripts/resumes/ats-parse-test.mjs`; ten-test suite `scripts/resumes/ats-parse-test.test.mjs`; sample and deliberate-break `paste-test.txt`, JSON audit, and Markdown audit under `reports/generated/ats-paste-test/`.
- **Result:** unit/integration suite 10/10 passed. The sample PDF produced PASS with 13/13 required name/title/date/heading fields and 1/1 linear-order check. The deliberate broken PDF exited 1 with FAIL, 7/13 fields and 0/1 order check, proving missing fields do not receive a fluent success report. Expected values were checked against their source Markdown lines before PDF evaluation. Output names its one-parser and human-adequacy limits.
- **Generic inspect mode:** a single command now accepts either `.pdf` or `.md` without an expectation file. Markdown is rendered through the maintained generator; deterministic parser/character/layout checks are separated from heuristic heading/date/contact/bullet inventory; the decision always remains `HUMAN_REVIEW_REQUIRED`. Default output is gitignored `private/ats-paste-test/<input-name>/`. External/private inputs are blocked from writing outside `private/`. Both PDF and Markdown integration runs passed the parser floor. `resumes/*.pdf` is now ignored so local real-PDF inputs cannot be accidentally staged.
- **Private adequacy run:** ran the same stored harness against a user-approved real résumé; all inputs, extracted text, preview, expectation record, and audits remain under gitignored `private/` (or at the user's original external path). No private values or results were copied into tracked artifacts. The run exposed an overly broad substring-match failure mode, so the public harness now distinguishes exact-line, within-line, and document-wide matching; public regression tests cover the fix. Named-human adequacy remains pending.
- **Broke during testing, fixed:** first PDF run reached no verdict because PDF.js 6 exposes resource teardown on the loading task, not the document proxy; changed `document.destroy()` to `loadingTask.destroy()` and reran. Initial PDF.js 6.1.200 also fell in GHSA-hq66-cqwq-w95j; upgraded to patched 6.2.108 and explicitly disabled scripting and eval before rerunning every test and audit.
- **Repository gates:** targeted conformance passed. `npm run verify` remains blocked on this Windows host because the existing conformance runner invokes `python3` and `bash` entry points that are not executable here (`python` is available). `npm run doctor` finds the new command and its privacy check passes when Git is given this workspace as a one-command safe directory, but its existing frontmatter parser rejects CRLF recipe files. These are recorded blockers, not PDF-harness failures.
- **Open issues:** human adequacy attestation is not signed; multi-parser comparison is not implemented; `npm audit` still reports the repo's separate `sharp <0.35.0` high-severity issue, whose available fix is a breaking upgrade and was not applied in this scoped run.
- **Command documentation rule:** added the root `README.md` Capstone command reference. Every future user-facing command must be recorded there or in its linked subsystem README before being sent; private paths are represented only by placeholders.

## 2026-08-15 -- Capstone gate-behavior harness (sample + deliberate mutation)

- **Recipe:** manual (Chapter 11/16 capstone module; unified validation-harness recipe not written yet).
- **Inputs:** public anonymized truth table `data/examples/gate-behavior-cases.json`; contract text in Chapters 11 and 16; production `scripts/score/role-scorer.mjs`.
- **Commands:** `npm.cmd run test:gate-behavior`; `npm.cmd run gate:behavior`; the documented scorer CLI smoke check against `data/examples/ch11-roles.json` with output under `.build/gate-behavior-scorer-check`; targeted `node scripts/conformance.mjs ...`; ATS regression suite rerun after the scorer refactor.
- **Outputs:** pure contract evaluator and deliberate mutation in `scripts/score/gate-behavior-core.mjs`; CLI/report generator `scripts/score/gate-behavior-harness.mjs`; ten-test suite `scripts/score/gate-behavior.test.mjs`; JSON machine audit and Markdown human report under `reports/generated/gate-behavior/`; command and scope documentation in the root and score READMEs.
- **Production result:** 6/6 cases and 40/40 assertions passed. Exact-zero liveness and exact-zero timeline each produced composite `0` and machine `Skip` despite a pre-gate vote sum of `0.65`. Fractional gates scaled the vote sum to `0.26`; the configured `0.05` closed-gate boundary hard-stopped at `Skip`.
- **Deliberate break result:** the gate-as-vote sentinel changed liveness and timeline into weighted addends. It incorrectly returned `0.80 / Apply` for zero liveness and `0.85 / Apply` for zero timeline. Both named mutation witnesses failed the contract, so mutation detection passed; the suite would exit nonzero if either witness were missed.
- **Regression result:** gate suite 10/10 passed; original scorer CLI still produced 5 roles → Apply 2 / Consider 1 / Skip 2; ATS paste-test suite remained 10/10. Targeted conformance checked 10 files and all conformed; `git diff --check` found no whitespace errors.
- **Broke during testing, fixed:** the existing scorer's reason string said every policy-closed gate "zeroes" the composite, but a nonzero factor at the `0.05` boundary scales the composite and then hard-stops the recommendation. Split the message so exact zero claims zeroing while the boundary case accurately claims hard-stop `Skip`.
- **Limits / human gate:** this proves the scoring mechanics and catches the named mutation. It does not establish that upstream posting liveness is current, that a person's timeline input is correct, or that the open weight defaults fit a real search. The generated human report therefore remains `HUMAN_REVIEW_REQUIRED`; named-human adequacy attestation is pending.

## 2026-08-15 -- Step 2 reallocation verification harness

- **Recipe:** `reallocation-verification-harness` v0.1.0, public-sample mode; paired AI recipe and human card created together with `pair_version: 0.1.0`.
- **Two-customer pair:** `recipes/reallocation-verification-harness.md` contains all nine required sections, seven phase gates with explicit failure paths, twelve verification checks, exact commands, output contracts, log template, and stop conditions. `recipes/reallocation-verification-harness.card.md` contains purpose, verified limits, dependencies, annotated commands, outputs, success criteria, and ten named failure modes including recipe/card drift and verified-data contract violation.
- **Inputs:** anonymized public PDF and source-traced expectation record; incomplete public Markdown break fixture; independent Chapter 11/16 gate truth table. Controlled gate values remain labeled as test inputs in the recipe/card boundary, not as real external records. Prior real-résumé evidence remains private and was not used in this public sample.
- **Regression:** ATS suite 11/11 passed after adding the report-boundary regression; gate suite 10/10 passed.
- **Positive controls:** public ATS sample exited 0 with 13/13 declared fields and 1/1 order check; production gate contract passed 6/6 cases and 40/40 assertions.
- **Deliberate breaks:** incomplete résumé rendered to a one-page rebuildable PDF, then strict verification exited 1 with 7/13 fields and 0/1 order checks; the gate-as-vote sentinel produced `0.80 / Apply` and `0.85 / Apply` for the two zero-gate witnesses, and both were caught. No exit-2 execution error was counted as break evidence.
- **Reports read:** positive ATS audit, ATS break audit, and gate-behavior audit. All retain the named-human adequacy boundary.
- **Broke during testing, fixed:** the failed ATS Markdown audit correctly showed FAIL rows but its boundary paragraph still claimed every declared string was present and ordered. Made the boundary verdict-aware and added a regression test preventing a FAIL report from making the all-fields-passed claim; regenerated and reread both ATS reports.
- **Conformance:** the documented Step 2 command checked 22 files (9 Markdown, 7 JavaScript, 6 JSON); all conformed.
- **Lifecycle:** machine sample gates 1–6 passed, so the paired artifacts moved together from DRAFT to `RUNNABLE-SAMPLE`. Gate 7 remains open: no named-human adequacy attestation has been recorded, and neither artifact claims `VERIFIED`.

## 2026-08-15 -- Step 3 verified-data evidence and ethics-gate preflight

- **Stored tool:** added `scripts/verified-data-evidence.mjs` and `npm.cmd run capstone:step3`. It recomputes the public ATS and gate metrics, emits the verified-vs-inferred boundary, and traces every numeric audit leaf to its producing script and record.
- **Ethics machine gate:** PASS. No `private/`, `data/ats/`, résumé PDF, or `.env` path was staged; no non-scaffold private/PII path was tracked. Mechanical checks reconciled the ATS positive result (13/13 fields, 1/1 order), deliberate ATS failure (7/13 fields, 0/1 order), gate production result (6/6 cases, 40/40 assertions), and both gate-as-vote witnesses.
- **Provenance correction:** controlled truth-table factors are labeled `local-evidence`, not represented as real external records. The exact PDF.js dependency is declared in tracked `package.json`; the gitignored lockfile is not cited as repository evidence.
- **Doctor repair:** `scripts/doctor.mjs` now accepts the platform Python command, runs repository-scoped Git privacy checks, and parses LF/CRLF frontmatter. The clean upstream contribution excludes two fork-only recipes whose TODO corrections were unrelated to this capstone.
- **Evidence-gate tests:** 4/4 passed, including deliberate private-staged-path, invented-count, and controlled-source-mislabel failures. ATS remained 11/11 and gate behavior remained 10/10.
- **Artifacts:** active reports are `reports/generated/zening-teng-contribution/step1.md`, `step2.md`, `step3.md`, and `step3.json`; the short filenames follow the student's requested convention.
- **Human gate:** open by design. Machine privacy and mechanical honesty/provenance are PASS, but a named human must read the evidence and underlying audits before Step 4. Recipe/card remain `RUNNABLE-SAMPLE` with null attestation.

## 2026-08-15 -- Step 5 PR-readiness audit and clean upstream packaging

- **Assignment checks:** audited fork, branch pattern, contribution placement, generated-evidence boundary, verify, strict doctor, privacy scope, required PR-description content, and PR-link handoff.
- **Branch repair:** the first capstone branch inherited ten older fork-only commits. Preserved that complete history as local `archive/zening-teng-verification-harness-origin-main`, then rebuilt `contrib/zening-teng-verification-harness` from current `upstream/main`. Only capstone files were carried forward; the fork-only mode scripts, recipes, assignments, and generated résumé PDFs were excluded.
- **Verify repair:** replaced hard-coded `python3`/PyYAML/system-bash assumptions with the tracked JS YAML parser, platform runtime detection, argument-safe execution, Git Bash support on Windows, CRLF/LF normalization, and side-effect-free in-memory Python syntax compilation.
- **Manifest repair:** separated context-routing exclusions from `gitignore_required` paths and taught privacy matching that `/private/*` protects private content while allowing tracked scaffolding.
- **PR hygiene:** the active Step 3 evidence has one JSON/Markdown pair; superseded generated name variants are absent from the clean branch. The real résumé and all derived private output remain gitignored and outside the proposed diff.
- **Portable ATS fixture:** the old fork branch supplied a generated résumé PDF outside the capstone diff. The clean branch instead renders the tracked anonymized Markdown into `.build/ats-paste-test/` at test/run time; no résumé PDF is committed as source of truth. Commands and the paired recipe/card advanced together to v0.8.0.
- **Output:** `reports/generated/zening-teng-contribution/step5.md` contains the requirement audit, maintainer-ready PR description, explicit limitation, and human publication sequence.
- **Blockers:** named-human Step 3 attestation, Step 4 honest run, final rerun after those changes, GitHub authentication, push, actual PR creation, and returned PR URL. No external state was changed.

## 2026-08-15 -- Step 6 employer-facing portfolio case study

- **Assignment fit:** created `reports/generated/zening-teng-contribution/step6.md` as an employer-facing Markdown case study rather than a grader narrative. It covers the specific user/problem, plain-language architecture, one primary measurable result, verified-vs-inferred boundary, named failure modes, one explicit limitation, and a runnable demo.
- **Primary metric:** 2/2 named gate-as-vote mutation witnesses were caught. Supporting script outputs remain 6/6 production cases and 40/40 assertions; ATS positive 13/13 fields and 1/1 order; deliberate ATS break 7/13 fields and 0/1 order with verdict FAIL; regression suites 11 ATS, 10 gate, and 4 evidence tests.
- **Provenance:** every portfolio number is copied from `step3.md` and its named public audit JSON. The case study distinguishes controlled local evidence and parser output from commercial-ATS behavior, résumé truth, live-job truth, visa legality, and human application judgment.
- **Demo boundary:** no PR link or screen recording is claimed. The artifact uses the assignment's runnable-snippet option with commands already maintained in the root README.
- **Privacy:** the case study contains no real résumé content, private output, contact information, application activity, or `data/ats/` record.

## 2026-08-16 -- Step 6 single-page portfolio site

- **Output:** added `reports/generated/zening-teng-contribution/step6.html` as a single-file static-site companion to `step6.md`; the Markdown report now links to it, and the root README records both the artifact and its PowerShell open command. Web fonts are requested from Google Fonts, with repository-approved local fallback stacks when offline.
- **Design contract:** followed `brutalist/DESIGN.md` for the six-color palette, type hierarchy, square geometry, spacing, contrast, and decorative-use boundary. The page includes semantic landmarks, a skip link, visible keyboard focus, responsive layouts, dark mode, reduced-motion handling, and print styles.
- **Evidence boundary:** reused the Step 3 traced metrics and public machine audits; no new score, rate, confidence, résumé content, or real-world adequacy claim was introduced. The page continues to label commercial-ATS equivalence, live posting/timeline truth, weight calibration, and the final application decision as unverified or human-owned.
- **Browser QA:** rendered and visually inspected full-page Chromium screenshots at 1440 × 900 in light mode and 390 × 844 in dark mode. Navigation, cards, metrics, witness table, commands, and local evidence links remained readable without observed clipping or horizontal page overflow.
- **Privacy / publication:** no private résumé or application data is embedded. The site does not claim a PR URL, deployment, recording, named-human attestation, or Step 4 completion.

## 2026-08-16 -- Shorten capstone recipe/card filenames

- **Rename:** moved the active AI recipe from `recipes/reallocation-verification-harness.md` to `recipes/harness.md` and the human card from `recipes/reallocation-verification-harness.card.md` to `recipes/harness.card.md`. Historical log entries retain the filenames that were true when those runs occurred.
- **Pair integrity:** updated both frontmatter `pair` paths, all current README/report/status links, both documented conformance commands, and the card's drift instruction. Both artifacts advanced together from pair/recipe version 0.8.0 to 0.9.0; the contribution identifier remains `reallocation-verification-harness` because only filenames changed.
- **Regression:** ATS tests passed 11/11, gate tests passed 10/10, and Step 3 evidence-gate tests passed 4/4. The regenerated public ATS control passed 13/13 fields and 1/1 order check; the deliberate break exited 1 as required with 7/13 fields and 0/1 order check. The production gate contract passed 6/6 cases and again caught the gate-as-vote mutation.
- **Repository gates:** targeted conformance passed for 22 contribution files; full `npm.cmd run verify` and strict doctor passed. Regenerated Step 3 evidence reported privacy PASS and honesty/provenance PASS while retaining `REQUIRED_BEFORE_STEP_4` for the human attestation.
- **Boundary:** no recipe behavior, evidence input, private-data policy, attestation state, or claimed capability changed. Human adequacy remains pending.

## 2026-08-16 -- Rewrite capstone reports in plain language

- **Scope:** rewrote the existing human reports `step1.md`, `step2.md`, `step3.md`, `step5.md`, and `step6.md`, plus the text in `step6.html`. Step 4 was not created because the named-human Step 3 review is still open and no honest run has occurred.
- **Writing change:** replaced long template-style sentences with short first-person explanations. Step 1 and Step 5 now use no tables. Step 2 uses one results table, Step 6 uses two results tables, and Step 3 keeps its three evidence tables because the assignment requires check status, field-by-field source labels, and number traces.
- **Generator change:** simplified the Step 3 Markdown renderer and its boundary wording in `scripts/verified-data-evidence.mjs`, then regenerated `step3.md` and `step3.json`. Machine logic, evidence labels, counts, privacy rules, and the open human-attestation state did not change.
- **Site QA:** rendered and inspected the updated Step 6 site in Chromium at 1440 × 900 light mode and 390 × 844 dark mode. The shorter copy remains readable with no observed overlap, clipping, or page-level horizontal overflow.
- **Checks:** ATS tests passed 11/11, gate tests passed 10/10, Step 3 tests passed 4/4, and targeted conformance passed for the five Markdown reports plus the Step 3 generator.
- **Privacy:** no private résumé text, contact information, or application data was added to any report.
- **User filename change preserved:** while the reports were being rewritten, the active pair was renamed to `recipes/Zening-AIRecipe.md` and `recipes/Zening.Humancard.md`. Updated both files' internal pair paths, current links, and documented commands; advanced both together to version 0.10.0. Historical log entries keep the filenames that were true for those earlier runs.

## 2026-08-16 -- Step 3 review and Step 4 honest run

- **Named review:** Zening Teng confirmed the plain-language Step 3 summary and approved moving to Step 4. The separate decision record is `logs/zening-teng-step3-review.json`. This clears the assignment gate but does not self-certify lifecycle `VERIFIED`; recipe/card status remains `RUNNABLE-SAMPLE` with null lifecycle attestation.
- **Private run:** ran the maintained ATS inspection against the user-approved real résumé. Input, extracted text, audit, and all résumé-derived values remain outside tracked files under the private-data policy. The public report records only that the run executed and retained `HUMAN_REVIEW_REQUIRED`; it publishes no private content, path, or résumé-derived count.
- **Public positive control:** the rebuildable public regression PDF returned PASS with 13/13 declared fields and 1/1 order check. This fixture is reproducible code-test data, not the real résumé used in the private run.
- **ATS break:** the intentionally incomplete public PDF returned FAIL and exit 1 with 7/13 declared fields and 0/1 order check. The failure is deterministic contract evidence, not an execution error.
- **Gate plausibility audit:** production passed 6/6 cases and 40/40 checks. Open gates returned `0.65 / Apply`; zero liveness, zero timeline, and both zero returned `0 / Skip`; fractional gates returned `0.26 / Consider`; the configured boundary returned `0.0325 / Skip`. These are controlled local cases, not live job or visa facts.
- **Gate break:** the deliberate gate-as-vote mutation returned `0.80 / Apply` for zero liveness and `0.85 / Apply` for zero timeline. Both named witnesses were rejected.
- **Artifacts:** added `reports/generated/zening-teng-contribution/step4.md`; updated the Step 2, Step 3, Step 5, and Step 6 reports and the single-page site; advanced the paired recipe/card together to v0.11.0.
- **Broke during update, fixed:** the first Step 3 generator edit had an invalid template-literal escape. Fixed the syntax, added a missing-review regression case, and regenerated the evidence before continuing.
- **Regression and repository gates:** ATS passed 11/11, gate behavior passed 10/10, and Step 3 evidence passed 5/5. Step 3 regenerated with privacy PASS, honesty/provenance PASS, and the named review recorded. Targeted conformance, full `verify`, and strict `doctor` passed.
- **Site QA:** Chromium checks at 1440 × 900 light mode and 390 × 844 dark mode exposed a mobile results-grid overflow. Added a zero-minimum grid constraint, reran both views, and confirmed the page width now matches both viewports. The refreshed screenshots showed no visible clipping outside the intentionally scrollable result table.
- **Limits:** PDF.js does not represent every commercial ATS. Neither module proves résumé truth or quality, current job liveness, legal timeline correctness, weight calibration, or the final application decision.

## 2026-08-16 -- Replace hand-written gate business values with stored database evidence

- **Reason:** the earlier gate fixture used hand-written sponsorship, fit, role-quality, and fractional gate values. Those were labeled controlled test inputs, but they were too easy to mistake for real business evidence. Historical entries above remain unchanged because they record what was true at the time.
- **Database source:** `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`, SHA-256 `b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb`.
- **Stored-data readout:** the new stored reader scanned 30,369 data records and 20 columns, found 1,557 complete H-1B records, and found 0 approval-rate arithmetic mismatches. It selected the first complete record in stored CSV order: data record 80, `1LIFE HEALTHCARE INC`, with 2 approvals, 0 denials, and a stored/recomputed rate of 100%.
- **Use boundary:** the normalized historical approval rate is used only as a nonzero pre-gate proxy. It is not labeled full sponsorship probability and is not published as a real-company recommendation. The database lacks the raw employer-match evidence needed to verify the stored entity join.
- **Missing inputs:** full sponsorship probability, current job liveness, the private personal timeline, and a real-role recommendation are explicitly `NOT_IMPLEMENTED`. The gate values 0 and 1 are Chapter 11/16 contract controls, not real-world findings.
- **Gate result:** production passed 3/3 database-backed cases and 19/19 assertions. Zero liveness and zero timeline each returned `0 / Skip`. The deliberate gate-as-vote mutation returned `1.35 / Apply` for both witnesses, and both were caught. These mutation values are outputs of intentionally wrong test code, not real role scores.
- **Files and documentation:** added `scripts/score/gate-database-evidence.mjs`; replaced the gate fixture schema; updated the harness, tests, Step 1-6 reports, single-page site, root/scorer READMEs, and Step 3 provenance checker. The AI recipe and human card advanced together to version 0.12.0.
- **Checks:** ATS regression passed 11/11, gate regression passed 10/10, and Step 3 evidence regression passed 8/8. The gate suite includes a check that rejects a hand-written business score. The Step 3 suite includes review-binding, stale-database-hash, and fabricated-missing-input checks. Step 3 regenerated with privacy PASS and honesty/provenance PASS. Full `verify` passed 142-file conformance and the manifest check. Strict `doctor` reported a runnable environment and no tracked private/PII paths.
- **Human gate:** machine checks remain separate from adequacy. The gate audit says `HUMAN_REVIEW_REQUIRED`. The earlier named Step 3 review covered the superseded version and does not bind to recipe 0.12.0 or the current database hash. The current Step 3 report therefore returns `REQUIRED_BEFORE_STEP_4`; the Step 4 report is a draft until a fresh named review and replacement run occur.

## 2026-08-16 -- Database-backed Step 3 approval and post-approval honest run

- **Named review:** after being directed to the database source, gate outcomes, `NOT_IMPLEMENTED` fields, and Step 3 checks, Zening Teng replied `好了 趕緊下一步`. The current record is `logs/zening-teng-step3-review-v0.12.0.json`; it binds the approval to recipe 0.12.0 and database SHA-256 `b04a2f21ddc9214cbec9ba6943a8d4dd245c5fbc9e13cef74d6d989d8bc7ecbb`.
- **Gate rerun:** after approval, production passed 3/3 cases and 19/19 assertions. The two zero-gate cases returned `0 / Skip`; the deliberate gate-as-vote mutation returned `1.35 / Apply` for both witnesses and was caught. Output retained `HUMAN_REVIEW_REQUIRED` for final adequacy and marked real liveness, personal timeline, full sponsorship probability, and a real-role recommendation `NOT_IMPLEMENTED`.
- **ATS positive rerun:** the public two-page PDF returned PASS with 13/13 declared fields and 1/1 order check.
- **ATS break rerun:** the intentionally incomplete one-page PDF returned FAIL and exit 1 with 7/13 fields and 0/1 order check. This was the expected deterministic contract failure, not an execution error.
- **Step 3 rerun:** privacy PASS, honesty/provenance PASS, and current human review `RECORDED by Zening Teng`.
- **Step 4 status:** refreshed `reports/generated/zening-teng-contribution/step4.md` as the current honest run. The earlier private résumé evidence remains private; the public gate and ATS controls were rerun after the current review.
- **Final checks:** ATS regression passed 11/11, gate regression passed 10/10, and Step 3 evidence regression passed 8/8. Full `verify` passed 142-file conformance plus the manifest check. Strict `doctor` reported a runnable environment, complete recipe frontmatter, and no tracked private/PII paths. `git diff --check` found no whitespace errors.
- **Boundary:** this approval clears the assignment phase gate only. It does not verify the database entity join, create missing real-world inputs, certify every commercial ATS, make a real-job decision, or change lifecycle `attestation: null`.

## 2026-08-16 -- Use the required `.card.md` filename

- **Rename:** moved the current human-facing file from `recipes/Zening.Humancard.md` to `recipes/Zening.card.md` so its filename literally ends in `.card.md`. Historical log entries keep the old path because it was correct when those runs happened.
- **Pair update:** changed the AI recipe, current READMEs, status, Step 2 report, Step 6 link, and documented conformance commands to the new path. Both pair records now use `pair_version: 0.12.1`; tested recipe behavior remains `recipe_version: 0.12.0` because no script, data, formula, gate, or evidence boundary changed.
- **Checks:** ATS regression passed 11/11, gate regression passed 10/10, and Step 3 evidence regression passed 8/8. Step 3 regenerated with privacy PASS, honesty/provenance PASS, and the current named review recorded. Full `verify` passed 142-file conformance and the manifest check. Strict `doctor` reported a runnable environment and no tracked private/PII paths.
- **Boundary:** this is a packaging correction only. It does not add a real liveness input, personal timeline, full sponsorship probability, real-role recommendation, PR, or final lifecycle attestation.

## 2026-08-16 -- Remove the ATS inspect `decision` field

- **Requested behavior:** generic ATS inspect mode no longer generates a `decision` property in JSON, a Decision line in Markdown, or a decision line in the console. Its inspect-audit schema advanced to `2.0.0` because the machine-readable shape changed.
- **Boundary retained:** inspect mode still reports the objective `parser_floor`, deterministic checks, heuristic inventory, source boundary, and private artifacts. Verify mode still emits evidence-backed `PASS/FAIL` only when an independent expectation record is supplied. Gate and named-human review fields were not changed.
- **Private rerun:** reran the approved real PDF locally. Parser floor passed with 7/7 deterministic checks and 0 review flags. The regenerated private JSON and Markdown contain no `decision` field or heading; no private content or résumé-derived audit was added to the tracked tree.
- **Checks:** ATS regression passed 11/11, including an explicit no-decision assertion. Step 3 evidence regression passed 8/8 and regenerated with privacy PASS, honesty/provenance PASS, and the current named review recorded. Full `verify` and strict `doctor` passed with no tracked private/PII paths.

## 2026-08-16 -- Three-slide capstone video explainer

- **Output:** created `reports/generated/zening-teng-contribution/video.pptx`, a three-slide 16:9 live deck with embedded English speaker notes. The rebuild script is `scripts/presentation/build-video-ppt.ps1`; the command and open action are recorded in the root README.
- **Visual:** generated one project-local, transparent editorial-cartoon asset at `reports/generated/zening-teng-contribution/assets/capstone-cartoon.png`. It shows a résumé scanner, a scoring machine, two gates catching a software bug, and a human reviewer. It contains no text, logos, personal information, or watermark.
- **Claims:** slide numbers come only from the stored audits and code: seven ATS deterministic checks and two of two controlled gate-as-vote witnesses caught. The deck labels the historical H-1B value as a proxy and keeps commercial-ATS compatibility, current liveness, personal legal timeline, and the final application decision outside the verified boundary.
- **Layout review:** rendered all three slides at 1920 × 1080 and visually checked title safe zones, text wrapping, arrows, borders, image edges, and footer placement. No clipping, overlap, or unreadable text was observed. The PowerPoint package contains three notes-slide records.
- **Accuracy review:** reconciled the `2 / 2` witness claim to the two `deliberate_break.witnesses` records in the gate JSON and checked the ATS seven-check label against the maintained inspect implementation. The first-slide wording was tightened from “survives the filter” to “becomes inspectable” to avoid implying universal ATS certification.
- **Repository layout linter:** `npm.cmd run audit:layout` still reports nine errors and eight warnings in eight pre-existing chapter SVGs. The new deck adds no SVG and none of those findings came from the PPT; its rendered-slide layout was reviewed separately.

## 2026-08-16 -- Simplify the capstone video deck

- **User feedback:** the first three-slide deck and its cartoon carried too many elements. Replaced the project cartoon with a minimal two-icon image: one scanner and one pair of gates stopping a single software bug.
- **Current output:** generated `reports/generated/zening-teng-contribution/video-simple.pptx` with two slides and two speaker-note records. Slide 1 names the two modules; slide 2 shows only `PDF → audit`, `Zero gate → Skip`, the traced `2 / 2` controlled-witness result, and one short unknown-data boundary.
- **File-in-use boundary:** the earlier `video.pptx` was open in PowerPoint and could not be overwritten. It remains as the earlier generated version; README and the build script now point to `video-simple.pptx` as the current deck.
- **Visual QA:** rendered both slides at 1920 × 1080. No clipping, overlap, unreadable label, or off-canvas image was observed. The simplified cartoon has no words, people, personal data, logos, or watermark.

## 2026-08-16 -- Make the two hard gates visually explicit

- **User feedback:** the raised barriers in the first simplified illustration looked passable and did not show the required hard-stop rule.
- **Visual correction:** replaced them with two separate, fully lowered barriers and labeled them `LIVENESS` and `TIMELINE`. Slide 1 now states `Either zero → 0 / Skip`; slide 2 repeats `Either gate = 0 → Skip`.
- **Scope:** the ATS scanner illustration, the two-module structure, the stored `2 / 2` witness result, and the verified/unknown boundary did not change. The image contains no résumé details or other personal data.
- **QA:** regenerated `video-simple.pptx`, exported both slides at 1920 × 1080, and visually checked the white background, labels, lowered barriers, title safe zones, footer, overlap, and clipping.

## 2026-08-16 -- Simplify the second explainer slide

- **User feedback:** slide 2 tried to explain the ATS module, the gate rule, the witness count, and all unknown inputs at once.
- **Change:** reduced the slide to two equations: `Liveness = 0 → Skip` and `Timeline = 0 → Skip`. Kept only the traced `2 / 2` controlled bad-code result and the boundary sentence that the final application decision stays human.
- **QA:** regenerated the two-slide deck, preserved both speaker-note records, and visually checked the new slide at 1920 × 1080 for readability, overlap, and clipping.

## 2026-08-16 -- State that a correct Skip is success

- **Correction:** the prior slide showed the hard-stop outcome but did not explicitly say that `Skip` is a successful engine result when either hard gate is zero.
- **Wording:** slide 1 now says `A correct stop is success`; slide 2 is titled `A correct Skip is success` and labels the two mutation witnesses as wrong `Apply` results.
- **Boundary:** this changes the explanation only. The controlled `2 / 2` record, gate code, database evidence, and real-world unknowns did not change.

## 2026-08-16 -- Rewrite Step 3 and Step 4 against the current audits

- **Reason:** the public reports still contained superseded gate values from the earlier hand-written fixture. Replaced those values with the current database-backed evidence and simplified the writing.
- **Step 3:** updated the stored generator and regenerated `step3.md` and `step3.json`. The report now shows the passing privacy/honesty gate, the complete verified/human-owned boundary, the number trace, the named-human decision, and the `NOT_IMPLEMENTED` boundary in plain language.
- **Step 4:** pasted the current public ATS and gate terminal summaries, recorded the private résumé run without private content or counts, recomputed the plausibility check from the stored H-1B record, documented both deliberate breaks, listed the controlled metrics, and stated what the machine could not know.
- **Recovered required records:** the current branch had deleted the recipe/card lifecycle frontmatter and the database-bound Step 3 review record. Restored them from the immediately preceding committed version. The review remains bound to recipe `0.12.0` and the current database hash; lifecycle `attestation` remains null.
- **Current evidence:** public ATS positive control returned 13/13 fields and 1/1 order; the deliberate ATS break returned 7/13 fields, 0/1 order, FAIL, and exit 1; production gate behavior passed 3/3 cases and 19/19 assertions; both deliberate gate-as-vote witnesses returned 1.35/Apply and were caught.
- **Checks:** ATS regression passed 11/11, gate regression passed 10/10, and Step 3 regression passed 8/8. Targeted conformance, full `verify`, strict `doctor`, and `git diff --check` passed. A stale-value search found none of the old 6/6, 40/40, 0.65, 0.80, or 0.85 gate figures in Step 3 or Step 4.
- **Privacy:** no private résumé text, path, or résumé-derived count was added to a tracked report. Strict doctor found no tracked private/PII paths.

## 2026-08-16 -- Simplify the Step 3 and Step 4 writing

- **Step 3:** kept only the one table the assignment requires: what the scripts check and what a person must check. Changed the privacy checks and main number sources into short lists.
- **Step 4:** removed tables and replaced terms such as “positive control,” “fixture,” “assertions,” and “contract” with simpler wording in the explanation. The copied terminal output stays unchanged so it still matches the real run.
- **Evidence:** no data, totals, test outcomes, source paths, or limitations changed.
- **Checks:** the Step 3 tests passed 8/8. Full `verify`, strict `doctor`, targeted conformance, and `git diff --check` passed. Step 3 contains one table and Step 4 contains none.

## 2026-08-16 -- Rewrite the Step 3 boundary table in plain language

- **Change:** shortened the table from 29 detailed rows to 18 grouped rows. The visible report now uses names such as “the PDF chosen for the ATS test,” “the software that reads the PDF,” and “correct Gate results and totals.”
- **Exact fields:** kept the computer field names in `step3.json` under each row's `technical_fields` list, so the shorter Markdown table does not remove the detailed evidence map.
- **Evidence:** no source, number, result, privacy rule, or human-review boundary changed.
- **Checks:** regenerated Step 3 with privacy and source checks passing. Step 3 tests passed 8/8; full `verify` and strict `doctor` passed.
