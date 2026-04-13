---
description: "Comment Quality Check — enforce senior-engine comment standards"
---
Activate the **Comment Checker** workflow from oh-my-qwencode.

Enforce senior-engine comment standards after every code write.

## Auto-Fail Criteria
A code write FAILS if ANY of these are true:
1. **No intent comments** — new functions/logic blocks have zero WHY comments
2. **AI fluff** — comments with "crucial", "important", "robust", "comprehensive" as filler
3. **Zombie code** — commented-out code without explanation
4. **TODO without tracking** — TODO/FIXME without issue reference or owner tag
5. **Magic numbers** — unexplained numeric constants without named constant extraction

## Good Comment Examples
```typescript
// WHY: Retry with exponential backoff because the API rate-limits aggressively
function retryWithBackoff(fn: () => Promise<T>): Promise<T> { ... }

// WHY: Must use POST — the API doesn't support PATCH on this endpoint
await fetch('/api/users', { method: 'POST' });
```

Task: {{args}}
