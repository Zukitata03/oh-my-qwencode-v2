# oh-my-qwencode (OMQ)

> **注：** 本项目是 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) 移植到 Qwen Code 的版本。

<p align="center">
  
  <br>
  <em>你的 qwen 并不孤单。</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[OpenClaw 集成指南](./docs/openclaw-integration.zh.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

[Qwen Code](https://github.com/openai/qwen) 的多智能体编排层。

## v0.9.0 新特性 — Spark Initiative

Spark Initiative 是一次强化 OMQ 原生探索与检查路径的版本发布。

- **`omq explore` 原生 harness** —— 通过 Rust 原生 harness 更快、更严格地执行只读仓库探索。
- **`omq sparkshell`** —— 面向操作者的原生检查界面，支持长输出摘要与 tmux pane 捕获。
- **跨平台原生发布资产** —— `omq-explore-harness`、`omq-sparkshell` 与 `native-release-manifest.json` 的 hydration 路径现已纳入发布流水线。
- **增强的 CI/CD** —— 为 `build` job 增加显式 Rust toolchain 设置，并加入 `cargo fmt --check` 与 `cargo clippy -- -D warnings`。

详情请参阅 [v0.9.0 发布说明](./docs/release-notes-0.9.0.md) 和 [发布正文](./docs/release-body-0.9.0.md)。

## 首次会话

在 Qwen Code 内部：

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

从终端：

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## 核心模型

OMQ 安装并连接以下层：

```text
User
  -> Qwen Code
    -> AGENTS.md (编排大脑)
    -> ~/.qwen/prompts/*.md (代理 prompt 目录)
    -> ~/.qwen/skills/*/SKILL.md (skill 目录)
    -> ~/.qwen/config.toml (功能、通知、MCP)
    -> .omq/ (运行时状态、记忆、计划、日志)
```

## 主要命令

```bash
omq                # 启动 Qwen Code（在 tmux 中附带 HUD）
omq setup          # 按作用域安装 prompt/skill/config + 项目 .omq + 作用域专属 AGENTS.md
omq doctor         # 安装/运行时诊断
omq doctor --team  # Team/swarm 诊断
omq team ...       # 启动/状态/恢复/关闭 tmux 团队 worker
omq status         # 显示活动模式
omq cancel         # 取消活动执行模式
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test（插件扩展工作流）
omq hud ...        # --watch|--json|--preset
omq help
```

## Hooks 扩展（附加表面）

OMQ 现在包含用于插件脚手架和验证的 `omq hooks`。

- `omq tmux-hook` 继续支持且未更改。
- `omq hooks` 是附加的，不会替代 tmux-hook 工作流。
- 插件文件位于 `.omq/hooks/*.mjs`。
- 插件默认关闭；使用 `OMQ_HOOK_PLUGINS=1` 启用。

完整的扩展工作流和事件模型请参阅 `docs/hooks-extension.md`。

## 启动标志

```bash
--yolo
--high        # 保留以向后兼容，需在 settings.json 中配置 model_reasoning_effort
--xhigh       # 保留以向后兼容，需在 settings.json 中配置 model_reasoning_effort
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # 仅用于 setup
```

`--madmax` 映射到 Qwen Code `--approval-mode yolo`。
仅在可信环境中使用。

**注意**：`--high` 和 `--xhigh` 标志保留以向后兼容，但 Qwen Code 0.14.0+ 不再支持通过 CLI 配置 reasoning_effort。
如需配置推理能力，请在 `~/.qwen/settings.json` 中设置 `model_reasoning_effort`。

### MCP workingDirectory 策略（可选加固）

默认情况下，MCP state/memory/trace 工具接受调用方提供的 `workingDirectory`。
要限制此行为，请设置允许的根目录列表：

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

设置后，超出这些根目录的 `workingDirectory` 值将被拒绝。

## Qwen Code-First Prompt 控制

默认情况下，OMQ 注入：

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

这会将 `QWEN_HOME` 中的 `AGENTS.md` 与项目 `AGENTS.md`（如果存在）合并，然后再附加运行时 overlay。
扩展 Qwen Code 行为，但不会替换/绕过 Qwen Code 核心系统策略。

控制：

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # 禁用 AGENTS.md 注入
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## 团队模式

对于受益于并行 worker 的大规模工作，使用团队模式。

生命周期：

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

操作命令：

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

重要规则：除非中止，否则不要在任务仍处于 `in_progress` 状态时关闭。

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

团队 worker 的 Worker CLI 选择：

```bash
OMQ_TEAM_WORKER_CLI=auto    # 默认；当 worker --model 包含 "claude" 时使用 claude
OMQ_TEAM_WORKER_CLI=qwen   # 强制 Qwen Code worker
OMQ_TEAM_WORKER_CLI=claude  # 强制 Claude CLI worker
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # 每个 worker 的 CLI 混合（长度=1 或 worker 数量）
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # 可选：禁用自适应 queue->resend 回退
```

注意：
- Worker 启动参数仍通过 `OMQ_TEAM_WORKER_LAUNCH_ARGS` 共享。
- `OMQ_TEAM_WORKER_CLI_MAP` 覆盖 `OMQ_TEAM_WORKER_CLI` 以实现每个 worker 的选择。
- 触发器提交默认使用自适应重试（queue/submit，需要时使用安全的 clear-line+resend 回退）。
- 在 Claude worker 模式下，OMQ 以普通 `claude` 启动 worker（无额外启动参数），并忽略显式的 `--model` / `--config` / `--effort` 覆盖，使 Claude 使用默认 `settings.json`。

## `omq setup` 写入的内容

- `.omq/setup-scope.json`（持久化的设置作用域）
- 依赖作用域的安装：
  - `user`：`~/.qwen/prompts/`、`~/.qwen/skills/`、`~/.qwen/config.toml`、`~/.omq/agents/`、`~/.qwen/AGENTS.md`
  - `project`：`./.qwen/prompts/`、`./.qwen/skills/`、`./.qwen/config.toml`、`./.omq/agents/`、`./AGENTS.md`
- 启动行为：如果持久化的作用域是 `project`，`omq` 启动时自动使用 `QWEN_HOME=./.qwen`（除非 `QWEN_HOME` 已设置）。
- 启动指令会合并 `~/.qwen/AGENTS.md`（或被覆盖的 `QWEN_HOME/AGENTS.md`）与项目 `./AGENTS.md`，然后附加运行时 overlay。
- 现有 `AGENTS.md` 文件绝不会被静默覆盖：交互式 TTY 下 setup 会先询问是否替换；非交互模式下除非传入 `--force`，否则会跳过替换（活动会话安全检查仍然适用）。
- `config.toml` 更新（两种作用域均适用）：
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP 服务器条目（`omq_state`、`omq_memory`、`omq_code_intel`、`omq_trace`）
  - `[tui] status_line`
- 作用域专属 `AGENTS.md`
- `.omq/` 运行时目录和 HUD 配置

## 代理和技能

- Prompt：`prompts/*.md`（`user` 安装到 `~/.qwen/prompts/`，`project` 安装到 `./.qwen/prompts/`）
- Skill：`skills/*/SKILL.md`（`user` 安装到 `~/.qwen/skills/`，`project` 安装到 `./.qwen/skills/`）

示例：
- 代理：`architect`、`planner`、`executor`、`debugger`、`verifier`、`security-reviewer`
- 技能：`autopilot`、`plan`、`team`、`ralph`、`ultrawork`、`cancel`

## 项目结构

```text
oh-my-qwencode/
  bin/omq.js
  src/
    cli/
    team/
    mcp/
    hooks/
    hud/
    config/
    modes/
    notifications/
    verification/
  prompts/
  skills/
  templates/
  scripts/
```

## 开发

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## 文档

- **[完整文档](./docs/getting-started.html)** — 完整指南
- **[CLI 参考](./docs/getting-started.html#cli-reference)** — 所有 `omq` 命令、标志和工具
- **[通知指南](./docs/getting-started.html#notifications)** — Discord、Telegram、Slack 和 webhook 设置
- **[推荐工作流](./docs/getting-started.html#workflows)** — 用于常见任务的经过实战检验的 skill 链
- **[发行说明](./docs/getting-started.html#release-notes)** — 每个版本的新功能

## 备注

- 完整变更日志：`CHANGELOG.md`
- 迁移指南（v0.4.4 后的 mainline）：`docs/migration-mainline-post-v0.4.4.md`
- 覆盖率和对等说明：`COVERAGE.md`
- Hook 扩展工作流：`docs/hooks-extension.md`
- 设置和贡献详情：`CONTRIBUTING.md`

## 致谢

受 [oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode) 启发，为 Qwen Code 适配。

## 许可证

MIT
