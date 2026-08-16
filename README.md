# The Reallocation Engine

*Verified Data, Phase Gates, and CLI Pipelines for the F-1 OPT Search*

**Nik Bear Brown** and **Humanitarians AI** · Published by Humanitarians AI · First edition, 2026

---

## About this book

*The Reallocation Engine* is a book and a working machine at once. The chapters teach a method for running a high-stakes search — specifically, the job search of an international student on an F-1 visa with the OPT clock running — and the same repository contains the scripts, data, and operating recipes that *run* that method. You can clone it, open a terminal, type a command, and get a sourced Apply / Consider / Skip decision about a real role. The book is not a description of a system that lives somewhere else; the book *is* the system, explained.

Its argument starts with the fluency trap: the first sign of trouble is usually not failure but fluency. A draft looks clean, an answer sounds reasonable, the code runs — and nothing on the surface announces that a human still has work to do. AI has made that surface cheap to produce, and in making *execution* cheap it has left *judgment* scarce. For a student with sixty to ninety days to find a sponsoring employer, that gap is an emergency: scarce effort, spent confidently, in the wrong place. The engine exists to **reallocate** that effort — away from polished cold applications the evidence says will go nowhere, and toward the few roles where a record, not a feeling, says effort can matter.

It does this by refusing to fight fluency with more fluency. Every count, rate, and confidence traces to a source (the verified-data contract); some facts — a dead posting, an impossible visa timeline — veto a role outright rather than nudging a score (gates, not votes); and a healthy run skips at least half of what it evaluates, because the engine's value is in the applications it talks you out of. The machine executes up to a deliberate phase gate and then hands the decision back to you with every source labeled, so the part that is irreducibly human — deciding whether a role is worth a day of your life — stays yours.

The book is for international students on the clock, for the advisors and Humanitarians AI fellows who work alongside them, and for anyone who wants to see what disciplined human–AI collaboration looks like when a real deadline removes the option of self-deception. It is not immigration counsel, not a guide to gaming applicant-tracking systems, and not a general AI manual — it is one search, run honestly, as a way of teaching a discipline that travels.

## What governs this repository: Snickerdoodle

This repository is one *domain* governed by **Snickerdoodle** (`SNICKERDOODLE.md`) — an agent-operating-system that treats a project as a contract between human judgment and AI execution, with named principles, hard gates cleared by a logged human, and a `DRAFT`-to-`VERIFIED` lifecycle. Start with `_MANIFEST.md` (the read-first map); `DOMAIN.md` describes what is runnable today, and `logs/RUN_LOG.md` records what has actually been run.

## Capstone command reference

Working rule for this capstone: every new user-facing command must be added to
this section or its linked subsystem README before it is sent in chat. Private
names and paths are represented with placeholders; personal data never enters
this public README. Commands below use PowerShell-compatible `npm.cmd` because
this Windows host blocks `npm.ps1`.

Detailed module documentation:

- Résumé paste-test: [`scripts/resumes/README.md`](scripts/resumes/README.md)
- Gate-behavior harness: [`scripts/score/README.md`](scripts/score/README.md)
- AI recipe: [`recipes/reallocation-verification-harness.md`](recipes/reallocation-verification-harness.md)
- Human card: [`recipes/reallocation-verification-harness.card.md`](recipes/reallocation-verification-harness.card.md)

### Inspect any résumé PDF or Markdown file

```powershell
npm.cmd run resumes:paste-test -- "resumes\<resume>.pdf"
npm.cmd run resumes:paste-test -- "resumes\<resume>.md"
```

The default output is private:

```powershell
Get-Content "private\ats-paste-test\<resume-name>\inspection-audit.md"
Get-Content "private\ats-paste-test\<resume-name>\paste-test.txt"
$LASTEXITCODE
```

### Run the ATS paste-test regression suite

```powershell
npm.cmd run test:ats-parse
```

### Run evidence-backed field verification on the public sample

```powershell
npm.cmd run resumes:paste-test -- "output\resumes\aarav-patel-cv.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\aarav-patel"
```

### Run the ATS deliberate-break sample

Render the intentionally incomplete public résumé and verify that the strict
paste-test rejects it. The second command must exit `1`; that failure is the
expected evidence.

```powershell
npm.cmd run resumes:pdf -- "data\examples\ats-paste-test-broken-render.md" ".build\ats-paste-test\broken-render.pdf"
npm.cmd run resumes:paste-test -- ".build\ats-paste-test\broken-render.pdf" --expect "data\examples\aarav-patel-ats-expected.json" --out-dir "reports\generated\ats-paste-test\break-attempt"
$LASTEXITCODE
```

