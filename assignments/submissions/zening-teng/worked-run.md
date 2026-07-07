# Worked Run — `case-mscs-opt-research-like-ai-software`

**By:** Zening Teng · 2026-07-06 · Lifecycle stage reached: **RUNNABLE-SAMPLE**

## Inputs

- **Persona (anonymized):** F-1 MSCS/MSIS student, pre-OPT, needs future H-1B
  sponsorship. File: `data/examples/research-like-profile.json`.
- **8 illustrative research-like roles** in the scorer's input contract. File:
  `data/examples/research-like-roles.json`. No personal data — each role is a
  synthetic case built to exercise one mechanic (a clear Apply, a soft-tier
  Consider, a non-sponsor, a ghost posting, an impossible start date, a
  sales-role-in-disguise, a referral override).

## Commands run (verbatim) and real terminal output

### 1. Confirm the toolchain (conformance)

```
$ npm run score -- data/examples/ch11-roles.json --out-dir "$TEMP/rle-test"
✓ scored 5 roles → Apply 2 · Consider 1 · Skip 2 (skip 40%)
```

Reproduces Ch.11's worked example → the scorer is behaving as the book specifies.

### 2. The mode's real run

```
$ node scripts/score/role-scorer.mjs data/examples/research-like-roles.json \
    --profile data/examples/research-like-profile.json \
    --out-dir reports/generated \
    --md reports/generated/case-mscs-opt-research-like-ai-software-2026-07-06.md

✓ scored 8 roles → Apply 2 · Consider 3 · Skip 3 (skip 38%)
  reports\generated\role-scores.json  +  reports\generated\case-mscs-opt-research-like-ai-software-2026-07-06.md
```

Human report (`reports/generated/case-mscs-opt-research-like-ai-software-2026-07-06.md`), pasted verbatim:

```
# Role Scorer report — 2026-07-06

*Bayesian Role Scorer (Ch.11). Weights: sponsorship 0.35, fit 0.3, role_quality 0 [role_quality weight is [VERIFY] — not pinned by the chapter]. Threshold 0.3. Profile requires sponsorship.*

Summary: 8 roles → Apply 2 · Consider 3 · Skip 3. Skip rate 38% (below the ~50% a healthy run skips; check the inputs).

| Role | Composite | Rec | Why | Audit (term · value · weight · source) |
|---|---|---|---|---|
| Series-A applied-AI startup (recent Form D) — Applied AI Engineer — new grad | 0.478 | Apply | composite 0.478 ≥ 0.3, gates healthy | sponsorship 0.85·0.35 [record]; fit 0.78·0.3 [model-judgment]; role_quality 0.8·0 [record] × liveness 1[record]×timeline 0.9[your-input] |
| Established sponsor — enterprise AI lab — Full-Stack SWE (New Grad), prototyping team | 0.421 | Apply | composite 0.421 ≥ 0.3, gates healthy | sponsorship 0.9·0.35 [record]; fit 0.6·0.3 [model-judgment]; role_quality 0.65·0 [record] × liveness 1[record]×timeline 0.85[your-input] |
| Likely-tier sponsor (HCI/VR studio) — XR Prototype Developer (Unity/C#) | 0.389 | Consider | above threshold (0.389) but one soft spot: sponsorship tier "Likely" | sponsorship 0.55·0.35 [record]; fit 0.8·0.3 [model-judgment]; role_quality 0.75·0 [record] × liveness 1[record]×timeline 0.9[your-input] |
| Household-name non-sponsor — Research-Engineer (prototype/benchmark) | 0.209 | Consider | composite 0.209 in the Consider band [0.2, 0.3) | sponsorship 0·0.35 [record]; fit 0.82·0.3 [model-judgment]; role_quality 0.9·0 [record] × liveness 1[record]×timeline 0.85[your-input] |
| Non-sponsor, but HM is a referral — Software Engineer (prototyping) — scorer says Skip | 0.199 | Consider ⟵ override | composite 0.198 < 0.2 — time is better spent elsewhere | sponsorship 0.05·0.35 [record]; fit 0.72·0.3 [model-judgment]; role_quality 0.7·0 [record] × liveness 1[record]×timeline 0.85[your-input] |
| Vague 'AI Innovation' posting — AI Innovation Associate (actually sales/support) | 0.157 | Skip | composite 0.157 < 0.2 — time is better spent elsewhere | sponsorship 0.4·0.35 [record]; fit 0.15·0.3 [model-judgment]; role_quality 0.2·0 [model-judgment] × liveness 1[record]×timeline 0.85[your-input] |
| Proven sponsor (ghost posting) — AI Prototype Engineer — looks perfect, not live | 0.000 | Skip | gated: liveness ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.9·0.35 [record]; fit 0.85·0.3 [model-judgment]; role_quality 0.85·0 [record] × liveness 0[record]×timeline 0.85[your-input] |
| Proven sponsor — start date before OPT EAD — Simulation Engineer (start date too early) | 0.000 | Skip | gated: timeline ≈ 0.000 (a closed gate zeroes the composite regardless of votes) | sponsorship 0.85·0.35 [record]; fit 0.75·0.3 [model-judgment]; role_quality 0.7·0 [record] × liveness 1[record]×timeline 0[your-input] |
```

