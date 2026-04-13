# OMQ Hook System Architecture

OMQ implements a multi-layer hook system organized by criticality tier. Hooks intercept execution at every stage to inject context, enforce safety, transform data, ensure continuity, and activate skills.

## 5-Tier Hook Model

| Tier | Purpose | Examples | Disable Policy |
|------|---------|----------|----------------|
| **Core** | Session lifecycle, tool execution | `sessionStart`, `sessionEnd`, `turn-complete`, `session-idle` | Cannot be disabled |
| **Guard** | Safety gates, destructive op protection | `intent-gate`, `comment-checker`, `destructiveOpGuard` | On by default |
| **Transform** | Context injection, compatibility | `contextInjector`, `keywordDetector`, `editTagInjector` | Opt-in |
| **Continuation** | Todo enforcement, retry orchestration | `todoContinuationEnforcer`, `retryOrchestrator`, `escalationHandler` | On by default |
| **Skill** | Skill lifecycle management | `categorySkillReminder`, `autoSlashCommand` | On by default |

## Execution Order

```
User Prompt
  └─→ [Core] sessionStart
  └─→ [Guard] intentGatePreCheck        ← classify intent before execution
  └─→ [Transform] contextInjector       ← inject AGENTS.md, project memory, rules
  └─→ [Skill] categorySkillReminder     ← remind agent of active skills

Agent Working...
  └─→ [Guard] preWriteDiagnostics       ← LSP check before write
  └─→ [Guard] writeExistingFileGuard    ← protect critical files
  └─→ [Transform] editTagInjector       ← inject OmQ Edit Tags for traceability

After Tool Use
  └─→ [Core] postToolUse / turn-complete ← capture state
  └─→ [Guard] postWriteVerification     ← verify write correctness
  └─→ [Guard] commentChecker            ← validate comment quality
  └─→ [Transform] keywordDetector       ← detect pattern keywords

Continuation (periodic)
  └─→ [Continuation] todoContinuationEnforcer ← verify todos progressing
  └─→ [Continuation] idleDetection      ← trigger Ralph Loop if idle
  └─→ [Continuation] retryOrchestrator  ← exponential backoff retry

Session Events
  └─→ [Core] sessionIdle → ralphLoop    ← idle detection triggers persistence
  └─→ [Core] sessionRecovery            ← crash recovery with context compaction
  └─→ [Core] sessionEnd                 ← persist state, archive logs
```

## Plugin System

Hooks are implemented as a plugin-based extensibility system:

- **Event types**: 18+ defined event names (`session-start`, `turn-complete`, `needs-input`, `pre-tool-use`, etc.)
- **Event sources**: `native` (Qwen Code notify callback) and `derived` (output parsing)
- **Plugin contract**: `.mjs` files in `.omq/hooks/` with `export async function onHookEvent(event, sdk)`
- **Plugin SDK**: `tmux.sendKeys`, `log.info/warn/error`, `state.read/write/delete`, `omq.session.read`

## Hook Presets

Presets group related behaviors for easy activation:

| Preset | Tiers | Hooks Enabled |
|--------|-------|---------------|
| `safety` | Guard + Core | intent-gate, comment-checker, destructiveOpGuard, pre/post write checks |
| `review` | Guard + Continuation | pre-review gate, pre-test gate, API change guard |
| `memory` | Transform + Skill | context injector, project memory, skill reminder |
| `telemetry` | Core + Continuation | keyword detector, context monitor, state persist, recovery |
| `workspace-context` | Transform | context injector, rules injector |

Configuration: `~/.omq/config.json` under `hooks.presets`

## Key Hooks

### Intent Gate (Guard Tier)
- **Trigger**: Before any work begins
- **Action**: Classify intent, scope blast radius, assess risk, check destructive ops
- **Output**: Go/No-Go decision with reasoning
- **Skill**: `$intent-gate`

### Comment Checker (Guard Tier)
- **Trigger**: After every code write
- **Action**: Validate comments meet senior-engine standards
- **Auto-Fail**: AI fluff, zombie code, missing intent comments, untracked TODOs
- **Skill**: `$comment-checker`

### Edit Tag Injector (Transform Tier)
- **Trigger**: On code edit
- **Action**: Wrap with OmQ Edit Tags for traceability
- **Format**: `[OMQ:EDIT start]...task/agent/reason...[OMQ:EDIT end]`

### Todo Continuation Enforcer (Continuation Tier)
- **Trigger**: Periodic check, agent claims done
- **Action**: Verify all todos actually completed
- **Output**: Block completion if pending work exists

### Retry Orchestrator (Continuation Tier)
- **Trigger**: Task failure
- **Action**: Execute retry protocol (immediate → 5s → 15s → 30s → escalate)
- **Output**: Structured error report with suggested actions

## Extending

To add a new hook:

1. Create `.omq/hooks/<name>.mjs` with `export async function onHookEvent(event, sdk)`
2. Use the SDK for tmux, logging, state, and OMQ runtime access
3. Hooks auto-discover on next `turn-complete` event

See `docs/edit-tags.md` for OmQ Edit Tags specification.
See `docs/mcp-lifecycle.md` for MCP server lifecycle management.
