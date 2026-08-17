# Step 1 — What I Chose

## My choice

I chose to build one contribution with two parts:

- An ATS resume checker from Chapter 13.
- A gate-behavior test from Chapters 11 and 16.

I kept them together because they solve the same kind of problem. In both cases, an output can look fine while the system is actually wrong.

The ATS checker looks at the text that comes out of a PDF. The gate test checks that job liveness and visa timing stay hard gates in the scorer.


## Chapters used

- Chapter 11: the role scorer and hard gates.
- Chapter 13: resume PDFs and ATS parsing.
- Chapter 16: honest runs and the gate-as-vote bug.

I also followed the repository rules in `SNICKERDOODLE.md`, `DOMAIN.md`, `_MANIFEST.md`, and `DATA_CONTRACT.md`.

## What this contribution does not do

It does not tell someone whether a resume is good. It does not prove that every commercial ATS will read a PDF the same way. The database has historical H-1B approval records, but it does not have enough verified fields to calculate the full sponsorship probability. It also does not contain a current job-liveness record or a person's visa timeline. The missing results stay `NOT IMPLEMENTED`.

Those decisions still need real records and a person.

