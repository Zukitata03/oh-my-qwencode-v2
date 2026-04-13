---
name: comment-checker
description: Enforce senior-engine comment standards after every code write — auto-fail on AI fluff, zombie code, untracked TODOs
---

# Comment Checker

Enforce senior-engine comment standards automatically after every code write. This is a **guard-level** quality gate.

## When to Apply

Apply this check automatically after every code write or edit. A code write **fails the comment check** if ANY auto-fail criteria are met.

## Principles

### DO: Comment Intent (WHY, not WHAT)

```typescript
// GOOD: explains WHY
// Retry with exponential backoff because the API rate-limits aggressively
function retryWithBackoff(fn: () => Promise<T>): Promise<T> {
  // ...
}
```

### DO: Document Non-Obvious Constraints

```typescript
// GOOD: captures external constraint
// Must use POST here — the API doesn't support PATCH on this endpoint
await fetch('/api/users', { method: 'POST' });
```

### DO: Explain Trade-offs

```typescript
// GOOD: captures decision rationale
// Using O(n²) sort here because n <= 10 in practice;
// introducing a full sort library would add 50KB for no real benefit
items.sort((a, b) => a.value - b.value);
```

## DON'T: AI Fluff

```typescript
// BAD: AI-generated fluff
// This function is a crucial part of our codebase that handles
// the important task of processing user input with care and precision
function processInput(input: string) {
```

AI fluff word list (when used as filler, not as genuine technical description):
`crucial`, `important`, `robust`, `comprehensive`, `elegant`, `seamless`, `powerful`, `sophisticated`, `intuitive`, `cutting-edge`

## DON'T: State the Obvious

```typescript
// BAD
// Increment the counter
counter++;

// BAD
// Check if user is logged in
if (user.isLoggedIn) {
```

## DON'T: Leave Zombie Code

```typescript
// BAD: commented-out code with no explanation
// const oldResult = legacyTransform(input);

// GOOD: explains why code is preserved
// Kept for reference during migration — legacyTransform uses the old
// algorithm that doesn't handle Unicode. Remove after v2 migration complete.
// const oldResult = legacyTransform(input);
```

## Auto-Fail Criteria

A code write **fails the comment check** if ANY of these are true:

1. **No intent comments** — New functions or logic blocks have zero comments explaining WHY (not WHAT)
2. **AI fluff detected** — Comments contain fluff words ("crucial", "important", "robust", "comprehensive" used as filler)
3. **Zombie code** — Commented-out code blocks without explanation of why they're preserved
4. **TODO without tracking** — `TODO`/`FIXME` without issue reference, owner tag, or deadline
5. **Magic numbers** — Unexplained numeric constants without named constant extraction

## Well-Formed Comment Example

```typescript
/**
 * Debounce rapid search input to avoid overwhelming the API.
 *
 * We use 300ms because:
 * - < 200ms: too many requests during fast typing
 * - > 500ms: feels sluggish to users
 *
 * Edge case: if the user types continuously, we wait until
 * they stop for 300ms before firing. This means the API
 * is never called more than once per 300ms regardless of
 * typing speed.
 */
function debouncedSearch(query: string) {
  // Clear any pending search from previous keystroke
  clearTimeout(pendingSearch);

  // Schedule new search — will be cleared if user types again
  // within the 300ms window
  pendingSearch = setTimeout(() => {
    api.search(query).then(updateResults);
  }, 300);
}
```

## Checklist

Before claiming a code write passes comment check:

- [ ] Every new function has intent comment (WHY, not WHAT)
- [ ] No AI fluff words ("crucial", "robust", "comprehensive" as filler)
- [ ] No zombie code without explanation
- [ ] Magic numbers extracted as named constants
- [ ] TODO/FIXME items have issue references or owner tags
- [ ] Non-obvious constraints documented
- [ ] Trade-off decisions explained

## Integration with AI Slop Cleaner

This skill focuses narrowly on **comment quality**. For broader code cleanup (dead code, duplication, needless abstraction, boundary violations, missing tests), use the `ai-slop-cleaner` skill. The two skills are complementary:
- `comment-checker`: guard-level comment quality gate (runs after every code write)
- `ai-slop-cleaner`: multi-pass code cleanup workflow (runs on explicit request or deslop pass)
