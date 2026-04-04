# oh-my-qwencode Demo Guide

## Prerequisites

- Node.js >= 20
- [Qwen Code](https://github.com/openai/qwen) installed (`npm install -g @openai/qwen`)
- OpenAI API key configured

## Setup (< 2 minutes)

```bash
# Clone and install
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm link

# Run setup (installs prompts, skills, configures Qwen Code)
omq setup
```

**Expected output:**
```
oh-my-qwencode setup
=================

[1/7] Creating directories...
  Done.

[2/7] Installing agent prompts...
  Installed 30 agent prompts.

[3/7] Installing skills...
  Installed 40 skills.

[4/7] Updating config.toml...
  Done.

[4.5/7] Verifying Team MCP comm tools...
  omq_state exports: team_send_message, team_broadcast, team_mailbox_list, team_mailbox_mark_delivered

[5/7] Generating AGENTS.md...
  Generated AGENTS.md in project root.
  # (or: AGENTS.md already exists, use --force to overwrite)

[6/7] Configuring notification hook...
  Done.

[7/7] Configuring HUD...
  HUD config created (preset: focused).
  StatusLine configured in config.toml via [tui] section.

Setup complete! Run "omq doctor" to verify installation.
```

## Verify Installation

```bash
omq doctor
```

**Expected output:**
```
oh-my-qwencode doctor
==================

  [OK] Qwen Code: installed
  [OK] Node.js: v20+
  [OK] Qwen Code home: ~/.qwen
  [OK] Config: config.toml has OMQ entries
  [OK] Prompts: 30 agent prompts installed
  [OK] Skills: 40 skills installed
  [OK] AGENTS.md: found in project root
  [OK] State dir: .omq/state
  [OK] MCP Servers: 4 servers configured (OMQ present)

Results: 9 passed, 0 warnings, 0 failed
```

## Demo 1: Agent/Skill Keywords

Start Qwen Code in any project directory:

```bash
omq
```

Then use role and workflow keywords:

```
> $architect "analyze the authentication module"
```

**Expected:** The architect agent analyzes code with file:line references, root cause diagnosis, and trade-off analysis.

```
> $security-reviewer "review the API endpoints"
```

**Expected:** OWASP Top 10 analysis with severity-prioritized findings and remediation code examples.

```
> $explore "find all database query patterns"
```

**Expected:** Structural codebase search with file listings and pattern summaries.

## Demo 2: AGENTS.md Orchestration Brain

The generated `AGENTS.md` in your project root acts as the orchestration brain. It provides:

- Delegation rules (when to use which agent)
- Model routing guidance in AGENTS.md (complexity/role-based routing)
- 30-agent catalog with descriptions
- 40 skill descriptions with trigger patterns
- Team compositions for common workflows
- Verification protocols

Qwen Code loads this automatically at session start.

## Demo 3: CLI Status Commands

```bash
# Check version
omq version

# Check all active modes
omq status

# Cancel any active mode
omq cancel
```

**Expected output for `omq version`:**
```
oh-my-qwencode vX.Y.Z
Node.js v20+
Platform: linux x64
```

**Expected output for `omq status` (no active modes):**
```
No active modes.
```

## Demo 4: Skills in Qwen Code

Skills are automatically discovered by Qwen Code. In a Qwen Code session:

```
> $autopilot "build a REST API for task management"
```

**Expected:** Full autonomous pipeline: requirements analysis -> technical design -> parallel implementation -> QA cycling -> multi-perspective validation.

```
> $team 3:executor "fix all TypeScript errors"
```

**Expected:** Spawns 3 coordinated executor agents working on a shared task list with staged pipeline (plan -> prd -> exec -> verify -> fix loop).

## Demo 5: MCP State Management

The MCP servers are configured in `config.toml` and provide state/memory tools to the agent:

```
> Use state_read to check if any modes are active
> Use project_memory_read to see project context
> Use notepad_write_working to save a note about current progress
```

**Expected:** Agent accesses `.omq/state/` and `.omq/project-memory.json` through MCP tool calls.

## Demo 6: E2E Team CLI (5+ Parallel Workers, Mixed Qwen Code/Claude)

This demo showcases the **tmux-based multi-agent orchestration** system that spawns parallel workers across different AI CLI tools (Qwen Code + Claude) in a single tmux session.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    tmux Session "omq-team"                   │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Leader     │  │ Worker 1 │  │ Worker 2 │  │ Worker N │ │
│  │  (main pane) │  │ (qwen)  │  │ (qwen)  │  │ (claude) │ │
│  └──────────────┘  └──────────┘  └──────────┘  └──────────┘ │
│         │               │              │              │     │
│         └───────────────┴──────────────┴──────────────┘     │
│                         │                                   │
│              ┌──────────┴──────────┐                        │
│              │  Shared Task Queue   │                        │
│              │  (durable state)     │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Mixed CLI Workers**: Combines Qwen and Anthropic Claude agents in one team
- **Durable State**: Task assignments persist across session interruptions
- **Claim-Safe Lifecycle**: Prevents race conditions with versioned task claims
- **Mailbox Communication**: Structured message passing between workers

### Quick Start

Use a deterministic task slug so the team name is predictable:

```bash
export TEAM_TASK="e2e team demo"
export TEAM_NAME="e2e-team-demo"   # slugified from TEAM_TASK

# Mixed worker CLIs (5+ workers, qwen + claude)
export OMQ_TEAM_WORKER_CLI=auto
export OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,qwen,claude,claude,claude
# Note: -c model_reasoning_effort is silently ignored (configure in ~/.qwen/settings.json instead)
export OMQ_TEAM_WORKER_LAUNCH_ARGS='-c model_reasoning_effort="low"'

# 5-worker baseline
omq team 5:executor "parallel team smoke"

# 6-worker mixed-CLI E2E run
omq team 6:executor "$TEAM_TASK"

# Discover team command help
omq team --help
omq team api --help

# Lifecycle commands
omq team status "$TEAM_NAME"
omq team resume "$TEAM_NAME"
omq team shutdown "$TEAM_NAME"
```

**Expected:**
- Team starts with 5+ workers and prints `Team started: <team-name>` plus worker counts.
- Mixed CLI map runs Qwen Code workers and Claude workers in one team.
- `status` shows task distribution and worker health.
- `shutdown` cleans up workers and team state.

## Demo 7: `omq team api` Rich CLI Interop Demonstration

All mutations should use CLI interop (`omq team api ... --json`) with the stable JSON envelope.

### 7.1 Task lifecycle (claim-safe)

```bash
CREATE_JSON=$(omq team api create-task --input '{"team_name":"e2e-team-demo","subject":"Demo lifecycle","description":"Claim-safe lifecycle demo","owner":"worker-1"}' --json)
TASK_ID=$(echo "$CREATE_JSON" | jq -r '.data.task.id')

CLAIM_JSON=$(omq team api claim-task --input "{\"team_name\":\"e2e-team-demo\",\"task_id\":\"$TASK_ID\",\"worker\":\"worker-1\",\"expected_version\":1}" --json)
CLAIM_TOKEN=$(echo "$CLAIM_JSON" | jq -r '.data.claimToken')

omq team api transition-task-status --input "{\"team_name\":\"e2e-team-demo\",\"task_id\":\"$TASK_ID\",\"from\":\"in_progress\",\"to\":\"completed\",\"claim_token\":\"$CLAIM_TOKEN\"}" --json
```

### 7.2 Mailbox/message flow

```bash
omq team api send-message --input '{"team_name":"e2e-team-demo","from_worker":"leader-fixed","to_worker":"worker-1","body":"ACK: worker-1 ready"}' --json
omq team api broadcast --input '{"team_name":"e2e-team-demo","from_worker":"leader-fixed","body":"Sync checkpoint"}' --json
MAILBOX_JSON=$(omq team api mailbox-list --input '{"team_name":"e2e-team-demo","worker":"worker-1"}' --json)
MESSAGE_ID=$(echo "$MAILBOX_JSON" | jq -r '.data.messages[0].message_id // empty')
omq team api mailbox-mark-notified --input "{\"team_name\":\"e2e-team-demo\",\"worker\":\"worker-1\",\"message_id\":\"$MESSAGE_ID\"}" --json
omq team api mailbox-mark-delivered --input "{\"team_name\":\"e2e-team-demo\",\"worker\":\"worker-1\",\"message_id\":\"$MESSAGE_ID\"}" --json
```

### 7.3 Complete operations matrix (broad coverage)

```bash
omq team api read-task --input '{"team_name":"e2e-team-demo","task_id":"<TASK_ID>"}' --json
omq team api list-tasks --input '{"team_name":"e2e-team-demo"}' --json
omq team api update-task --input '{"team_name":"e2e-team-demo","task_id":"<TASK_ID>","description":"Updated via CLI interop"}' --json
omq team api release-task-claim --input '{"team_name":"e2e-team-demo","task_id":"<TASK_ID>","claim_token":"<CLAIM_TOKEN>","worker":"worker-1"}' --json
omq team api read-config --input '{"team_name":"e2e-team-demo"}' --json
omq team api read-manifest --input '{"team_name":"e2e-team-demo"}' --json
omq team api read-worker-status --input '{"team_name":"e2e-team-demo","worker":"worker-1"}' --json
omq team api read-worker-heartbeat --input '{"team_name":"e2e-team-demo","worker":"worker-1"}' --json
omq team api update-worker-heartbeat --input '{"team_name":"e2e-team-demo","worker":"worker-1","pid":12345,"turn_count":12,"alive":true}' --json
omq team api write-worker-inbox --input '{"team_name":"e2e-team-demo","worker":"worker-1","content":"# Inbox update\nProceed with task 2."}' --json
omq team api write-worker-identity --input '{"team_name":"e2e-team-demo","worker":"worker-9","index":9,"role":"executor"}' --json
omq team api append-event --input '{"team_name":"e2e-team-demo","type":"task_completed","worker":"worker-1","task_id":"<TASK_ID>","reason":"demo"}' --json
omq team api get-summary --input '{"team_name":"e2e-team-demo"}' --json
omq team api write-shutdown-request --input '{"team_name":"e2e-team-demo","worker":"worker-1","requested_by":"leader-fixed"}' --json
omq team api read-shutdown-ack --input '{"team_name":"e2e-team-demo","worker":"worker-1"}' --json
omq team api read-monitor-snapshot --input '{"team_name":"e2e-team-demo"}' --json
omq team api write-monitor-snapshot --input '{"team_name":"e2e-team-demo","snapshot":{"taskStatusById":{"1":"completed"},"workerAliveByName":{"worker-1":true},"workerStateByName":{"worker-1":"idle"},"workerTurnCountByName":{"worker-1":12},"workerTaskIdByName":{"worker-1":"1"},"mailboxNotifiedByMessageId":{},"completedEventTaskIds":{"1":true}}}' --json
omq team api read-task-approval --input '{"team_name":"e2e-team-demo","task_id":"<TASK_ID>"}' --json
omq team api write-task-approval --input '{"team_name":"e2e-team-demo","task_id":"<TASK_ID>","status":"approved","reviewer":"leader-fixed","decision_reason":"demo approval","required":true}' --json
omq team api cleanup --input '{"team_name":"e2e-team-demo"}' --json
```

### 7.4 Verification expectations

```bash
# Envelope checks (schema_version + operation + ok)
omq team api get-summary --input '{"team_name":"e2e-team-demo"}' --json | jq -e '.schema_version == "1.0" and .operation == "get-summary" and (.ok == true or .ok == false)'

# Team lifecycle checks
omq team status "e2e-team-demo"
omq team shutdown "e2e-team-demo"
```

Success criteria:
- All `omq team api` examples return valid JSON envelopes.
- Task lifecycle uses `create-task -> claim-task -> transition-task-status`.
- Message lifecycle uses `send-message/broadcast -> mailbox-list -> mailbox-mark-*`.
- Team lifecycle demonstrates `omq team`, `omq team status`, `omq team resume`, and `omq team shutdown`.

## Demo 8: One-Shot E2E Script (Copy/Paste)

Use the bundled helper script:

```bash
chmod +x scripts/demo-team-e2e.sh
./scripts/demo-team-e2e.sh
```

Optional overrides:

```bash
TEAM_TASK="e2e team demo" \
TEAM_NAME="e2e-team-demo" \
WORKER_COUNT=6 \
OMQ_TEAM_WORKER_LAUNCH_MODE=prompt \
./scripts/demo-team-e2e.sh
```

Equivalent manual one-shot command block:

```bash
set -euo pipefail

export TEAM_TASK="e2e team demo"
export TEAM_NAME="e2e-team-demo"
export OMQ_TEAM_WORKER_CLI=auto
export OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,qwen,claude,claude,claude
# Note: -c model_reasoning_effort is silently ignored (configure in ~/.qwen/settings.json instead)
export OMQ_TEAM_WORKER_LAUNCH_ARGS='-c model_reasoning_effort="low"'

echo "[1/8] start team (6 workers mixed qwen/claude)"
omq team 6:executor "$TEAM_TASK"

echo "[2/8] lifecycle status"
omq team status "$TEAM_NAME"

echo "[3/8] create task"
CREATE_JSON=$(omq team api create-task --input "{\"team_name\":\"$TEAM_NAME\",\"subject\":\"one-shot lifecycle\",\"description\":\"demo task\",\"owner\":\"worker-1\"}" --json)
TASK_ID=$(echo "$CREATE_JSON" | jq -r '.data.task.id')

echo "[4/8] claim task"
CLAIM_JSON=$(omq team api claim-task --input "{\"team_name\":\"$TEAM_NAME\",\"task_id\":\"$TASK_ID\",\"worker\":\"worker-1\",\"expected_version\":1}" --json)
CLAIM_TOKEN=$(echo "$CLAIM_JSON" | jq -r '.data.claimToken')

echo "[5/8] transition task -> completed"
omq team api transition-task-status --input "{\"team_name\":\"$TEAM_NAME\",\"task_id\":\"$TASK_ID\",\"from\":\"in_progress\",\"to\":\"completed\",\"claim_token\":\"$CLAIM_TOKEN\"}" --json

echo "[6/8] mailbox flow"
omq team api send-message --input "{\"team_name\":\"$TEAM_NAME\",\"from_worker\":\"leader-fixed\",\"to_worker\":\"worker-1\",\"body\":\"ACK one-shot\"}" --json
MAILBOX_JSON=$(omq team api mailbox-list --input "{\"team_name\":\"$TEAM_NAME\",\"worker\":\"worker-1\"}" --json)
MESSAGE_ID=$(echo "$MAILBOX_JSON" | jq -r '.data.messages[0].message_id // empty')
omq team api mailbox-mark-notified --input "{\"team_name\":\"$TEAM_NAME\",\"worker\":\"worker-1\",\"message_id\":\"$MESSAGE_ID\"}" --json
omq team api mailbox-mark-delivered --input "{\"team_name\":\"$TEAM_NAME\",\"worker\":\"worker-1\",\"message_id\":\"$MESSAGE_ID\"}" --json

echo "[7/8] summary envelope check"
omq team api get-summary --input "{\"team_name\":\"$TEAM_NAME\"}" --json | jq -e '.schema_version == "1.0" and .operation == "get-summary" and .ok == true'

echo "[8/8] shutdown + cleanup"
omq team shutdown "$TEAM_NAME"
omq team api cleanup --input "{\"team_name\":\"$TEAM_NAME\"}" --json

echo "E2E demo complete."
```

Expected:
- Team starts with 6 mixed workers.
- Claim-safe lifecycle succeeds end-to-end.
- Summary envelope check returns exit code 0.
- Team shuts down cleanly and state cleanup completes.

## File Inventory

| Component | Count | Location |
|-----------|-------|----------|
| Agent prompts | 30 | `~/.qwen/prompts/*.md` |
| Skills | 40 | `~/.qwen/skills/*/SKILL.md` |
| MCP servers | 4 | Configured in `~/.qwen/config.toml` |
| CLI commands | 11+ | `omq (launch), setup, doctor, team, version, tmux-hook, hud, status, cancel, reasoning, help` |
| AGENTS.md | 1 | Project root (generated) |

## Troubleshooting

**Qwen Code not found:** Install with `npm install -g @openai/qwen`

**Slash commands not appearing:** Run `omq setup --force` to reinstall prompts

**MCP servers not connecting:** Check `~/.qwen/config.toml` for `[mcp_servers.omq_state]`, `[mcp_servers.omq_memory]`, `[mcp_servers.omq_code_intel]`, and `[mcp_servers.omq_trace]` entries

**Doctor shows warnings:** Run `omq setup` to install missing components

---

## Demo 9: Autoresearch Showcase Hub

OMQ now includes a lightweight research-showcase hub for reproducible autoresearch demos under `playground/README.md`.

Quick start:

```bash
# list bundled showcase missions
./scripts/run-autoresearch-showcase.sh --list

# run one showcase
./scripts/run-autoresearch-showcase.sh bayesopt

# run several showcases back-to-back
./scripts/run-autoresearch-showcase.sh omq-self ml-tabular bayesopt
```

See `playground/README.md` for the mission index, completed-result summaries, and repository-hygiene guidance.

## Demo Script Reference

### `scripts/demo-team-e2e.sh`

The bundled E2E demo script provides a complete, automated test of the tmux claude workers demo with comprehensive coverage of all major features.

#### Script Features

| Feature | Description |
|---------|-------------|
| **Mixed CLI Workers** | Automatically distributes workers across Qwen Code and Claude CLIs |
| **Claim-Safe Lifecycle** | Demonstrates proper task claim → transition → completion flow |
| **Mailbox Communication** | Tests message sending and mailbox operations |
| **Envelope Validation** | Validates JSON response schemas from all API calls |
| **Auto-Cleanup** | Trap-based cleanup ensures resources are freed on exit |

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKER_COUNT` | `6` | Number of workers to spawn (minimum: 5) |
| `TEAM_TASK` | `e2e team demo <timestamp>` | Task description for the team |
| `TEAM_NAME` | (slugified from TEAM_TASK) | Unique team identifier |
| `OMQ_TEAM_WORKER_CLI` | `auto` | Worker CLI selection mode |
| `OMQ_TEAM_WORKER_CLI_MAP` | (auto-generated) | Comma-separated CLI assignments per worker |
| `OMQ_TEAM_WORKER_LAUNCH_ARGS` | `-c model_reasoning_effort="low"` | Arguments passed to worker CLIs (note: reasoning_effort is silently ignored; configure in ~/.qwen/settings.json instead) |

#### Demo Flow

```
[1/8] Start team → Creates tmux session with N mixed workers
[2/8] Status check → Verifies all workers are healthy
[3/8] Create task → Creates a test task in the shared queue
[4/8] Claim task → Worker-1 claims the task with version token
[5/8] Complete task → Transitions task to completed status
[6/8] Mailbox flow → Sends message and validates delivery
[7/8] Summary check → Validates JSON envelope schema
[8/8] Cleanup → Graceful shutdown and state cleanup
```

#### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed |
| `1` | Missing dependency or invalid input |
| `1` | Task lifecycle or API call failed |

#### Example: Custom Configuration

```bash
# Run with 8 workers and custom task
WORKER_COUNT=8 \
TEAM_TASK="load test $(date +%s)" \
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,qwen,qwen,claude,claude,claude,claude \
./scripts/demo-team-e2e.sh
```
