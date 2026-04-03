# oh-my-qwencode (OMQ)

<p align="center">
  <img src="https://yeachan-heo.github.io/oh-my-qwencode-website/omq-character-nobg.png" alt="oh-my-qwencode character" width="280">
  <br>
  <em>Tu qwen no está solo.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://yeachan-heo.github.io/oh-my-qwencode-website/)** | **[Documentation](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** | **[CLI Reference](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** | **[Workflows](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** | **[Guía de integración de OpenClaw](./docs/openclaw-integration.es.md)** | **[GitHub](https://github.com/Yeachan-Heo/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Capa de orquestación multiagente para [Qwen Code](https://github.com/openai/qwen).

## Novedades en v0.9.0 — Spark Initiative

Spark Initiative es la versión que refuerza la ruta nativa de exploración e inspección en OMQ.

- **Harness nativo para `omq explore`** — ejecuta exploración de repositorio en modo solo lectura con una vía Rust más rápida y más estricta.
- **`omq sparkshell`** — superficie nativa para operadores, con resúmenes de salidas largas y captura explícita de paneles tmux.
- **Assets nativos multiplataforma** — la ruta de hidratación de `omq-explore-harness`, `omq-sparkshell` y `native-release-manifest.json` ya forma parte del pipeline de release.
- **CI/CD reforzado** — se añadió configuración explícita de Rust en el job `build`, además de `cargo fmt --check` y `cargo clippy -- -D warnings`.

Consulta también las [notas de lanzamiento v0.9.0](./docs/release-notes-0.9.0.md) y el [release body](./docs/release-body-0.9.0.md).

## Primera sesión

Dentro de Qwen Code:

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Desde la terminal:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Modelo central

OMQ instala y conecta estas capas:

```text
User
  -> Qwen Code
    -> AGENTS.md (cerebro de orquestación)
    -> ~/.qwen/prompts/*.md (catálogo de prompts de agentes)
    -> ~/.qwen/skills/*/SKILL.md (catálogo de skills)
    -> ~/.qwen/config.toml (características, notificaciones, MCP)
    -> .omq/ (estado en ejecución, memoria, planes, registros)
```

## Comandos principales

```bash
omq                # Lanzar Qwen Code (+ HUD en tmux cuando está disponible)
omq setup          # Instalar prompts/skills/config por alcance + .omq del proyecto + AGENTS.md específico del alcance
omq doctor         # Diagnósticos de instalación/ejecución
omq doctor --team  # Diagnósticos de Team/swarm
omq team ...       # Iniciar/estado/reanudar/apagar workers tmux del equipo
omq status         # Mostrar modos activos
omq cancel         # Cancelar modos de ejecución activos
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (flujo de trabajo de extensión de plugins)
omq hud ...        # --watch|--json|--preset
omq help
```

## Extensión de Hooks (Superficie adicional)

OMQ ahora incluye `omq hooks` para scaffolding y validación de plugins.

- `omq tmux-hook` sigue siendo compatible y no ha cambiado.
- `omq hooks` es aditivo y no reemplaza los flujos de trabajo de tmux-hook.
- Los archivos de plugins se encuentran en `.omq/hooks/*.mjs`.
- Los plugins están desactivados por defecto; actívalos con `OMQ_HOOK_PLUGINS=1`.

Consulta `docs/hooks-extension.md` para el flujo de trabajo completo de extensiones y el modelo de eventos.

