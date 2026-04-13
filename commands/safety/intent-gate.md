---
description: "Pre-Execution Intent Analysis — classify intent, scope risk, detect destructive ops"
---
Activate the **Intent Gate** workflow from oh-my-qwencode.

Analyze the true intent behind a request before any work begins. Prevents literal misinterpretation and destructive operations without confirmation.

## Analysis Steps
1. **Classify** — Create / Modify / Fix / Delete / Refactor / Explore / Debug / Review
2. **Scope** — NARROW / MODERATE / BROAD / SYSTEMIC blast radius
3. **Risk** — Assess using risk matrix (likelihood × impact)
4. **Destructive Check** — Flag file deletion, DB migrations, auth changes, force pushes
5. **Intent Mismatch** — Detect when literal request differs from true intent

## Output
```
## IntentGate Decision
### Classified Intent
Type: [category] | Scope: [scope] | Risk: [level]

### True Intent
[What the user actually wants]

### Decision
✅ GO | ⚠️ GO with caution | 🛑 BLOCK
```

Persist analysis to `.omq/state/intent-gate-{timestamp}.json`.

Task: {{args}}
