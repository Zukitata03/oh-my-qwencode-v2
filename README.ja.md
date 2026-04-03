# oh-my-qwencode (OMQ)

<p align="center">
  
  <br>
  <em>あなたのqwenは一人じゃない。</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[OpenClaw 統合ガイド](./docs/openclaw-integration.ja.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

[Qwen Code](https://github.com/openai/qwen)のためのマルチエージェントオーケストレーションレイヤー。

## v0.9.0 の新機能 — Spark Initiative

Spark Initiative は、OMQ のネイティブ探索・検査経路を強化するリリースです。

- **`omq explore` ネイティブハーネス** — 読み取り専用のリポジトリ探索を Rust ベースのハーネスで高速かつ厳格に実行します。
- **`omq sparkshell`** — 長い出力の要約と tmux pane キャプチャを行う、オペレーター向けのネイティブ検査サーフェスです。
- **クロスプラットフォームのネイティブリリース資産** — `omq-explore-harness`、`omq-sparkshell`、`native-release-manifest.json` を中心とした hydration 経路がリリースパイプラインに組み込まれました。
- **強化された CI/CD** — `build` ジョブでの明示的な Rust toolchain セットアップ、`cargo fmt --check`、`cargo clippy -- -D warnings` を追加しました。

詳細は [v0.9.0 リリースノート](./docs/release-notes-0.9.0.md) と [リリース本文](./docs/release-body-0.9.0.md) を参照してください。

## 最初のセッション

Qwen Code内部で：

```text
$architect "analyze current auth boundaries"
$executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

ターミナルから：

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## コアモデル

OMQは以下のレイヤーをインストールして接続します：

```text
User
  -> Qwen Code
    -> AGENTS.md (オーケストレーションブレイン)
    -> ~/.qwen/prompts/*.md (エージェントプロンプトカタログ)
    -> ~/.qwen/skills/*/SKILL.md (スキルカタログ)
    -> ~/.qwen/config.toml (機能、通知、MCP)
    -> .omq/ (ランタイム状態、メモリ、計画、ログ)
```

## 主要コマンド

```bash
omq                # Qwen Codeを起動（tmuxでHUD付き）
omq setup          # スコープ別にプロンプト/スキル/設定をインストール + プロジェクト .omq + スコープ別 AGENTS.md
omq doctor         # インストール/ランタイム診断
omq doctor --team  # Team/swarm診断
omq team ...       # tmuxチームワーカーの開始/ステータス/再開/シャットダウン
omq status         # アクティブなモードを表示
omq cancel         # アクティブな実行モードをキャンセル
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test（プラグイン拡張ワークフロー）
omq hud ...        # --watch|--json|--preset
omq help
```

## Hooks拡張（追加サーフェス）

OMQにはプラグインのスキャフォールディングとバリデーション用の`omq hooks`が含まれるようになりました。

- `omq tmux-hook`は引き続きサポートされ、変更されていません。
- `omq hooks`は追加的であり、tmux-hookワークフローを置き換えません。
- プラグインファイルは`.omq/hooks/*.mjs`に配置されます。
- プラグインはデフォルトで無効です；`OMQ_HOOK_PLUGINS=1`で有効にします。

完全な拡張ワークフローとイベントモデルについては`docs/hooks-extension.md`を参照してください。

## 起動フラグ

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # setupのみ
```

`--madmax`はQwen Codeの`--dangerously-bypass-approvals-and-sandbox`にマッピングされます。
信頼された/外部のサンドボックス環境でのみ使用してください。

### MCP workingDirectoryポリシー（オプションの強化）

デフォルトでは、MCP state/memory/traceツールは呼び出し元が提供する`workingDirectory`を受け入れます。
これを制限するには、許可されたルートのリストを設定します：

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

設定すると、これらのルート外の`workingDirectory`値は拒否されます。

## Qwen Code-Firstプロンプト制御

デフォルトでは、OMQは以下を注入します：

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

これは`QWEN_HOME`の`AGENTS.md`とプロジェクトの`AGENTS.md`（存在する場合）を結合し、その上にランタイムオーバーレイを追加します。
Qwen Codeの動作を拡張しますが、Qwen Codeのコアシステムポリシーを置き換えたりバイパスしたりしません。

制御：

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # AGENTS.md注入を無効化
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## チームモード

並列ワーカーが有利な大規模作業にはチームモードを使用します。

ライフサイクル：

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

運用コマンド：

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

重要なルール：中断する場合を除き、タスクが`in_progress`状態の間はシャットダウンしないでください。

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

チームワーカー用のWorker CLI選択：

```bash
OMQ_TEAM_WORKER_CLI=auto    # デフォルト；worker --modelに"claude"が含まれる場合claudeを使用
OMQ_TEAM_WORKER_CLI=qwen   # Qwen Codeワーカーを強制
OMQ_TEAM_WORKER_CLI=claude  # Claude CLIワーカーを強制
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # ワーカーごとのCLIミックス（長さ=1またはワーカー数）
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # オプション：適応型queue->resendフォールバックを無効化
```

注意：
- ワーカー起動引数は引き続き`OMQ_TEAM_WORKER_LAUNCH_ARGS`を通じて共有されます。
- `OMQ_TEAM_WORKER_CLI_MAP`はワーカーごとの選択で`OMQ_TEAM_WORKER_CLI`をオーバーライドします。
- トリガー送信はデフォルトで適応型リトライを使用します（queue/submit、必要に応じて安全なclear-line+resendフォールバック）。
- Claude workerモードでは、OMQはワーカーをプレーンな`claude`として起動し（追加の起動引数なし）、明示的な`--model` / `--config` / `--effort`オーバーライドを無視して、Claudeがデフォルトの`settings.json`を使用します。

## `omq setup`が書き込む内容

- `.omq/setup-scope.json`（永続化されたセットアップスコープ）
- スコープ依存のインストール：
  - `user`：`~/.qwen/prompts/`、`~/.qwen/skills/`、`~/.qwen/config.toml`、`~/.omq/agents/`、`~/.qwen/AGENTS.md`
  - `project`：`./.qwen/prompts/`、`./.qwen/skills/`、`./.qwen/config.toml`、`./.omq/agents/`、`./AGENTS.md`
- 起動動作：永続化されたスコープが`project`の場合、`omq`起動時に自動的に`QWEN_HOME=./.qwen`を使用（`QWEN_HOME`が既に設定されている場合を除く）。
- 起動命令は`~/.qwen/AGENTS.md`（または上書きされた`QWEN_HOME/AGENTS.md`）とプロジェクトの`./AGENTS.md`を結合し、その後ランタイムオーバーレイを追加して使用します。
- 既存の`AGENTS.md`は黙って上書きされません。インタラクティブTTYでは置き換え前に確認し、非インタラクティブ実行では`--force`がない限り置き換えをスキップします（アクティブセッションの安全チェックは引き続き適用されます）。
- `config.toml`の更新（両スコープ共通）：
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCPサーバーエントリ（`omq_state`、`omq_memory`、`omq_code_intel`、`omq_trace`）
  - `[tui] status_line`
- スコープ別`AGENTS.md`
- `.omq/`ランタイムディレクトリとHUD設定

## エージェントとスキル

- プロンプト：`prompts/*.md`（`user`は`~/.qwen/prompts/`に、`project`は`./.qwen/prompts/`にインストール）
- スキル：`skills/*/SKILL.md`（`user`は`~/.qwen/skills/`に、`project`は`./.qwen/skills/`にインストール）

例：
- エージェント：`architect`、`planner`、`executor`、`debugger`、`verifier`、`security-reviewer`
- スキル：`autopilot`、`plan`、`team`、`ralph`、`ultrawork`、`cancel`

## プロジェクト構成

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

## 開発

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## ドキュメント

- **[完全なドキュメント](./docs/getting-started.html)** — 完全ガイド
- **[CLIリファレンス](./docs/getting-started.html#cli-reference)** — すべての`omq`コマンド、フラグ、ツール
- **[通知ガイド](./docs/getting-started.html#notifications)** — Discord、Telegram、Slack、webhookの設定
- **[推奨ワークフロー](./docs/getting-started.html#workflows)** — 一般的なタスクのための実戦で検証されたスキルチェーン
- **[リリースノート](./docs/getting-started.html#release-notes)** — 各バージョンの新機能

## 備考

- 完全な変更ログ：`CHANGELOG.md`
- 移行ガイド（v0.4.4以降のmainline）：`docs/migration-mainline-post-v0.4.4.md`
- カバレッジとパリティノート：`COVERAGE.md`
- Hook拡張ワークフロー：`docs/hooks-extension.md`
- セットアップと貢献の詳細：`CONTRIBUTING.md`

## 謝辞

[oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode)にインスパイアされ、Qwen Code向けに適応されました。

## ライセンス

MIT
