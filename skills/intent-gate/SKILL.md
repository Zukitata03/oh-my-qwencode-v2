---
name: intent-gate
description: Pre-execution intent analysis — classifies intent, scopes blast radius, assesses risk, and detects destructive operations before work begins
argument-hint: "[--check] <task description or request>"
---

<Purpose>
IntentGate analyzes the **true intent** behind a request before any work begins. It prevents literal misinterpretation, prompt misclassification, and destructive operations without explicit confirmation.
</Purpose>

<Use_When>
- The request is ambiguous about scope or risk level
- The user asks for deletion, migration, or structural changes
- The request involves auth, data, billing, or public API changes
- You need to confirm the true intent differs from the literal request
- The user explicitly invokes `intent-gate` or `$intent-gate`
</Use_When>

<Do_Not_Use_When>
- The request is trivial and low-risk (typo fix, single-file change)
- The user explicitly says "skip intent analysis" or "just do it"
- A complete PRD/test-spec already exists from `$ralplan` or `$deep-interview`
</Do_Not_Use_When>

<Why_This_Exists>
Users often express intent imprecisely. "Delete this file" may mean "remove this feature" (which spans multiple files). "Make it faster" may need profiling first, not blind optimization. IntentGate catches these mismatches before agents execute the wrong task or make destructive changes.
</Why_This_Exists>

<Execution_Policy>
- Keep the analysis concise and evidence-dense
- Classify intent BEFORE scoping or risk assessment
- Always check for destructive operations
- Present a clear Go/No-Go decision with reasoning
- For `--check` mode: run analysis only, do not proceed to execution
- For normal mode: analysis first, then ask for confirmation if BLOCK or WARN
</Execution_Policy>

<Steps>

## Phase 1: Classify Intent

Determine what **type** of request this is:

| Category | Examples | Default Risk |
|----------|----------|-------------|
| **Create** | "add a button", "new endpoint" | LOW |
| **Modify** | "change the color", "update the API" | LOW |
| **Fix** | "this is broken", "error on line X" | MEDIUM |
| **Delete** | "remove this feature", "drop the table" | HIGH |
| **Refactor** | "clean this up", "make it readable" | MEDIUM |
| **Explore** | "how does X work?", "find usages" | LOW |
| **Debug** | "why is this failing?" | MEDIUM |
| **Review** | "check my code", "any issues?" | LOW |

## Phase 2: Scope Blast Radius

```
Scope Analysis:
1. How many files are likely affected?
   - Single file → NARROW
   - Module (2-5 files) → MODERATE
   - Cross-module (6+ files) → BROAD
   - System-wide (infrastructure) → SYSTEMIC

2. What depends on the affected code?
   - Nothing → ISOLATED
   - Internal modules only → CONTAINED
   - Public API → EXPOSED
   - Data layer → CRITICAL
```

## Phase 3: Risk Assessment

```
Risk Matrix:
                Impact
            Low    Med    High
Likelihood
  Low       ✅     ✅     ⚠️
  Med       ✅     ⚠️     🔴
  High      ⚠️     🔴     🛑

🛑 = BLOCK — require explicit user confirmation
🔴 = WARN — proceed with caution, explain risks
⚠️  = NOTE — mention considerations
✅  = GO — proceed normally
```

## Phase 4: Destructive Operation Check

Flag if request involves:

- [ ] File deletion
- [ ] Database migration (especially DROP/ALTER)
- [ ] Removing public API endpoints
- [ ] Changing authentication/authorization logic
- [ ] Modifying payment/billing code
- [ ] Altering data models with existing data
- [ ] Breaking config file changes
- [ ] Force push / history rewrite

If any checked: **BLOCK** and require explicit user confirmation.

## Phase 5: Intent Mismatch Detection

Check for common mismatches:

| User Says | Likely True Intent | Mismatch Type |
|-----------|-------------------|---------------|
| "Delete this file" | "Remove this feature" | Too aggressive — feature may span multiple files |
| "Make it faster" | "Profile and optimize hot path" | Vague — needs scoping |
| "Fix this bug" | "Find root cause and fix" | Literal vs actual — may need exploration first |
| "Refactor this" | "Improve readability without changing behavior" | Needs behavior constraint |
| "Update the API" | "Add new field to response" | May be create, not modify |

Detection protocol:
1. Parse literal request
2. Infer likely true intent from context
3. If mismatch detected → clarify before proceeding
4. If confident in inference → proceed with stated understanding

## Phase 6: Decision Output

```
## IntentGate Decision

### Classified Intent
Type: [category]
Scope: [scope level]
Risk: [risk level]

### True Intent
[What the user actually wants, which may differ from literal request]

### Destructive Operations
[Checklist results — any flagged?]

### Concerns
[Any mismatches or risks identified]

### Decision
✅ GO — proceed with [workflow]
⚠️ GO with caution — [specific concerns]
🛑 BLOCK — [what needs clarification before proceeding]
```

## Phase 7: Execution Bridge

- If `--check` flag: stop after Phase 6. Do not proceed.
- If decision is ✅ GO: proceed with the task.
- If decision is ⚠️ GO with caution: proceed but state specific concerns.
- If decision is 🛑 BLOCK: ask the user for clarification before any work begins.

Persist the IntentGate decision to `.omq/state/intent-gate-{timestamp}.json` for audit trail.
</Steps>

<State_Management>

Use the `omq_state` MCP server tools for persisting intent analysis:

- **On analysis complete**:
  `state_write({mode: "intent-gate", active: true, classification: "...", scope: "...", risk: "...", decision: "...", timestamp: "<now>"})`

- **On task completion**:
  `state_write({mode: "intent-gate", active: false, completed_at: "<now>"})`

</State_Management>

<Final_Checklist>
- [ ] Intent classified (Create/Modify/Fix/Delete/Refactor/Explore/Debug/Review)
- [ ] Scope assessed (NARROW/MODERATE/BROAD/SYSTEMIC)
- [ ] Risk matrix evaluated (GO/NOTE/WARN/BLOCK)
- [ ] Destructive operations checklist run
- [ ] Intent mismatch detection performed
- [ ] Clear Go/No-Go decision stated
- [ ] Decision persisted to `.omq/state/` for audit trail
</Final_Checklist>

Task: {{ARGUMENTS}}