## Flags de inicio

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # solo para setup
```

`--madmax` se mapea a Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
Úsalo solo en entornos sandbox de confianza o externos.

### Política de workingDirectory MCP (endurecimiento opcional)

Por defecto, las herramientas MCP de state/memory/trace aceptan el `workingDirectory` proporcionado por el llamador.
Para restringir esto, establece una lista de raíces permitidas:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Cuando se establece, los valores de `workingDirectory` fuera de estas raíces son rechazados.

## Control de prompts Qwen Code-First

Por defecto, OMQ inyecta:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Esto combina el `AGENTS.md` de `QWEN_HOME` con el `AGENTS.md` del proyecto (si existe) y luego añade la superposición de runtime.
Extiende el comportamiento de Qwen Code, pero no reemplaza ni elude las políticas centrales del sistema Qwen Code.

Controles:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # desactivar inyección de AGENTS.md
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Modo equipo

Usa el modo equipo para trabajo amplio que se beneficia de workers paralelos.

Ciclo de vida:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Comandos operacionales:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Regla importante: no apagues mientras las tareas estén en estado `in_progress` a menos que estés abortando.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Selección de Worker CLI para los workers del equipo:

```bash
OMQ_TEAM_WORKER_CLI=auto    # predeterminado; usa claude cuando worker --model contiene "claude"
OMQ_TEAM_WORKER_CLI=qwen   # forzar workers Qwen Code
OMQ_TEAM_WORKER_CLI=claude  # forzar workers Claude CLI
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # mezcla de CLI por worker (longitud=1 o cantidad de workers)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # opcional: desactivar fallback adaptativo queue->resend
```

Notas:
- Los argumentos de inicio de workers se comparten a través de `OMQ_TEAM_WORKER_LAUNCH_ARGS`.
- `OMQ_TEAM_WORKER_CLI_MAP` anula `OMQ_TEAM_WORKER_CLI` para selección por worker.
- El envío de triggers usa reintentos adaptativos por defecto (queue/submit, luego fallback seguro clear-line+resend cuando es necesario).
- En modo Claude worker, OMQ lanza workers como `claude` simple (sin argumentos de inicio extra) e ignora anulaciones explícitas de `--model` / `--config` / `--effort` para que Claude use el `settings.json` predeterminado.

## Qué escribe `omq setup`

- `.omq/setup-scope.json` (alcance de instalación persistido)
- Instalaciones dependientes del alcance:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Comportamiento de inicio: si el alcance persistido es `project`, el lanzamiento de `omq` usa automáticamente `QWEN_HOME=./.qwen` (a menos que `QWEN_HOME` ya esté establecido).
- Las instrucciones de inicio combinan `~/.qwen/AGENTS.md` (o `QWEN_HOME/AGENTS.md` si se sobrescribe) con `./AGENTS.md` del proyecto y luego añaden la superposición de runtime.
- Los archivos `AGENTS.md` existentes nunca se sobrescriben silenciosamente: en TTY interactivo se pregunta antes de reemplazar; en modo no interactivo se omite salvo que pases `--force` (las verificaciones de seguridad de sesiones activas siguen aplicándose).
- Actualizaciones de `config.toml` (para ambos alcances):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Entradas de servidores MCP (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- `AGENTS.md` específico del alcance
- Directorios `.omq/` de ejecución y configuración de HUD

## Agentes y skills

- Prompts: `prompts/*.md` (instalados en `~/.qwen/prompts/` para `user`, `./.qwen/prompts/` para `project`)
- Skills: `skills/*/SKILL.md` (instalados en `~/.qwen/skills/` para `user`, `./.qwen/skills/` para `project`)

Ejemplos:
- Agentes: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Estructura del proyecto

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

## Desarrollo

```bash
git clone https://github.com/Yeachan-Heo/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Documentación

- **[Documentación completa](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** — Guía completa
- **[Referencia CLI](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** — Todos los comandos `omq`, flags y herramientas
- **[Guía de notificaciones](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#notifications)** — Configuración de Discord, Telegram, Slack y webhooks
- **[Flujos de trabajo recomendados](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** — Cadenas de skills probadas en batalla para tareas comunes
- **[Notas de versión](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#release-notes)** — Novedades en cada versión

## Notas

- Registro de cambios completo: `CHANGELOG.md`
- Guía de migración (post-v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Notas de cobertura y paridad: `COVERAGE.md`
- Flujo de trabajo de extensión de hooks: `docs/hooks-extension.md`
- Detalles de instalación y contribución: `CONTRIBUTING.md`

## Agradecimientos

Inspirado en [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), adaptado para Qwen Code.

## Licencia

MIT
