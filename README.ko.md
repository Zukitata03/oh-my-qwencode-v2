# oh-my-qwencode (OMQ)

> **참고:** 이 프로젝트는 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) 를 Qwen Code 에 맞게 이식한 것입니다.

<p align="center">
  
  <br>
  <em>당신의 qwen는 혼자가 아닙니다.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1452487457085063218?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/PUwSMR9XNk)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[OpenClaw 통합 가이드](./docs/openclaw-integration.ko.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

[Qwen Code](https://github.com/openai/qwen)를 위한 멀티 에이전트 오케스트레이션 레이어.

## v0.9.0 새로운 기능 — Spark Initiative

Spark Initiative는 OMQ의 네이티브 탐색/검사 경로를 강화한 릴리스입니다.

- **`omq explore` 네이티브 하네스** — 읽기 전용 저장소 탐색을 Rust 기반 하네스로 더 빠르고 엄격하게 실행합니다.
- **`omq sparkshell`** — 긴 출력을 요약하고 tmux pane 캡처를 지원하는 운영자용 네이티브 검사 표면입니다.
- **크로스 플랫폼 네이티브 릴리스 자산** — `omq-explore-harness`, `omq-sparkshell`, `native-release-manifest.json` 기반 hydration 경로가 릴리스 파이프라인에 포함됩니다.
- **강화된 CI/CD** — `build` job의 명시적 Rust toolchain 설정, `cargo fmt --check`, `cargo clippy -- -D warnings`가 추가되었습니다.

자세한 내용은 [v0.9.0 릴리스 노트](./docs/release-notes-0.9.0.md) 및 [릴리스 본문](./docs/release-body-0.9.0.md)을 참고하세요.

## 첫 번째 세션

Qwen Code 내부에서:

```text
$architect "analyze current auth boundaries"
$executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

터미널에서:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## 핵심 모델

OMQ는 다음 레이어를 설치하고 연결합니다:

```text
User
  -> Qwen Code
    -> AGENTS.md (오케스트레이션 브레인)
    -> ~/.qwen/prompts/*.md (에이전트 프롬프트 카탈로그)
    -> ~/.qwen/skills/*/SKILL.md (스킬 카탈로그)
    -> ~/.qwen/config.toml (기능, 알림, MCP)
    -> .omq/ (런타임 상태, 메모리, 계획, 로그)
```

## 주요 명령어

```bash
omq                # Qwen Code 실행 (tmux에서 HUD와 함께)
omq setup          # 범위별 프롬프트/스킬/설정 설치 + 프로젝트 .omq + 범위별 AGENTS.md
omq doctor         # 설치/런타임 진단
omq doctor --team  # Team/swarm 진단
omq team ...       # tmux 팀 워커 시작/상태/재개/종료
omq status         # 활성 모드 표시
omq cancel         # 활성 실행 모드 취소
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (플러그인 확장 워크플로우)
omq hud ...        # --watch|--json|--preset
omq help
```

## Hooks 확장 (추가 표면)

OMQ는 이제 플러그인 스캐폴딩 및 검증을 위한 `omq hooks`를 포함합니다.

- `omq tmux-hook`은 계속 지원되며 변경되지 않았습니다.
- `omq hooks`는 추가적이며 tmux-hook 워크플로우를 대체하지 않습니다.
- 플러그인 파일은 `.omq/hooks/*.mjs`에 위치합니다.
- 플러그인은 기본적으로 비활성화되어 있으며; `OMQ_HOOK_PLUGINS=1`로 활성화합니다.

전체 확장 워크플로우 및 이벤트 모델은 `docs/hooks-extension.md`를 참조하세요.

## 시작 플래그

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # setup 전용
```

`--madmax`는 Qwen Code `--dangerously-bypass-approvals-and-sandbox`에 매핑됩니다.
신뢰할 수 있는/외부 sandbox 환경에서만 사용하세요.

### MCP workingDirectory 정책 (선택적 강화)

기본적으로 MCP state/memory/trace 도구는 호출자가 제공한 `workingDirectory`를 수락합니다.
이를 제한하려면 허용된 루트 목록을 설정하세요:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

설정 시 이 루트 외부의 `workingDirectory` 값은 거부됩니다.

## Qwen Code-First 프롬프트 제어

기본적으로 OMQ는 다음을 주입합니다:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

이것은 `QWEN_HOME`의 `AGENTS.md`와 프로젝트 `AGENTS.md`(있는 경우)를 병합한 뒤 런타임 오버레이를 추가합니다.
Qwen Code 동작을 확장하지만, Qwen Code 핵심 시스템 정책을 대체/우회하지 않습니다.

제어:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # AGENTS.md 주입 비활성화
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## 팀 모드

병렬 워커가 유리한 대규모 작업에 팀 모드를 사용합니다.

라이프사이클:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

운영 명령어:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

중요 규칙: 중단하는 경우가 아니라면 작업이 `in_progress` 상태인 동안 종료하지 마세요.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

팀 워커를 위한 Worker CLI 선택:

```bash
OMQ_TEAM_WORKER_CLI=auto    # 기본값; worker --model에 "claude"가 포함되면 claude 사용
OMQ_TEAM_WORKER_CLI=qwen   # Qwen Code 워커 강제
OMQ_TEAM_WORKER_CLI=claude  # Claude CLI 워커 강제
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # 워커별 CLI 혼합 (길이=1 또는 워커 수)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # 선택: 적응형 queue->resend 폴백 비활성화
```

참고:
- 워커 시작 인수는 여전히 `OMQ_TEAM_WORKER_LAUNCH_ARGS`를 통해 공유됩니다.
- `OMQ_TEAM_WORKER_CLI_MAP`은 워커별 선택을 위해 `OMQ_TEAM_WORKER_CLI`를 재정의합니다.
- 트리거 제출은 기본적으로 적응형 재시도를 사용합니다 (queue/submit, 필요시 안전한 clear-line+resend 폴백).
- Claude worker 모드에서 OMQ는 워커를 일반 `claude`로 시작하고 (추가 시작 인수 없음) 명시적인 `--model` / `--config` / `--effort` 재정의를 무시하여 Claude가 기본 `settings.json`을 사용합니다.

## `omq setup`이 작성하는 것

- `.omq/setup-scope.json` (저장된 설정 범위)
- 범위에 따른 설치:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- 시작 동작: 저장된 범위가 `project`이면, `omq` 시작 시 자동으로 `QWEN_HOME=./.qwen`를 사용합니다 (`QWEN_HOME`이 이미 설정되지 않은 경우).
- 시작 지침은 `~/.qwen/AGENTS.md`(또는 `QWEN_HOME/AGENTS.md`)와 프로젝트 `./AGENTS.md`를 병합한 뒤 런타임 오버레이를 추가해 사용합니다.
- 기존 `AGENTS.md`는 자동으로 덮어쓰지 않습니다. 대화형 TTY 실행에서는 덮어쓸지 확인하고, 비대화형 실행에서는 `--force`가 없으면 건너뜁니다 (활성 세션 안전 검사는 여전히 적용됩니다).
- `config.toml` 업데이트 (두 범위 모두):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP 서버 항목 (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- 범위별 `AGENTS.md`
- `.omq/` 런타임 디렉토리 및 HUD 설정

## 에이전트와 스킬

- 프롬프트: `prompts/*.md` (`user`는 `~/.qwen/prompts/`에, `project`는 `./.qwen/prompts/`에 설치)
- 스킬: `skills/*/SKILL.md` (`user`는 `~/.qwen/skills/`에, `project`는 `./.qwen/skills/`에 설치)

예시:
- 에이전트: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- 스킬: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## 프로젝트 구조

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

## 개발

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## 문서

- **[전체 문서](./docs/getting-started.html)** — 완전한 가이드
- **[CLI 레퍼런스](./docs/getting-started.html#cli-reference)** — 모든 `omq` 명령어, 플래그 및 도구
- **[알림 가이드](./docs/getting-started.html#notifications)** — Discord, Telegram, Slack 및 webhook 설정
- **[권장 워크플로우](./docs/getting-started.html#workflows)** — 일반적인 작업을 위한 실전 검증된 스킬 체인
- **[릴리스 노트](./docs/getting-started.html#release-notes)** — 각 버전의 새로운 기능

## 참고

- 전체 변경 로그: `CHANGELOG.md`
- 마이그레이션 가이드 (v0.4.4 이후 mainline): `docs/migration-mainline-post-v0.4.4.md`
- 커버리지 및 패리티 노트: `COVERAGE.md`
- Hook 확장 워크플로우: `docs/hooks-extension.md`
- 설정 및 기여 세부사항: `CONTRIBUTING.md`

## 감사의 말

[oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode)에서 영감을 받아 Qwen Code용으로 적응하였습니다.

## 라이선스

MIT
