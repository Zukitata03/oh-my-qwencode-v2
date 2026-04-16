# oh-my-qwencode (OMQ)
UPDATE April 16: Alibaba nuked the free 1k requests, this only my fun personal project, but well i have fun time using Qwen. Continue using this by purchase Coding plan from Alibaba, Fireworks, ...
QWEN (3.6Plus the lastest) DOES NOT SUPPORT PROMPT/TOKEN CACHING. If you seriously code, then it not really suitable.


> A port of [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) adapted for Qwen Code.

<p align="center">
  <em>Multi-agent orchestration layer for Qwen Code — prompts, skills, safety gates, tmux team runtime, and durable state.</em>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

**Docs:** [Getting Started](./docs/getting-started.html) · [Agents](./docs/agents.html) · [Skills](./docs/skills.html) · [Hooks Architecture](./docs/hooks-architecture.md) · [Integrations](./docs/integrations.html) · [Demo](./DEMO.md) · [OpenClaw guide](./docs/openclaw-integration.md)

---

## What OMQ Is

OMQ is a **workflow layer** for [Qwen Code](https://github.com/openai/qwen). It does not replace Qwen Code — it adds a better working layer around it:

- **34 agent role prompts** — reusable roles like `$architect`, `$executor`, `$librarian`, `$debugger`
- **39 skills** — workflows like `$plan`, `$ralph`, `$team`, `$deep-interview`, `$intent-gate`, `$comment-checker`
- **5-tier hook system** — Core / Guard / Transform / Continuation / Skill hooks with 5 preset bundles (safety, review, memory, telemetry, workspace-context)
- **tmux team runtime** — durable parallel agent execution with worktrees, git integration, and interop
- **5 MCP servers** — state, memory, code-intel, trace, and team servers for structured tool access
- **5 Rust crates** — performance-critical components (explore harness, mux, runtime core, runtime, sparkshell)
- **Durable state** — plans, logs, memory, mode tracking, and session recovery under `.omq/`

If you want plain Qwen Code with no extra workflow layer, you probably do not need OMQ.

---

## Quick Start

### Requirements

- Node.js 20+
- Qwen Code installed: `npm install -g @openai/qwen`
- Qwen Code auth configured
- `tmux` on macOS/Linux (for team runtime)
- `psmux` on native Windows (for Windows team mode)

### Install and Run

```bash
# Clone the repository
git clone https://github.com/Zukitata03/oh-my-qwencode-v2.git
cd oh-my-qwencode-v2

# Install dependencies and build
npm install
npm run build

# Link the CLI globally
npm link

# Run setup to install prompts, skills, config, and AGENTS scaffolding
omq setup
```

Then launch:

```bash
omq --madmax
```

Then work inside Qwen Code:

```text
$architect "analyze the authentication flow"
$plan "map the safest implementation path"
```

If the task grows, the agent escalates to `$ralph` for persistent execution or `$team` for coordinated parallel work.

---

## What You Get

### Agent Roles (34 prompts)

| Tier | Roles |
|------|-------|
| **Build** | `explore`, `architect`, `executor`, `debugger`, `planner`, `verifier` |
| **Review** | `code-reviewer`, `security-reviewer` |
| **Domain** | `test-engineer`, `dependency-expert`, `designer`, `writer`, `librarian`, `git-master`, `build-fixer` |
| **Coordination** | `critic`, `vision` |

### Skills (39 installed)

**Core workflows:** `autopilot`, `ralph`, `ultrawork`, `team`, `swarm`, `ultraqa`, `plan`, `deep-interview`, `ralplan`

**Safety & quality:** `intent-gate` (pre-execution intent analysis), `comment-checker` (senior-engine comment standards), `code-review`, `security-review`, `ai-slop-cleaner`

**Shortcuts & utilities:** `analyze`, `deepsearch`, `tdd`, `build-fix`, `cancel`, `note`, `trace`, `init-deep` (hierarchical AGENTS.md generation), `web-clone`, `visual-verdict`, `ecomode`

**Ask & docs:** `ask-claude`, `ask-gemini`, `doctor`, `help`, `skill`, `hud`, `omq-setup`, `configure-notifications`

### Hook Presets (5 bundles)

| Preset | What It Does |
|--------|-------------|
| `safety` | Intent gate, comment checker, destructive op guards, pre/post write checks |
| `review` | Pre-review gates, test verification, API change guard |
| `memory` | Context injector, project memory, skill reminder |
| `telemetry` | Keyword detector, context monitor, state persistence, recovery |
| `workspace-context` | AGENTS.md + rules injection into every session |

### MCP Servers (5 implemented)

| Server | Purpose |
|--------|---------|
| `omq_state` | Read/write/clear/list workflow mode state |
| `omq_memory` | Project memory + session notepad |
| `omq_code_intel` | LSP-like diagnostics, symbol search, AST pattern matching |
| `omq_trace` | Agent flow timeline + aggregate stats |
| `omq_team_run` | Spawn/manage tmux CLI worker teams |

### CLI Surface (24 commands)

`omq setup` · `omq doctor` · `omq team` · `omq ralph` · `omq explore` · `omq sparkshell` · `omq hud` · `omq autoresearch` · `omq agents` · `omq agents-init` · `omq deepinit` · `omq session` · `omq resume` · `omq status` · `omq cancel` · `omq reasoning` · `omq cleanup` · `omq ask` · `omq version` · `omq hooks` · `omq tmux-hook` · `omq uninstall` · `omq exec` · `omq help`

---

## A Simple Mental Model

| Layer | What It Does |
|-------|-------------|
| **Qwen Code** | Does the actual agent work |
| **OMQ role keywords** | Make useful roles reusable (`$architect`, `$executor`, `$librarian`) |
| **OMQ skills** | Make common workflows reusable (`$plan`, `$ralph`, `$team`) |
| **OMQ hooks** | Intercept execution for safety, quality, and continuity |
| **`.omq/`** | Stores plans, logs, memory, hooks state, and runtime state |

Most users should think of OMQ as **better task routing + better workflow + better runtime**, not as a command surface to operate manually all day.

---

## Start Here If You Are New

1. Run `omq setup`
2. Launch with `omq --madmax`
3. Ask for analysis with `$architect "..."`
4. Ask for planning with `$plan "..."`
5. Let the agent decide when `$ralph`, `$team`, or another workflow is worth using

Use `$deep-interview` when the request is vague, boundaries are unclear, or you want structured Socratic clarification before committing to `$plan`, `$ralph`, or `$team`.

Use `$intent-gate` before high-risk operations — it classifies intent, scopes blast radius, assesses risk, and blocks destructive operations without explicit confirmation.

---

## Advanced / Operator Surfaces

### Team Runtime

```bash
omq team 3:executor "fix the failing tests with verification"
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

`omq team` needs a tmux-compatible backend:

| Platform | Install |
| --- | --- |
| macOS | `brew install tmux` |
| Ubuntu/Debian | `sudo apt install tmux` |
| Fedora | `sudo dnf install tmux` |
| Arch | `sudo pacman -S tmux` |
| Windows | `winget install psmux` |
| Windows (WSL2) | `sudo apt install tmux` |

### Setup, Doctor, and HUD

- `omq setup` installs prompts, skills, config, AGENTS scaffolding, and MCP servers
- `omq doctor` verifies install health (12 checks)
- `omq hud --watch` is a monitoring/status surface

### Explore and Sparkshell

```bash
omq explore --prompt "find where team state is written"
omq sparkshell git status
omq sparkshell --tmux-pane %12 --tail-lines 400
```

- `omq explore` — default read-only repository lookup (may adaptively use sparkshell backend)
- `omq sparkshell` — shell-native inspection and bounded verification

---

## Known Issues

### Intel Mac: high `syspolicyd` / `trustd` CPU during startup

On some Intel Macs, OMQ startup — especially with `--madmax` — can spike `syspolicyd` / `trustd` CPU usage while macOS Gatekeeper validates many concurrent process launches.

If this happens, try:
- `xattr -dr com.apple.quarantine $(which omq)`
- adding your terminal app to the Developer Tools allowlist in macOS Security settings
- using lower concurrency (for example, avoid `--madmax`)

---

## Project Stats

| Metric | Count |
|--------|-------|
| TypeScript source files | 200 |
| TypeScript source lines | 115,000+ |
| Test files | 204 |
| Agent role prompts | 34 |
| Skills | 39 |
| Hook presets | 5 |
| MCP servers | 5 |
| Rust crates | 5 |
| CLI commands | 24 |
| Documentation languages | 12 |

---

## Documentation

- [Getting Started](./docs/getting-started.html)
- [Hooks Architecture](./docs/hooks-architecture.md) — 5-tier hook model, plugin system, presets
- [Edit Tags](./docs/edit-tags.md) — OmQ Edit Tags for change traceability
- [MCP Lifecycle](./docs/mcp-lifecycle.md) — on-demand MCP server management
- [Demo Guide](./DEMO.md)
- [Agent Catalog](./docs/agents.html)
- [Skills Reference](./docs/skills.html)
- [Integrations](./docs/integrations.html)
- [OpenClaw / Notification Gateway Guide](./docs/openclaw-integration.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## Languages

- [English](./README.md)
- [한국어](./README.ko.md)
- [日本語](./README.ja.md)
- [简体中文](./README.zh.md)
- [繁體中文](./README.zh-TW.md)
- [Tiếng Việt](./README.vi.md)
- [Español](./README.es.md)
- [Português](./README.pt.md)
- [Русский](./README.ru.md)
- [Türkçe](./README.tr.md)
- [Deutsch](./README.de.md)
- [Français](./README.fr.md)
- [Italiano](./README.it.md)

---

## Contributors

Thank you to everyone who has contributed to oh-my-qwencode.

---

## License

MIT
