# oh-my-qwencode (OMQ)

<p align="center">
  
  <br>
  <em>Ваш qwen не одинок.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[Руководство по интеграции OpenClaw](./docs/openclaw-integration.ru.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Слой мультиагентной оркестрации для [Qwen Code](https://github.com/openai/qwen).

## Что нового в v0.9.0 — Spark Initiative

Spark Initiative — это релиз, усиливающий нативный путь исследования и инспекции в OMQ.

- **Нативный harness для `omq explore`** — ускоряет и ужесточает read-only исследование репозитория через Rust-путь.
- **`omq sparkshell`** — нативная операторская поверхность для инспекции с краткими сводками длинного вывода и явным захватом tmux-pane.
- **Кроссплатформенные нативные release-артефакты** — путь hydration для `omq-explore-harness`, `omq-sparkshell` и `native-release-manifest.json` теперь входит в release pipeline.
- **Усиленный CI/CD** — добавлены явная настройка Rust toolchain в job `build`, а также `cargo fmt --check` и `cargo clippy -- -D warnings`.

См. также [release notes v0.9.0](./docs/release-notes-0.9.0.md) и [release body](./docs/release-body-0.9.0.md).

## Первая сессия

Внутри Qwen Code:

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Из терминала:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Базовая модель

OMQ устанавливает и связывает следующие слои:

```text
User
  -> Qwen Code
    -> AGENTS.md (мозг оркестрации)
    -> ~/.qwen/prompts/*.md (каталог промптов агентов)
    -> ~/.qwen/skills/*/SKILL.md (каталог навыков)
    -> ~/.qwen/config.toml (функции, уведомления, MCP)
    -> .omq/ (состояние выполнения, память, планы, журналы)
```

## Основные команды

```bash
omq                # Запустить Qwen Code (+ HUD в tmux при наличии)
omq setup          # Установить промпты/навыки/конфиг по области + .omq проекта + AGENTS.md для выбранной области
omq doctor         # Диагностика установки/среды выполнения
omq doctor --team  # Диагностика Team/swarm
omq team ...       # Запуск/статус/возобновление/завершение рабочих tmux
omq status         # Показать активные режимы
omq cancel         # Отменить активные режимы выполнения
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (рабочий процесс расширений плагинов)
omq hud ...        # --watch|--json|--preset
omq help
```

## Расширение Hooks (Дополнительная поверхность)

OMQ теперь включает `omq hooks` для создания шаблонов плагинов и валидации.

- `omq tmux-hook` по-прежнему поддерживается и не изменён.
- `omq hooks` является дополнительным и не заменяет рабочие процессы tmux-hook.
- Файлы плагинов располагаются в `.omq/hooks/*.mjs`.
- Плагины по умолчанию отключены; включите с помощью `OMQ_HOOK_PLUGINS=1`.

Полный рабочий процесс расширений и модель событий описаны в `docs/hooks-extension.md`.

## Флаги запуска

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # только для setup
```

`--madmax` соответствует Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
Используйте только в доверенных/внешних sandbox-окружениях.

### Политика workingDirectory MCP (опциональное усиление)

По умолчанию инструменты MCP state/memory/trace принимают `workingDirectory`, предоставленный вызывающей стороной.
Чтобы ограничить это, задайте список разрешённых корней:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

При установке значения `workingDirectory` за пределами этих корней будут отклонены.

## Qwen Code-First управление промптами

По умолчанию OMQ внедряет:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Это объединяет `AGENTS.md` из `QWEN_HOME` с проектным `AGENTS.md` (если он есть), а затем добавляет runtime-overlay.
Расширяет поведение Qwen Code, но не заменяет/обходит основные системные политики Qwen Code.

Управление:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # отключить внедрение AGENTS.md
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Командный режим

Используйте командный режим для масштабной работы, которая выигрывает от параллельных исполнителей.

Жизненный цикл:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Операционные команды:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Важное правило: не завершайте работу, пока задачи находятся в состоянии `in_progress`, если только не прерываете выполнение.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Выбор Worker CLI для рабочих команды:

```bash
OMQ_TEAM_WORKER_CLI=auto    # по умолчанию; использует claude, если worker --model содержит "claude"
OMQ_TEAM_WORKER_CLI=qwen   # принудительно Qwen Code
OMQ_TEAM_WORKER_CLI=claude  # принудительно Claude CLI
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # CLI для каждого рабочего (длина=1 или количество рабочих)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # опционально: отключить адаптивный откат queue->resend
```

Примечания:
- Аргументы запуска рабочих по-прежнему передаются через `OMQ_TEAM_WORKER_LAUNCH_ARGS`.
- `OMQ_TEAM_WORKER_CLI_MAP` переопределяет `OMQ_TEAM_WORKER_CLI` для выбора на уровне рабочего.
- Отправка триггеров по умолчанию использует адаптивные повторные попытки (queue/submit, затем безопасный откат clear-line+resend при необходимости).
- В режиме Claude worker OMQ запускает рабочих как обычный `claude` (без дополнительных аргументов) и игнорирует явные переопределения `--model` / `--config` / `--effort`, чтобы Claude использовал стандартный `settings.json`.

## Что записывает `omq setup`

- `.omq/setup-scope.json` (сохранённая область установки)
- Установки в зависимости от области:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Поведение при запуске: если сохранённая область — `project`, `omq` автоматически использует `QWEN_HOME=./.qwen` (если `QWEN_HOME` ещё не задан).
- Инструкции запуска объединяют `~/.qwen/AGENTS.md` (или `QWEN_HOME/AGENTS.md`, если путь переопределён) с проектным `./AGENTS.md`, а затем добавляют runtime-overlay.
- Существующие файлы `AGENTS.md` никогда не перезаписываются молча: в интерактивном TTY setup спрашивает перед заменой, а в неинтерактивном режиме пропускает замену без `--force` (проверки безопасности активных сессий остаются в силе).
- Обновления `config.toml` (для обеих областей):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Записи MCP-серверов (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- `AGENTS.md` для выбранной области
- Директории `.omq/` и конфигурация HUD

## Агенты и навыки

- Промпты: `prompts/*.md` (устанавливаются в `~/.qwen/prompts/` для `user`, `./.qwen/prompts/` для `project`)
- Навыки: `skills/*/SKILL.md` (устанавливаются в `~/.qwen/skills/` для `user`, `./.qwen/skills/` для `project`)

Примеры:
- Агенты: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Навыки: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Структура проекта

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

## Разработка

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Документация

- **[Полная документация](./docs/getting-started.html)** — Полное руководство
- **[Справочник CLI](./docs/getting-started.html#cli-reference)** — Все команды `omq`, флаги и инструменты
- **[Руководство по уведомлениям](./docs/getting-started.html#notifications)** — Настройка Discord, Telegram, Slack и webhook
- **[Рекомендуемые рабочие процессы](./docs/getting-started.html#workflows)** — Проверенные в бою цепочки навыков для типичных задач
- **[Примечания к выпускам](./docs/getting-started.html#release-notes)** — Что нового в каждой версии

## Примечания

- Полный журнал изменений: `CHANGELOG.md`
- Руководство по миграции (после v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Заметки о покрытии и паритете: `COVERAGE.md`
- Рабочий процесс расширений hook: `docs/hooks-extension.md`
- Детали установки и участия: `CONTRIBUTING.md`

## Благодарности

Вдохновлено проектом [oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode), адаптировано для Qwen Code.

## Лицензия

MIT
