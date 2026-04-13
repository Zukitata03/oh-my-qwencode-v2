---
description: "Persistence Loop — keep working until task is fully complete and verified"
---
Activate the **Ralph** persistence workflow from oh-my-qwencode.

Ralph keeps working until the task is genuinely complete and architect-verified.

## Procedure
1. **Review progress** — check what's done, what remains.
2. **Continue from where you left off** — pick up incomplete tasks.
3. **Delegate in parallel** — fire independent work simultaneously.
4. **Verify completion with fresh evidence** — run tests, builds, lint; read output; confirm pass.
5. **Architect verification** — at least STANDARD tier review of changes.
6. **Deslop pass** — run cleanup on changed files (dead code, duplication, needless abstraction).
7. **Regression re-verification** — confirm tests/build still pass after cleanup.

## State Management
- Persist mode state for resume safety.
- Track iterations and verification evidence.

## Stop Conditions
- All work verified green (tests, build, lint, architect review).
- User says stop/cancel/abort.
- Fundamental blocker requires user input (missing credentials, unclear requirements).

Task: {{args}}
