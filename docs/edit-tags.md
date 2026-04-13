# OmQ Edit Tags

Structured tags that wrap every code edit for traceability, audit, and recovery.

## Purpose

Every code edit is tagged with metadata so you can answer: **what changed, why, who changed it, and how it relates to the task** — without relying on git history.

## Tag Format

When making edits, include an OmQ Edit Tag comment block at the top of each changed file or logical edit boundary:

```typescript
// [OMQ:EDIT start]
// task: <task-slug-or-id>
// agent: <agent-role>
// reason: <why this change is needed>
// relates: <related-task-id-or-N/A>
// [OMQ:EDIT end]
```

## Fields

| Field | Description | Example |
|-------|-------------|---------|
| `task` | Short slug identifying the task or feature | `auth-token-refresh` |
| `agent` | Role of the agent making the change | `executor`, `coder`, `deslop-cleaner` |
| `reason` | One-line explanation of WHY | `handle 401 on token expiry with inline refresh` |
| `relates` | Related task ID if this is part of a larger change | `auth-migration` or `N/A` |

## Example

```typescript
// [OMQ:EDIT start]
// task: auth-token-refresh
// agent: executor
// reason: auth service returns inconsistent status codes on token expiry, catch all 4xx and trigger inline refresh
// relates: N/A
// [OMQ:EDIT end]

async function handleResponse(response: Response) {
  if (response.status >= 400 && response.status < 500) {
    // Retry with refreshed token
    await refreshToken();
    return fetch(originalRequest);
  }
  return response;
}
```

## Integration with Lore Commit Protocol

OmQ Edit Tags complement Lore commit trailers:
- **Edit Tags** track individual file changes (micro-level)
- **Lore Trailers** track commit-level decisions (macro-level)

Together they provide full traceability from individual edits to committed decisions.

## Recovery Use Cases

1. **Audit what changed**: grep for `[OMQ:EDIT` across the codebase
2. **Understand why**: the `reason` field explains intent
3. **Revert selectively**: identify edits by `task` slug for targeted rollback
4. **Deslop pass**: the `agent` field identifies which edits came from cleanup vs. implementation

## Enforcement

The `comment-checker` skill validates that new edits include OmQ Edit Tags:
- Missing tag on a new edit → comment check failure
- Tag present but reason is vague (AI fluff) → comment check failure
- Tag format malformed → comment check failure
