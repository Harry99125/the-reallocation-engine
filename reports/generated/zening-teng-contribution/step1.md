# Step 1 — What I Chose

## My choice

I chose to build one contribution with two parts:

- An ATS résumé checker from Chapter 13.
- A gate-behavior test from Chapters 11 and 16.

I kept them together because they solve the same kind of problem. In both cases, an output can look fine while the system is actually wrong.

The ATS checker looks at the text that comes out of a PDF. The gate test checks that job liveness and visa timing stay hard gates in the scorer.

## Why I chose it

This was a good size for the capstone. It was small enough to test carefully, but it fixed two gaps that the book names directly.

It also meets the project rules:

- The work is real code under `scripts/`.
- The ATS test uses a public sample under `data/examples/`.
- The gate test reads the stored H-1B database instead of using a hand-written company score.
- Every reported number comes from a saved audit or test run.
- The workflow has an AI recipe and a human card.
- Failed checks stop the run instead of being hidden.
- Real résumé data stays private and out of Git.
- The reports say what the programs cannot know.

## Chapters used

- Chapter 11: the role scorer and hard gates.
- Chapter 13: résumé PDFs and ATS parsing.
- Chapter 16: honest runs and the gate-as-vote bug.

I also followed the repository rules in `SNICKERDOODLE.md`, `DOMAIN.md`, `_MANIFEST.md`, and `DATA_CONTRACT.md`.

## What this contribution does not do

It does not tell someone whether a résumé is good. It does not prove that every commercial ATS will read a PDF the same way. The database has historical H-1B approval records, but it does not have enough verified fields to calculate the full sponsorship probability. It also does not contain a current job-liveness record or a person's visa timeline. The missing results stay `NOT IMPLEMENTED`.

Those decisions still need real records and a person.

## Status

Step 1 is complete. The build is explained in `step2.md`.
