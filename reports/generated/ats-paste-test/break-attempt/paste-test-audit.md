# ATS paste-test audit — aarav-patel-cv

**Verdict: FAIL**

PDF.js 6.2.108 extracted 1 page(s). Required fields: 7/13 PASS. Order checks: 0/1 PASS.

| Status | Category | Field | Expected record | Observed record |
|---|---|---|---|---|
| PASS | name | Aarav Patel (line) | resumes/aarav-patel-cv.md:1 | paste-test.txt @ normalized offset 0 |
| PASS | heading | Experience (line) | resumes/aarav-patel-cv.md:5 | paste-test.txt @ normalized offset 231 |
| PASS | title | Dassault Systemes \| Software Engineer (line) | resumes/aarav-patel-cv.md:7 | paste-test.txt @ normalized offset 242 |
| PASS | date | Jan 2026 - May 2026 (line-contains) | resumes/aarav-patel-cv.md:9 | paste-test.txt @ normalized offset 294 |
| FAIL | title | Dassault Systemes \| Software Engineer (line) | resumes/aarav-patel-cv.md:14 | paste-test.txt (not found) |
| FAIL | date | Jan 2025 - Aug 2025 (line-contains) | resumes/aarav-patel-cv.md:16 | paste-test.txt (not found) |
| FAIL | title | Infosys Limited \| Software Engineer (line) | resumes/aarav-patel-cv.md:22 | paste-test.txt (not found) |
| FAIL | date | Jun 2021 - Jul 2023 (line-contains) | resumes/aarav-patel-cv.md:24 | paste-test.txt (not found) |
| PASS | heading | Technical Skills (line) | resumes/aarav-patel-cv.md:31 | paste-test.txt @ normalized offset 314 |
| PASS | heading | Projects (line) | resumes/aarav-patel-cv.md:40 | paste-test.txt @ normalized offset 369 |
| PASS | heading | Education (line) | resumes/aarav-patel-cv.md:56 | paste-test.txt @ normalized offset 386 |
| FAIL | date | Sep 2023 - Dec 2025 (line-contains) | resumes/aarav-patel-cv.md:60 | paste-test.txt (not found) |
| FAIL | date | Sep 2017 - May 2021 (line-contains) | resumes/aarav-patel-cv.md:64 | paste-test.txt (not found) |

## Order checks

- **FAIL — document-linear-order:** missing fields: title-dassault-2, date-dassault-2, title-infosys, date-infosys, date-northeastern, date-dharmsinh.

## Verified boundary

- The parser checked every declared string and order constraint; the FAIL rows above identify evidence that is missing or out of order.
- Expected values came from the named local Markdown lines; the harness checked that contract before parsing.
- This does not certify compatibility with every ATS, semantic résumé quality, factual truth of résumé claims, or visual adequacy.
- A named human must read `paste-test.txt` and decide adequacy.
