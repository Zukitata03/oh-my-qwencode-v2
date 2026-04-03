# oh-my-qwencode (OMQ)

<p align="center">
  
  <br>
  <em>Qwen Code của bạn không đơn độc.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[Hướng dẫn tích hợp OpenClaw](./docs/openclaw-integration.vi.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Lớp điều phối đa tác nhân cho [Qwen Code](https://github.com/openai/qwen).

## Điểm mới trong v0.9.0 — Spark Initiative

Spark Initiative là bản phát hành tăng cường đường đi native cho khám phá và kiểm tra trong OMQ.

- **Native harness cho `omq explore`** — chạy khám phá kho mã chỉ đọc nhanh hơn và chặt chẽ hơn bằng harness Rust.
- **`omq sparkshell`** — bề mặt kiểm tra native cho operator, hỗ trợ tóm tắt đầu ra dài và chụp tmux pane.
- **Tài sản phát hành native đa nền tảng** — đường hydration cho `omq-explore-harness`, `omq-sparkshell` và `native-release-manifest.json` nay đã nằm trong pipeline phát hành.
- **CI/CD được tăng cường** — thêm thiết lập Rust toolchain tường minh cho `build` job cùng với `cargo fmt --check` và `cargo clippy -- -D warnings`.

Xem thêm tại [ghi chú phát hành v0.9.0](./docs/release-notes-0.9.0.md) và [release body](./docs/release-body-0.9.0.md).

## Phiên đầu tiên

Trong Qwen Code:

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Từ terminal:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Mô hình cốt lõi

OMQ cài đặt và kết nối các lớp sau:

```text
User
  -> Qwen Code
    -> AGENTS.md (bộ não điều phối)
    -> ~/.qwen/prompts/*.md (danh mục prompt tác nhân)
    -> ~/.qwen/skills/*/SKILL.md (danh mục skill)
    -> ~/.qwen/config.toml (tính năng, thông báo, MCP)
    -> .omq/ (trạng thái runtime, bộ nhớ, kế hoạch, nhật ký)
```

## Các lệnh chính

```bash
omq                # Khởi chạy Qwen Code (+ HUD trong tmux khi có sẵn)
omq setup          # Cài đặt prompt/skill/config theo phạm vi + .omq của dự án + AGENTS.md theo phạm vi
omq doctor         # Chẩn đoán cài đặt/runtime
omq doctor --team  # Chẩn đoán Team/swarm
omq team ...       # Khởi động/trạng thái/tiếp tục/tắt worker tmux của đội
omq status         # Hiển thị các chế độ đang hoạt động
omq cancel         # Hủy các chế độ thực thi đang hoạt động
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (quy trình mở rộng plugin)
omq hud ...        # --watch|--json|--preset
omq help
```

## Mở rộng Hooks (Bề mặt bổ sung)

OMQ hiện bao gồm `omq hooks` cho scaffolding và xác thực plugin.

- `omq tmux-hook` vẫn được hỗ trợ và không thay đổi.
- `omq hooks` là bổ sung và không thay thế quy trình tmux-hook.
- Tệp plugin nằm tại `.omq/hooks/*.mjs`.
- Plugin tắt theo mặc định; kích hoạt bằng `OMQ_HOOK_PLUGINS=1`.

Xem `docs/hooks-extension.md` cho quy trình mở rộng đầy đủ và mô hình sự kiện.

## Cờ khởi chạy

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # chỉ dành cho setup
```

`--madmax` ánh xạ đến Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
Chỉ sử dụng trong môi trường sandbox tin cậy hoặc bên ngoài.

### Chính sách workingDirectory MCP (tăng cường tùy chọn)

Theo mặc định, các công cụ MCP state/memory/trace chấp nhận `workingDirectory` do người gọi cung cấp.
Để hạn chế điều này, đặt danh sách gốc được phép:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Khi được đặt, các giá trị `workingDirectory` ngoài các gốc này sẽ bị từ chối.

## Kiểm soát Prompt Qwen Code-First

Theo mặc định, OMQ tiêm:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Điều này kết hợp `AGENTS.md` trong `QWEN_HOME` với `AGENTS.md` của dự án (nếu có), rồi thêm lớp phủ runtime.
Mở rộng hành vi Qwen Code, nhưng không thay thế/bỏ qua các chính sách hệ thống cốt lõi của Qwen Code.

Điều khiển:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # tắt tiêm AGENTS.md
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Chế độ đội

Sử dụng chế độ đội cho công việc lớn được hưởng lợi từ worker song song.

Vòng đời:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Các lệnh vận hành:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Quy tắc quan trọng: không tắt khi các tác vụ vẫn đang ở trạng thái `in_progress` trừ khi đang hủy bỏ.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Chọn Worker CLI cho worker của đội:

```bash
OMQ_TEAM_WORKER_CLI=auto    # mặc định; sử dụng claude khi worker --model chứa "claude"
OMQ_TEAM_WORKER_CLI=qwen   # ép buộc worker Qwen Code
OMQ_TEAM_WORKER_CLI=claude  # ép buộc worker Claude CLI
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # hỗn hợp CLI theo worker (độ dài=1 hoặc số worker)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # tùy chọn: tắt fallback thích ứng queue->resend
```

Lưu ý:
- Tham số khởi chạy worker vẫn được chia sẻ qua `OMQ_TEAM_WORKER_LAUNCH_ARGS`.
- `OMQ_TEAM_WORKER_CLI_MAP` ghi đè `OMQ_TEAM_WORKER_CLI` cho lựa chọn theo worker.
- Gửi trigger sử dụng thử lại thích ứng theo mặc định (queue/submit, sau đó fallback an toàn clear-line+resend khi cần).
- Trong chế độ Claude worker, OMQ khởi chạy worker dưới dạng `claude` thuần túy (không có tham số khởi chạy thêm) và bỏ qua các ghi đè rõ ràng `--model` / `--config` / `--effort` để Claude sử dụng `settings.json` mặc định.

## `omq setup` ghi những gì

- `.omq/setup-scope.json` (phạm vi cài đặt được lưu trữ)
- Cài đặt phụ thuộc phạm vi:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Hành vi khởi chạy: nếu phạm vi được lưu trữ là `project`, khởi chạy `omq` tự động sử dụng `QWEN_HOME=./.qwen` (trừ khi `QWEN_HOME` đã được đặt).
- Hướng dẫn khởi chạy sẽ kết hợp `~/.qwen/AGENTS.md` (hoặc `QWEN_HOME/AGENTS.md` nếu đã ghi đè) với `./AGENTS.md` của dự án, rồi thêm lớp phủ runtime.
- Các tệp `AGENTS.md` hiện có sẽ không bao giờ bị ghi đè âm thầm: ở TTY tương tác, setup hỏi trước khi thay thế; ở chế độ không tương tác, việc thay thế sẽ bị bỏ qua trừ khi dùng `--force` (kiểm tra an toàn phiên hoạt động vẫn áp dụng).
- Cập nhật `config.toml` (cho cả hai phạm vi):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Mục máy chủ MCP (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- `AGENTS.md` theo phạm vi
- Thư mục `.omq/` runtime và cấu hình HUD

## Tác nhân và skill

- Prompt: `prompts/*.md` (cài vào `~/.qwen/prompts/` cho `user`, `./.qwen/prompts/` cho `project`)
- Skill: `skills/*/SKILL.md` (cài vào `~/.qwen/skills/` cho `user`, `./.qwen/skills/` cho `project`)

Ví dụ:
- Tác nhân: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skill: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Cấu trúc dự án

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

## Phát triển

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Tài liệu

- **[Tài liệu đầy đủ](./docs/getting-started.html)** — Hướng dẫn hoàn chỉnh
- **[Tham chiếu CLI](./docs/getting-started.html#cli-reference)** — Tất cả lệnh `omq`, cờ và công cụ
- **[Hướng dẫn thông báo](./docs/getting-started.html#notifications)** — Cài đặt Discord, Telegram, Slack và webhook
- **[Quy trình công việc khuyến nghị](./docs/getting-started.html#workflows)** — Chuỗi skill đã thử nghiệm thực chiến cho các tác vụ phổ biến
- **[Ghi chú phát hành](./docs/getting-started.html#release-notes)** — Tính năng mới trong mỗi phiên bản

## Ghi chú

- Nhật ký thay đổi đầy đủ: `CHANGELOG.md`
- Hướng dẫn di chuyển (sau v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Ghi chú về độ bao phủ và tương đương: `COVERAGE.md`
- Quy trình mở rộng hook: `docs/hooks-extension.md`
- Chi tiết cài đặt và đóng góp: `CONTRIBUTING.md`

## Lời cảm ơn

Lấy cảm hứng từ [oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode), được điều chỉnh cho Qwen Code.

## Giấy phép

MIT