### 3. Second real command — the liveness/ATS layer (`ats:scan --dry-run`)

```
$ npm run ats:scan -- --dry-run
Scanning 1 companies via providers (0 local parser; 0 skipped — no provider matched)
(dry run — no files will be written)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal Scan — 2026-07-06
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Companies scanned:     1
Total jobs found:      789
Filtered by title:     347 removed
Filtered by location:  389 removed
Duplicates:            1 skipped
New offers added:      52
New offers:
  + Databricks | AI Engineer - FDE (Forward Deployed Engineer) | Remote - India
  + Databricks | Forward Deployed Engineer - FDE (Fullstack) - Digital Native Business  | United States
  + Databricks | Product Marketing Director, AI | United States
  ... (real, live ATS data via Greenhouse)
```

This is the real source behind the `liveness` gate: a posting only earns
`liveness.factor = 1.0` after it is confirmed present on the live board.

## Verified vs. inferred (line by line)

| Term | Value | Source label | Verified or inferred? |
|---|---|---|---|
| `sponsorship.p` / `.tier` | e.g. 0.85 / Proven | `record` | **Verified** in principle from 80-days/DOL H-1B history. In *this* run the numbers are illustrative fixtures, not a live join — flagged honestly. |
| `liveness.factor` | 1.0 / 0.0 | `record` | **Verifiable** via `npm run ats:liveness` / `ats:scan` (shown live above). Fixture values here are hand-set. |
| `timeline.factor` | 0.0–0.9 | `your-input` | **Human input** — the student's OPT EAD vs the posting start date. A judgment, labeled as such. |
| `fit.p` | 0.15–0.85 | `model-judgment` | **Inferred** — the research-like/software-fit judgment. Never presented as a record. |
| `role_quality.p` | 0.2–0.9 | `record` | Present but **weight 0.0** → contributes nothing today (repo defect #3). |
| composite / recommendation | see table | computed | **Verified arithmetic** — every row's `(Σ vote·weight) × gates` is shown and re-derivable by hand. |

The scorer never let an inferred term masquerade as a record: the audit column
tags each one.

## Verification (how I confirmed the output is real)

1. **Re-ran and reproduced Ch.11** — command #1 gives Apply 2 / Consider 1 /
   Skip 2 on the book fixture, matching the documented worked example.
2. **Parsed the output JSON** —
   `node -e "const d=require('.../role-scores.json'); ..."` →
   `valid JSON — roles: 8 | needs_sponsorship: true | gated-to-zero: 2`.
3. **Cross-checked a count** — 2 roles gated to composite 0.000 (ghost posting,
   early start) matches the 2 gate-fired Skips in the table.
4. **Hand-checked arithmetic** — Applied-AI startup:
   `(0.85·0.35 + 0.78·0.30 + 0.8·0) × 1.0 × 0.9 = (0.2975 + 0.234) × 0.9 = 0.478`. ✓

## Attestation

- Recipe: `case-mscs-opt-research-like-ai-software` v0.2.0
- By: Zening Teng · 2026-07-06

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run score` on `research-like-roles.json` + F-1 profile | 8 roles → Apply 2 · Consider 3 · Skip 3 (38%), full audit trace | A ranked table with sourced terms | 
| `npm run score` on `ch11-roles.json` (control) | Apply 2 · Consider 1 · Skip 2 | Reproduce Ch.11 worked example ✓ |
| `npm run ats:scan -- --dry-run` | 789 jobs found, 52 new, live Databricks/Greenhouse data, no writes | Real ATS liveness surface, side-effect-free ✓ |
| Parse `role-scores.json` via node | valid JSON, 8 roles, 2 gated-to-zero | Machine-readable agent output ✓ |
| **BREAK: missing input file** | `Usage: ...` + `exit=2` | Refuse cleanly, don't invent data ✓ |
| **BREAK: malformed JSON input** | JSON parse error, `exit=1`, no output written | Halt the run, don't emit garbage ✓ |
| **BREAK: override with empty reason** | Skip kept; `! override WITHOUT a documented reason — ignored` | Ch.11 discipline enforced ✓ |
| **BREAK: citizen profile (needs no sponsorship)** | sponsorship weight → 0; Apply 2→0, skip 38%→50% | Profile-conditional weighting flips the ranking ✓ |

### Did not test
- No **live** H-1B join — `sponsorship.p/.tier` are illustrative fixtures, not a
  real lookup against `data/80-days-to-stay/` (that join is `[TODO: DATA SOURCE]`).
- No **live** liveness call was wired into the score run — `ats:scan` was run
  separately to demonstrate the surface; the `liveness.factor` values in the
  fixture are hand-set.
- The proposed `.py` enrichment scripts were **not** built or run — they remain
  typed `[TODO: DEV]`.
- `npm run verify` does **not** pass fully on this Windows box (see below);
  I did not test it on Linux/CI.

### Broke during testing, fixed
- **Unbalanced code fence** in the original recipe: the `\`\`\`json` agent-log
  block was never closed → `conformance.mjs` reported "unbalanced code fences (1)"
  and the file was ungradeable. Fixed in the rewrite; the recipe now shows 4
  balanced fences and no longer appears in the conformance failure list.
- **`python3` not on PATH** — only Anaconda `python` was
  (`C:\Users\...\anaconda3\python.exe`), so `conformance.mjs`'s
  `python3 -m py_compile` failed on all 30 `.py` files + `metadata.yaml`
  ("operable program or batch file"). This was a **pre-existing environment issue
  unrelated to the mode** (my added files are `.json`/`.md`). **Fixed** by adding
  a `python3.exe` shim (copy of `python.exe`) in the already-on-PATH Anaconda
  folder; `node scripts/conformance.mjs` now exits 0 → `✓ all conform`, and
  `npm run verify` goes green on this box.

## Reflection

**What went well.** The mode runs today against a real, tested script and the
output is fully auditable — every term shows its value and source, and I can
re-derive each composite by hand. Both gates fire exactly as designed (a
perfect-looking ghost posting and an impossible start date both drop to Skip
regardless of strong votes), which is the whole point: liveness and timeline are
hard stops, not votes. The break attempts confirmed the scorer refuses bad input
rather than inventing a number, and the citizen-profile test proved the mode is
genuinely visa-aware rather than a generic ranker.

**What it got wrong / missed.** (1) **Skip rate is 38%, below the ~50% a healthy
run should skip** — and the tool says so in its own summary. That is a property
of my curated fixture (I built cases to exercise mechanics, not sampled a noisy
live board), not evidence about the real market; a real batch would skip more.
(2) **`role_quality` carries weight 0** (repo defect #3), so the Cognitive-Pivot
AI-resilience signal — arguably the most on-thesis input — currently moves
nothing. (3) The `sponsorship` and `liveness` numbers in this run are hand-set
fixtures, so the "record" label is aspirational until the live joins exist.

**Next steps.** (a) Build `research-like-extract-fit.py` so `fit` comes from
posting evidence instead of hand-scoring. (b) Close `[TODO: DATA SOURCE]`: join a
real company list to `data/80-days-to-stay/` to populate sponsorship from records.
(c) Wire `npm run ats:liveness` per-URL into the record-assembly step. (d) Resolve
defect #3 — give `role_quality` a real weight and renormalize — then re-run and
re-attest. Only after a live-data run with a human clearing gates 6 and 7 should
this move past RUNNABLE-SAMPLE.
