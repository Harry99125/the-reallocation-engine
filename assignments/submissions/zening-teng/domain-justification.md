# Domain Justification — `case-mscs-opt-research-like-ai-software`

**By:** Zening Teng · 2026-07-06

## Who uses this mode, and in what exact situation

An **F-1 international MSCS/MSIS student, pre-OPT** — still in the program, will
file for OPT at graduation — who is deliberately targeting *research-like*
software roles: Applied AI Engineer, Full-Stack / Software Engineer on a
prototyping team, XR/HCI prototype developer, Research Engineer. The work they
want is exploration, prototyping, benchmarking, evaluation, and AI-assisted
discovery — **not** ticket-closing maintenance, and **not** a formal
PhD-required research-scientist post. They have a fixed, shrinking OPT runway
and can only send a limited number of tailored applications, so every
application spent on a dead-end posting is runway they cannot get back.

## The information asymmetry it addresses

A job title of "Software Engineer" or "AI Innovation Associate" tells this
student almost nothing about the four things that actually decide the outcome,
and none of them are visible from the posting alone:

1. **Will this employer sponsor H-1B?** — invisible without DOL/H-1B history.
2. **Is the posting even live, or a ghost req?** — invisible without an ATS
   liveness check.
3. **Does the start date fit my OPT EAD?** — a scheduling constraint the posting
   rarely states.
4. **Is the "research-like" language real, or is this actually sales/support
   dressed up as innovation?** — a judgment the title actively hides.

The student cannot see any of this by reading harder. The mode makes it explicit
and, critically, **traceable**: every score term is emitted with its value *and*
its source (`record` / `model-judgment` / `your-input`), so the student can tell
what was verified from data versus what was a judgment.

## Connection to the engine layers

- **80 Days to Stay** — the `sponsorship` vote (weight 0.35) draws on H-1B
  history + Form-D funding; profile-conditional (→0 if the student needs no
  sponsorship).
- **Job-Ops** — the `liveness` **gate** (`npm run ats:liveness`, `ats:scan`); a
  ghost posting zeroes the composite regardless of fit.
- **The Cognitive Pivot** — the research-like `fit` vote (weight 0.30) is exactly
  the "verification / system judgment / discovery" work the pivot thesis says AI
  cannot yet do reliably; the `role_quality` (BLS/O*NET AI-resilience) vote is
  wired but currently carries weight 0 (repo defect #3 — see limitations).

The decision core is the Ch.11 Bayesian Role Scorer, run as `npm run score`.

## Failure modes specific to this domain (not "the model hallucinates")

1. **Inflated research-like language passes as real discovery work.** A posting
   full of "innovation," "prototype," "cutting-edge" can be a sales or support
   role. The mode captures this as a *high-fit model-judgment on thin evidence* —
   and the person **least able to catch it is this exact student**: an
   early-career international applicant is the most motivated to believe an
   ambiguous posting is the research-like role they want, and the least likely to
   have the industry network to sanity-check it. The mitigation is structural:
   `fit` is labeled `model-judgment`, never `record`, so the human is forced to
   see it is a guess — but the mode cannot stop an optimistic reader from trusting
   it anyway.

2. **Stale sponsorship records skip a company that just started sponsoring.** DOL
   and Form-D data lag real hiring plans by months. A company that opened a
   cap-exempt or newly-sponsoring req looks like a `None`-tier non-sponsor and
   gets Skipped. The person hurt most is the student **without insider signal** —
   someone with a referral (see the override case in the worked run) can correct
   it with a documented reason; a student cold-applying has no way to know the
   record is stale, so the mode silently steers them away from a real opportunity.
   The override mechanism exists precisely for this, but it only helps those who
   already have the outside information.
