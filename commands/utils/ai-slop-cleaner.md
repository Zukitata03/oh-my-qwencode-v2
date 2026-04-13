---
description: "Anti-Slop Cleanup — regression-tests-first, smell-by-smell code cleanup"
---
Activate the **AI Slop Cleaner** workflow from oh-my-qwencode.

Reduce AI-generated slop with a disciplined cleanup workflow that preserves behavior and raises signal quality.

## Procedure
1. **Lock behavior** — add/run regression tests before editing.
2. **Create cleanup plan** — list smells, bound scope, order by safety.
3. **Execute passes one smell at a time:**
   - Pass 1: Dead code deletion
   - Pass 2: Duplicate removal
   - Pass 3: Naming/error handling cleanup
   - Pass 4: Test reinforcement
4. **Run quality gates** — regression tests, lint, typecheck.
5. **Report** — changed files, simplifications, remaining risks.

## Principles
- Prefer deletion over addition.
- Reuse existing patterns before introducing new abstractions.
- No new dependencies without explicit request.

Task: {{args}}
