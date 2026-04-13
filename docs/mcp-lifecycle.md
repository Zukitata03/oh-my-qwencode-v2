# MCP Server Lifecycle Management

On-demand MCP server lifecycle: spin up when a skill activates, auto-terminate when done.

## Purpose

Always-on MCP servers waste context budget. This document specifies the on-demand lifecycle model for OMQ MCP servers.

## Server Families

| Family | Server Name | Activated By | Auto-Terminate After |
|--------|------------|--------------|---------------------|
| State | `omq_state` | Always active | Never (core) |
| Memory | `omq_memory` | `state_read`/`state_write` usage | 5 min idle |
| Code Intel | `omq_code_intel` | `lsp_*` tool calls | 3 min idle |
| Trace | `omq_trace` | `trace_*` tool calls | 2 min idle |
| Team | `omq_team_run` | `$team` or `$swarm` activation | Session end |
| Explore | `omq_explore` | Exploration tasks | 5 min idle |
| Sparkshell | `omq_sparkshell` | Shell-native verification | 2 min idle |

## Lifecycle Protocol

### Spin Up
- MCP servers start automatically when Qwen Code launches (configured in `config.toml`)
- Individual server activation is controlled by `OMQ_MCP_SERVER_DISABLE_AUTO_START` env vars
- Skills that need specific servers should reference them explicitly

### Auto-Terminate
- Servers with idle timeouts shut down after no tool calls for the specified duration
- State server (`omq_state`) never terminates — it is always needed
- Team server persists until session end (team coordination is session-scoped)

### On-Demand Activation
When a skill needs a specific server:
1. Check if server is already running via tool discovery
2. If not running, the server auto-starts on first tool call (unless disabled)
3. Use the server's tools
4. Server auto-terminates after idle timeout

## Env Var Controls

| Env Var | Server | Default |
|---------|--------|---------|
| `OMQ_STATE_SERVER_DISABLE_AUTO_START` | State | false (always on) |
| `OMQ_MEMORY_SERVER_DISABLE_AUTO_START` | Memory | false (always on) |
| `OMQ_CODE_INTEL_SERVER_DISABLE_AUTO_START` | Code Intel | false (always on) |
| `OMQ_TRACE_SERVER_DISABLE_AUTO_START` | Trace | false (always on) |
| `OMQ_TEAM_RUN_SERVER_DISABLE_AUTO_START` | Team | false (always on) |
| `OMQ_MCP_SERVER_DISABLE_AUTO_START` | All | false (master override) |

## Integration with Skills

Skills that depend specific MCP servers should declare their dependency:

```markdown
<MCP_Dependencies>
- state_read / state_write (omq_state) — for skill state persistence
- lsp_diagnostics (omq_code_intel) — for pre-write validation
</MCP_Dependencies>
```

## Context Budget Considerations

- Idle servers free up context budget
- Core servers (state, memory) should always remain active
- Diagnostic servers (code intel, trace) can terminate when not needed
- Team server is session-scoped — terminates on session end
