---
description: "Socratic Clarification Loop — turn vague ideas into execution-ready specs"
---
Activate the **Deep Interview** workflow from oh-my-qwencode.

A Socratic clarification loop before planning or implementation. Turns vague ideas into execution-ready specifications.

## Depth Profiles
- `--quick` — fast pre-PRD pass; max 5 rounds
- `--standard` (default) — full interview; max 12 rounds
- `--deep` — high-rigor exploration; max 20 rounds

## Execution Policy
- Ask ONE question per round (never batch).
- Ask about intent and boundaries before implementation detail.
- Score ambiguity after each answer and show progress.
- Target the weakest clarity dimension each round.

## Dimensions
- Intent Clarity, Outcome Clarity, Scope Clarity, Constraints, Success Criteria, Context Clarity (brownfield only).

## Deliverable
When complete, produces:
- `.omq/specs/deep-interview-{slug}.md` — execution-ready spec with intent, scope, non-goals, decision boundaries, and acceptance criteria.

Task: {{args}}
