# oh-my-qwencode (OMQ)

<p align="center">
  <img src="https://yeachan-heo.github.io/oh-my-qwencode-website/omq-character-nobg.png" alt="oh-my-qwencode character" width="280">
  <br>
  <em>你的 Qwen Code，從不孤行。</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[官方網站](https://yeachan-heo.github.io/oh-my-qwencode-website/)** | **[說明文件](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** | **[CLI 參考手冊](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** | **[工作流程](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** | **[OpenClaw 整合指南](./docs/openclaw-integration.zh-TW.md)** | **[GitHub](https://github.com/Yeachan-Heo/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

[Qwen Code](https://github.com/openai/qwen) 的多智能體編排層。

## v0.9.0 新功能 — Spark Initiative

Spark Initiative 是一個強化 OMQ 原生探索與檢查路徑的版本發布。

- **`omq explore` 原生 harness** —— 以 Rust 原生 harness 更快且更嚴格地執行唯讀儲存庫探索。
- **`omq sparkshell`** —— 面向操作員的原生檢查介面，支援長輸出摘要與 tmux pane 擷取。
- **跨平台原生釋出資產** —— `omq-explore-harness`、`omq-sparkshell` 與 `native-release-manifest.json` 的 hydration 路徑已納入釋出流程。
- **強化的 CI/CD** —— 在 `build` job 中加入明確的 Rust toolchain 設定，並新增 `cargo fmt --check` 與 `cargo clippy -- -D warnings`。

詳細內容請參閱 [v0.9.0 版本說明](./docs/release-notes-0.9.0.md) 與 [釋出正文](./docs/release-body-0.9.0.md)。

## 首次會話

在 Qwen Code 內部：

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

從終端機：

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## 核心模型

OMQ 安裝並串接以下各層：

```text
使用者
  -> Qwen Code
    -> AGENTS.md（編排大腦）
    -> ~/.qwen/prompts/*.md（代理提示詞目錄）
    -> ~/.qwen/skills/*/SKILL.md（技能目錄）
    -> ~/.qwen/config.toml（功能、通知、MCP）
    -> .omq/（執行期狀態、記憶、計畫、日誌）
```

## 主要指令

```bash
omq                  # 啟動 Qwen Code（可用時在 tmux 中附帶 HUD）
omq setup            # 依範圍安裝提示詞/技能/設定 + 專案 .omq + 範圍專屬 AGENTS.md
omq doctor           # 安裝/執行期診斷
omq doctor --team    # 團隊/群集診斷
omq ask ...          # 詢問本地供應商顧問（claude|gemini），結果寫入 .omq/artifacts/*
omq team ...         # 啟動/狀態/恢復/關閉團隊工作進程（預設為互動式 tmux）
omq status           # 顯示目前活動模式
omq cancel           # 取消活動中的執行模式
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...    # init|status|validate|test
omq hooks ...        # init|status|validate|test（插件擴充工作流程）
omq hud ...          # --watch|--json|--preset
omq help
```

Ask 指令範例：

```bash
omq ask claude "review this diff"
omq ask gemini "brainstorm alternatives"
omq ask claude --agent-prompt executor "implement feature X with tests"
omq ask gemini --agent-prompt=planner --prompt "draft a rollout plan"
# 底層供應商 CLI 說明中的旗標：
# claude -p|--print "<prompt>"
# gemini -p|--prompt "<prompt>"
```

非 tmux 團隊啟動（進階）：

```bash
OMQ_TEAM_WORKER_LAUNCH_MODE=prompt omq team 2:executor "task"
```

## Hooks 擴充（附加介面）

OMQ 現已包含 `omq hooks`，用於插件鷹架建立與驗證。

- `omq tmux-hook` 持續受支援，行為不變。
- `omq hooks` 屬於附加功能，不會取代 tmux-hook 工作流程。
- 插件檔案位於 `.omq/hooks/*.mjs`。
- 插件預設關閉；使用 `OMQ_HOOK_PLUGINS=1` 啟用。

完整的擴充工作流程與事件模型，請參閱 `docs/hooks-extension.md`。

## 啟動旗標

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # 僅用於 setup
```

`--madmax` 對應 Qwen Code 的 `--dangerously-bypass-approvals-and-sandbox`。
僅在信任環境或外部沙箱環境中使用。

### MCP workingDirectory 策略（選用強化）

預設情況下，MCP 狀態/記憶/追蹤工具接受呼叫方提供的 `workingDirectory`。
若要限制此行為，請設定允許的根目錄清單：

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

設定後，超出這些根目錄的 `workingDirectory` 值將被拒絕。

## Qwen Code 優先的提示詞控制

預設情況下，OMQ 注入：

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

這會將 `QWEN_HOME` 中的 `AGENTS.md` 與專案的 `AGENTS.md`（若存在）合併，然後再附加執行期 overlay。
此舉擴充了 Qwen Code 的行為，但不會取代或繞過 Qwen Code 核心系統策略。

控制方式：

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # 停用 AGENTS.md 注入
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## 團隊模式

對於能從平行工作進程獲益的大規模工作，請使用團隊模式。

生命週期：

```text
啟動 -> 分配有界通道 -> 監控 -> 驗證終端任務 -> 關閉
```

作業指令：

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

重要規則：除非要中止，否則請勿在任務仍處於 `in_progress` 狀態時關閉。

### Ralph 清理策略

當團隊以 ralph 模式執行（`omq team ralph ...`）時，關閉清理
會套用與一般路徑不同的專屬策略：

| 行為 | 一般團隊 | Ralph 團隊 |
|---|---|---|
| 失敗時強制關閉 | 拋出 `shutdown_gate_blocked` | 略過閘門，記錄 `ralph_cleanup_policy` 事件 |
| 自動刪除分支 | 復原時刪除 worktree 分支 | 保留分支（`skipBranchDeletion`） |
| 完成日誌 | 標準 `shutdown_gate` 事件 | 附帶任務分解的 `ralph_cleanup_summary` 事件 |

Ralph 策略會從團隊模式狀態（`linked_ralph`）自動偵測，
也可透過 `omq team shutdown <name> --ralph` 明確傳遞。

團隊工作進程的 Worker CLI 選擇：

```bash
OMQ_TEAM_WORKER_CLI=auto    # 預設；當 worker --model 包含 "claude" 時使用 claude
OMQ_TEAM_WORKER_CLI=qwen   # 強制使用 Qwen Code 工作進程
OMQ_TEAM_WORKER_CLI=claude  # 強制使用 Claude CLI 工作進程
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # 每個工作進程的 CLI 混合（長度為 1 或等於工作進程數量）
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # 選用：停用自適應 queue->resend 回退機制
```

注意事項：
- 工作進程啟動參數仍透過 `OMQ_TEAM_WORKER_LAUNCH_ARGS` 共享。
- `OMQ_TEAM_WORKER_CLI_MAP` 會覆寫 `OMQ_TEAM_WORKER_CLI`，以實現每個工作進程的個別選擇。
- 觸發提交預設使用自適應重試（queue/submit，必要時採用安全的清除行 + 重傳回退）。
- 在 Claude 工作進程模式下，OMQ 以純 `claude` 啟動工作進程（無額外啟動參數），並忽略明確的 `--model` / `--config` / `--effort` 覆寫，讓 Claude 使用預設的 `settings.json`。

## `omq setup` 寫入的內容

- `.omq/setup-scope.json`（持久化的設定範圍）
- 依範圍的安裝內容：
  - `user`：`~/.qwen/prompts/`、`~/.qwen/skills/`、`~/.qwen/config.toml`、`~/.omq/agents/`、`~/.qwen/AGENTS.md`
  - `project`：`./.qwen/prompts/`、`./.qwen/skills/`、`./.qwen/config.toml`、`./.omq/agents/`、`./AGENTS.md`
- 啟動行為：若持久化範圍為 `project`，`omq` 啟動時自動使用 `QWEN_HOME=./.qwen`（除非已設定 `QWEN_HOME`）。
- 啟動指令會合併 `~/.qwen/AGENTS.md`（或覆寫後的 `QWEN_HOME/AGENTS.md`）與專案 `./AGENTS.md`，然後再附加執行期 overlay。
- 現有的 `AGENTS.md` 檔案絕不會被靜默覆寫：互動式 TTY 執行時 setup 會先詢問；非互動執行時若沒有 `--force` 就會跳過替換（仍適用活動會話安全檢查）。
- `config.toml` 更新（兩種範圍均適用）：
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP 伺服器項目（`omq_state`、`omq_memory`、`omq_code_intel`、`omq_trace`）
  - `[tui] status_line`
- 範圍專屬 `AGENTS.md`
- `.omq/` 執行期目錄與 HUD 設定

## 代理與技能

- 提示詞：`prompts/*.md`（`user` 安裝至 `~/.qwen/prompts/`，`project` 安裝至 `./.qwen/prompts/`）
- 技能：`skills/*/SKILL.md`（`user` 安裝至 `~/.qwen/skills/`，`project` 安裝至 `./.qwen/skills/`）

範例：
- 代理：`architect`、`planner`、`executor`、`debugger`、`verifier`、`security-reviewer`
- 技能：`autopilot`、`plan`、`team`、`ralph`、`ultrawork`、`cancel`

### 視覺品管迴圈（`$visual-verdict`）

當任務需要視覺保真度驗證（參考圖片 + 生成截圖）時，請使用 `$visual-verdict`。

- 回傳結構化 JSON：`score`、`verdict`、`category_match`、`differences[]`、`suggestions[]`、`reasoning`
- 建議通過門檻：**90 分以上**
- 對於視覺任務，在每次下一輪編輯前先執行 `$visual-verdict`
- 使用像素差異 / pixelmatch 疊加圖作為**輔助除錯工具**（而非主要通過/失敗判斷依據）

## 專案結構

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

## 開發

```bash
git clone https://github.com/Yeachan-Heo/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run lint
npm run build
npm test
```

## 說明文件

- **[完整說明文件](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** — 完整指南
- **[CLI 參考手冊](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** — 所有 `omq` 指令、旗標與工具
- **[通知設定指南](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#notifications)** — Discord、Telegram、Slack 及 Webhook 設定
- **[推薦工作流程](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** — 實戰驗證的技能鏈，適用常見任務
- **[版本發行說明](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#release-notes)** — 每個版本的新功能

## 附註

- 完整變更日誌：`CHANGELOG.md`
- 遷移指南（v0.4.4 後的主線版本）：`docs/migration-mainline-post-v0.4.4.md`
- 覆蓋率與同等性說明：`COVERAGE.md`
- Hook 擴充工作流程：`docs/hooks-extension.md`
- 設定與貢獻詳情：`CONTRIBUTING.md`

## 致謝

靈感來自 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)，為 Qwen Code 量身改編。

## 授權條款

MIT
