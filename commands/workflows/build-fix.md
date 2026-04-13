---
description: "Fix Build & TypeScript Errors — minimal changes to unblock compilation"
---
Activate the **Build-Fix** workflow from oh-my-qwencode.

Fix build errors, TypeScript type errors, and compilation failures with minimal changes.

## Approach
1. Run the build to capture all errors.
2. Categorize errors: type errors, missing imports, syntax errors, dependency issues.
3. Fix errors in priority order: syntax → imports → types → dependencies.
4. Re-run build after each batch of fixes.
5. Stop when build passes clean.

## Principles
- Minimal changes — fix the error, don't refactor.
- Fix root causes, not symptoms.
- No new dependencies without explicit request.

Task: {{args}}
