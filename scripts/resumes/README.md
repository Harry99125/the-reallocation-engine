# Resume Scripts

Utilities for turning anonymized student-style Markdown CV examples into
ATS-friendly PDFs.

## Generate PDFs

Render every `resumes/*-cv.md` file:

```bash
npm run resumes:pdf -- --all
```

Render one file:

```bash
npm run resumes:pdf -- resumes/aarav-patel-cv.md
```

Default output directory:

- `output/resumes/`

The generator uses Playwright/Chromium and a small built-in Markdown renderer
for resume-safe Markdown headings, paragraphs, bold text, inline code, and
bullets.

## Inspect any PDF or Markdown résumé

The Chapter 13 paste-test harness extracts PDF text with PDF.js, checks parser
mechanics, inventories common résumé signals, and writes a plain-text extraction
plus JSON and Markdown audits. Markdown inputs are rendered through the
maintained PDF generator first. No expectation file is required:

```bash
npm run resumes:paste-test -- resumes/aarav-patel-cv.md
npm run resumes:pdf -- resumes/aarav-patel-cv.md .build/ats-paste-test/aarav-patel-public.pdf
npm run resumes:paste-test -- .build/ats-paste-test/aarav-patel-public.pdf
```

Default output goes to `private/ats-paste-test/<input-name>/`, even for public
samples. Inspect mode can prove parser mechanics and character integrity, but
its heading/date/contact inventory is heuristic. It does not generate a
decision; a person reads the extracted text and decides whether it is adequate.

Real Markdown source files still belong under `private/`; `resumes/` is for the
tracked anonymized Markdown examples. Local PDF inputs under `resumes/` are
gitignored and can be inspected directly without becoming commit candidates.

## Verify declared fields against independent evidence

Add `--expect` only when a local source or human-approved checklist independently
declares the required name/title/date/heading fields. Verify mode checks every
field and their linear order, then writes per-field PASS/FAIL audits.

Expectation fields support three explicit match modes: `line` for names and
section headings that must occupy a complete extracted line; `line-contains`
for titles or dates that may share a row; and `contains` as the least strict
fallback. Use `occurrence` when the same phrase legitimately appears more than
once. This prevents a heading word mentioned earlier in body text from creating
a false PASS or a false order failure.

Run the anonymized sample:

```bash
npm run resumes:pdf -- resumes/aarav-patel-cv.md .build/ats-paste-test/aarav-patel-public.pdf
npm run resumes:paste-test -- .build/ats-paste-test/aarav-patel-public.pdf \
  --expect data/examples/aarav-patel-ats-expected.json \
  --out-dir reports/generated/ats-paste-test/aarav-patel
```

Run the deliberate broken-render sample. The second command must exit `1`; a
zero exit would mean the harness missed the missing/scrambled fields:

```bash
npm run resumes:pdf -- data/examples/ats-paste-test-broken-render.md .build/ats-paste-test/broken-render.pdf
npm run resumes:paste-test -- .build/ats-paste-test/broken-render.pdf \
  --expect data/examples/aarav-patel-ats-expected.json \
  --out-dir reports/generated/ats-paste-test/break-attempt
```

For a real résumé, the default private output is safe. If `--out-dir` is given
for an external or private input, it must still be under `private/`. The command
exits `0` when the parser floor or declared verification passes, `1` for a
deterministic inspection/verification failure, and `2` for an input, contract,
parser, rendering, or write error.

This is a parser-floor check, not certification for every ATS. A human must read
`paste-test.txt` before deciding the document is adequate to send.

Run the harness unit tests:

```bash
npm run test:ats-parse
```

Install browser support first:

```bash
npm install
npx playwright install chromium
```
