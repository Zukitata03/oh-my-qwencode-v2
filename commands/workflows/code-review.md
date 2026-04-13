---
description: "Code Review Workflow — comprehensive multi-pass review"
---
Activate the **Code-Review** workflow from oh-my-qwencode.

Comprehensive code review across multiple dimensions.

## Review Dimensions
1. **Correctness** — logic errors, edge cases, off-by-one
2. **Security** — injection, auth, data exposure, trust boundaries
3. **Performance** — hotspots, unnecessary complexity, N+1 queries
4. **Maintainability** — naming, structure, abstraction, duplication
5. **Testing** — coverage, flaky tests, missing edge cases
6. **API** — breaking changes, versioning, backward compatibility

## Output
Structured review with file:line evidence, severity classification, and concrete fix suggestions.

Task: {{args}}