### Render a Markdown résumé to PDF

```powershell
npm.cmd run resumes:pdf -- "resumes\aarav-patel-cv.md"
```

### Check the résumé harness files for conformance

```powershell
node scripts/conformance.mjs scripts/resumes data/examples/aarav-patel-ats-expected.json reports/generated/ats-paste-test package.json
```

### Run the Chapter 11/16 gate-behavior harness

Generate the public machine audit and human-readable report:

```powershell
npm.cmd run gate:behavior
Get-Content "reports\generated\gate-behavior\gate-behavior-audit.md"
$LASTEXITCODE
```

Run the regression and mutation-detection tests:

```powershell
npm.cmd run test:gate-behavior
```

Confirm that the original scorer CLI still runs after its testability refactor:

```powershell
npm.cmd run score -- "data\examples\ch11-roles.json" --out-dir ".build\gate-behavior-scorer-check" --md ".build\gate-behavior-scorer-check\role-scores.md"
```

Check the gate-harness files for conformance:

```powershell
node scripts/conformance.mjs scripts/score data/examples/gate-behavior-cases.json reports/generated/gate-behavior package.json README.md
```

### Check the complete Step 2 contribution

```powershell
node scripts/conformance.mjs recipes/reallocation-verification-harness.md recipes/reallocation-verification-harness.card.md scripts/resumes scripts/score data/examples/aarav-patel-ats-expected.json data/examples/ats-paste-test-broken-render.md data/examples/gate-behavior-cases.json reports/generated/ats-paste-test reports/generated/gate-behavior package.json README.md
```

## Table of Contents

### Front matter
- [Front matter — title, copyright, dedication, preface](chapters/00-frontmatter.md)
- [Introduction](chapters/00-introduction.md)

### Chapters 1–3 — The core method
- [Chapter 1 — The Fluency Trap](chapters/01-the-fluency-trap.md)
- [Chapter 2 — The Reallocation Principle](chapters/02-the-reallocation-principle.md)
- [Chapter 3 — The Verified-Data Contract](chapters/03-the-verified-data-contract.md)

### Chapters 4–5 — The discipline
- [Chapter 4 — Two Customers: Writing a Recipe for the AI and the Human](chapters/04-two-customers.md)
- [Chapter 5 — Verifying the Data](chapters/05-verifying-the-data.md)

### Chapters 6–13 — The evidence components
- [Chapter 6 — Where the Money Went: SEC Form D](chapters/06-where-the-money-went-sec-form-d.md)
- [Chapter 7 — Who Sponsors: The 80 Days Sponsorship Scorer](chapters/07-who-sponsors-the-80-days-sponsorship-scorer.md)
- [Chapter 8 — Is the Job Real: ATS Detection and Liveness](chapters/08-is-the-job-real-ats-detection-and-liveness.md)
- [Chapter 9 — Is the Role Any Good: BLS / O\*NET Role Quality](chapters/09-is-the-role-any-good-bls-onet-role-quality.md)
- [Chapter 10 — The Visa Timeline Manager](chapters/10-the-visa-timeline-manager.md)
- [Chapter 11 — The Bayesian Role Scorer](chapters/11-the-bayesian-role-scorer.md)
- [Chapter 12 — The OPT Framing Generator](chapters/12-the-opt-framing-generator.md)
- [Chapter 13 — Resumes That Survive the Filter](chapters/13-resumes-that-survive-the-filter.md)

### Chapters 14–16 — Operating the engine
- [Chapter 14 — Recipes: Operating the Engine](chapters/14-skills-operating-the-engine.md)
- [Chapter 15 — The Pipeline Tracker and the Skip Rate](chapters/15-the-pipeline-tracker-and-the-skip-rate.md)
- [Chapter 16 — The Build and the Honest Run](chapters/16-the-build-and-the-honest-run.md)

### Synthesis and back matter
- [The Fundamental Themes](chapters/97-fundamental-themes.md)
- [Appendix: Best Practices for Running the Reallocation Engine](chapters/98-appendix-best-practices.md)
- [Back matter — acknowledgments, about the author, references, glossary](chapters/99-back-matter.md)

## How this connects to Medhavy

These are Kindle / online editions, designed for integration with **Medhavy** (also **Medhavi**), an AI-powered intelligent-textbook system in which the chapters become adaptive practice — hints, worked examples, quizzes, and feedback loops. Learn more at https://www.medhavy.com/.

---

Copyright © 2026 Nik Bear Brown and Humanitarians AI. Published by Humanitarians AI, a 501(c)(3) nonprofit organization.
