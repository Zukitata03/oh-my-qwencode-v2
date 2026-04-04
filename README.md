# oh-my-qwencode (OMQ)

> **Note:** This project is a port of [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) adapted for Qwen Code.

<p align="center">
  <em>Start Qwen Code stronger, then let OMQ add better prompts, workflows, and runtime help when the work grows.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

**Website:** https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_
**Docs:** [Getting Started](./docs/getting-started.html) · [Agents](./docs/agents.html) · [Skills](./docs/skills.html) · [Integrations](./docs/integrations.html) · [Demo](./DEMO.md) · [OpenClaw guide](./docs/openclaw-integration.md)

OMQ is a workflow layer for [Qwen Code](https://github.com/openai/qwen).

It keeps Qwen Code as the execution engine and makes it easier to:
- start a stronger Qwen Code session by default
- reuse good role/task invocations with `$name` keywords
- invoke workflows with skills like `$plan`, `$ralph`, and `$team`
- keep project guidance, plans, logs, and state in `.omq/`

## Recommended default flow

If you want the default OMQ experience, start here:

```bash
npm install -g @openai/qwen oh-my-qwencode
omq setup
omq --madmax --high
```

Then work normally inside Qwen Code:

```text
$architect "analyze the authentication flow"
$plan "ship this feature cleanly"
```

That is the main path.
Start OMQ strongly, do the work in Qwen Code, and let the agent pull in `$team` or other workflows only when the task actually needs them.

## What OMQ is for

Use OMQ if you already like Qwen Code and want a better day-to-day runtime around it:
- reusable role/task invocations such as `$architect` and `$executor`
- reusable workflows such as `$plan`, `$ralph`, `$team`, and `$deep-interview`
- project guidance through scoped `AGENTS.md`
- durable state under `.omq/` for plans, logs, memory, and mode tracking

If you want plain Qwen Code with no extra workflow layer, you probably do not need OMQ.

## Quick start

### Requirements

- Node.js 20+
- Qwen Code installed: `npm install -g @openai/qwen`
- Qwen Code auth configured
- `tmux` on macOS/Linux if you later want the durable team runtime
- `psmux` on native Windows if you later want Windows team mode

### A good first session

Launch OMQ the recommended way:

```bash
omq --madmax
# Note: For reasoning effort, configure model_reasoning_effort in ~/.qwen/settings.json
# The --high/--xhigh flags are retained for backward compatibility but have no effect
```

Then try one role keyword and one workflow skill:

```text
$architect "analyze the authentication flow"
$plan "map the safest implementation path"
```

If the task grows, the agent can escalate to heavier workflows such as `$ralph` for persistent execution or `$team` for coordinated parallel work.

## A simple mental model

OMQ does **not** replace Qwen Code.

It adds a better working layer around it:
- **Qwen Code** does the actual agent work
- **OMQ role keywords** make useful roles reusable
- **OMQ skills** make common workflows reusable
- **`.omq/`** stores plans, logs, memory, and runtime state

Most users should think of OMQ as **better task routing + better workflow + better runtime**, not as a command surface to operate manually all day.

## Start here if you are new

1. Run `omq setup`
2. Launch with `omq --madmax`
3. Ask for analysis with `$architect "..."`
4. Ask for planning with `$plan "..."`
5. Let the agent decide when `$ralph`, `$team`, or another workflow is worth using

## Common in-session surfaces

| Surface | Use it for |
| --- | --- |
| `$architect "..."` | analysis, boundaries, tradeoffs |
| `$executor "..."` | focused implementation work |
| `/skills` | browsing installed skills |
| `$plan "..."` | planning before implementation |
| `$ralph "..."` | persistent sequential execution |
| `$team "..."` | coordinated parallel execution when the task is big enough |

Use `$deep-interview` when the request is still vague, the boundaries are unclear, or you want OMQ to keep pressing on intent, non-goals, and decision boundaries before it hands work off to `$plan`, `$ralph`, `$team`, or `$autopilot`.

Typical cases:
- vague greenfield ideas that still need sharper intent and scope
- brownfield changes where OMQ should inspect the repo first, then ask cited confirmation questions
- requests where you want a one-question-at-a-time clarification loop instead of immediate planning or implementation
## Advanced / operator surfaces

These are useful, but they are not the main onboarding path.

### Team runtime

Use the team runtime when you specifically need durable tmux/worktree coordination, not as the default way to begin using OMQ.

```bash
omq team 3:executor "fix the failing tests with verification"
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

### Setup, doctor, and HUD

These are operator/support surfaces:
- `omq setup` installs prompts, skills, config, and AGENTS scaffolding
- `omq doctor` verifies the install when something seems wrong
- `omq hud --watch` is a monitoring/status surface, not the primary user workflow

### Explore and sparkshell

- `omq explore --prompt "..."` is for read-only repository lookup
- `omq sparkshell <command>` is for shell-native inspection and bounded verification

Examples:

```bash
omq explore --prompt "find where team state is written"
omq sparkshell git status
omq sparkshell --tmux-pane %12 --tail-lines 400
```

### Platform notes for team mode

`omq team` needs a tmux-compatible backend:

| Platform | Install |
| --- | --- |
| macOS | `brew install tmux` |
| Ubuntu/Debian | `sudo apt install tmux` |
| Fedora | `sudo dnf install tmux` |
| Arch | `sudo pacman -S tmux` |
| Windows | `winget install psmux` |
| Windows (WSL2) | `sudo apt install tmux` |

## Known issues

### Intel Mac: high `syspolicyd` / `trustd` CPU during startup

On some Intel Macs, OMQ startup — especially with `--madmax` — can spike `syspolicyd` / `trustd` CPU usage while macOS Gatekeeper validates many concurrent process launches.

If this happens, try:
- `xattr -dr com.apple.quarantine $(which omq)`
- adding your terminal app to the Developer Tools allowlist in macOS Security settings
- using lower concurrency (for example, avoid `--madmax`)

## Documentation

- [Getting Started](./docs/getting-started.html)
- [Demo guide](./DEMO.md)
- [Agent catalog](./docs/agents.html)
- [Skills reference](./docs/skills.html)
- [Integrations](./docs/integrations.html)
- [OpenClaw / notification gateway guide](./docs/openclaw-integration.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

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

## Contributors

Thank you to everyone who has contributed to oh-my-qwencode.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=chrisxue90/oh-my-qwencode&type=date&legend=top-left)](https://www.star-history.com/#chrisxue90/oh-my-qwencode&type=date&legend=top-left)

## License

MIT
