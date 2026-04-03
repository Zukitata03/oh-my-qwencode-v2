# oh-my-qwencode (OMQ)

<p align="center">
  <img src="https://yeachan-heo.github.io/oh-my-qwencode-website/omq-character-nobg.png" alt="oh-my-qwencode character" width="280">
  <br>
  <em>Il tuo qwen non è solo.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://yeachan-heo.github.io/oh-my-qwencode-website/)** | **[Documentation](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** | **[CLI Reference](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** | **[Workflows](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** | **[Guida all’integrazione OpenClaw](./docs/openclaw-integration.it.md)** | **[GitHub](https://github.com/Yeachan-Heo/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Livello di orchestrazione multi-agente per [Qwen Code](https://github.com/openai/qwen).

## Novità nella v0.9.0 — Spark Initiative

Spark Initiative è la release che rafforza il percorso nativo di esplorazione e ispezione in OMQ.

- **Harness nativo per `omq explore`** — esegue l’esplorazione del repository in sola lettura tramite un percorso Rust più rapido e più rigoroso.
- **`omq sparkshell`** — superficie nativa per operatori con riepiloghi dell’output lungo e cattura esplicita dei pannelli tmux.
- **Asset nativi multipiattaforma** — il percorso di hydration per `omq-explore-harness`, `omq-sparkshell` e `native-release-manifest.json` ora fa parte della pipeline di release.
- **CI/CD rafforzato** — aggiunge la configurazione esplicita della toolchain Rust nel job `build`, oltre a `cargo fmt --check` e `cargo clippy -- -D warnings`.

Vedi anche le [note di rilascio v0.9.0](./docs/release-notes-0.9.0.md) e il [testo della release](./docs/release-body-0.9.0.md).

## Prima sessione

All'interno di Qwen Code:

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Dal terminale:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Modello di base

OMQ installa e collega questi livelli:

```text
User
  -> Qwen Code
    -> AGENTS.md (cervello dell'orchestrazione)
    -> ~/.qwen/prompts/*.md (catalogo prompt degli agenti)
    -> ~/.qwen/skills/*/SKILL.md (catalogo skill)
    -> ~/.qwen/config.toml (funzionalità, notifiche, MCP)
    -> .omq/ (stato di esecuzione, memoria, piani, log)
```

## Comandi principali

```bash
omq                # Avvia Qwen Code (+ HUD in tmux se disponibile)
omq setup          # Installa prompt/skill/config per scope + .omq del progetto + AGENTS.md specifico dello scope
omq doctor         # Diagnostica installazione/esecuzione
omq doctor --team  # Diagnostica Team/Swarm
omq team ...       # Avvia/stato/riprendi/arresta i worker del team tmux
omq status         # Mostra le modalità attive
omq cancel         # Annulla le modalità di esecuzione attive
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (workflow estensione plugin)
omq hud ...        # --watch|--json|--preset
omq help
```

## Estensione Hooks (Superficie additiva)

OMQ ora include `omq hooks` per lo scaffolding e la validazione dei plugin.

- `omq tmux-hook` resta supportato e invariato.
- `omq hooks` è additivo e non sostituisce i workflow tmux-hook.
- I file dei plugin si trovano in `.omq/hooks/*.mjs`.
- I plugin sono disattivati per impostazione predefinita; abilitali con `OMQ_HOOK_PLUGINS=1`.

Consulta `docs/hooks-extension.md` per il workflow completo di estensione e il modello degli eventi.

## Flag di avvio

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # solo per setup
```

`--madmax` corrisponde a Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
Utilizzare solo in ambienti sandbox fidati/esterni.

### Policy MCP workingDirectory (hardening opzionale)

Per impostazione predefinita, gli strumenti MCP stato/memoria/trace accettano il `workingDirectory` fornito dal chiamante.
Per limitare questo, imposta una lista di directory root consentite:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Quando impostato, i valori `workingDirectory` al di fuori di queste root vengono rifiutati.

## Controllo Qwen Code-First dei prompt

Per impostazione predefinita, OMQ inietta:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Questo unisce l'`AGENTS.md` di `QWEN_HOME` con l'`AGENTS.md` del progetto (se presente) e poi aggiunge l'overlay di runtime.
Estende il comportamento di Qwen Code, ma non sostituisce/aggira le policy di sistema core di Qwen Code.

Controlli:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # disabilita l'iniezione AGENTS.md
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Modalità team

Usa la modalità team per lavori ampi che beneficiano di worker paralleli.

Ciclo di vita:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Comandi operativi:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Regola importante: non arrestare mentre i task sono ancora `in_progress`, a meno che non si stia abortendo.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Selezione CLI worker per i worker del team:

```bash
OMQ_TEAM_WORKER_CLI=auto    # predefinito; usa claude quando worker --model contiene "claude"
OMQ_TEAM_WORKER_CLI=qwen   # forza i worker Qwen Code
OMQ_TEAM_WORKER_CLI=claude  # forza i worker Claude CLI
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # mix CLI per worker (lunghezza=1 o numero di worker)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # opzionale: disabilita il fallback adattivo queue->resend
```

Note:
- Gli argomenti di avvio dei worker sono ancora condivisi tramite `OMQ_TEAM_WORKER_LAUNCH_ARGS`.
- `OMQ_TEAM_WORKER_CLI_MAP` sovrascrive `OMQ_TEAM_WORKER_CLI` per la selezione per singolo worker.
- L'invio dei trigger usa per impostazione predefinita tentativi adattivi (queue/submit, poi fallback sicuro clear-line+resend quando necessario).
- In modalità worker Claude, OMQ avvia i worker come semplice `claude` (nessun argomento di avvio aggiuntivo) e ignora le sovrascritture esplicite `--model` / `--config` / `--effort` in modo che Claude usi il `settings.json` predefinito.

## Cosa scrive `omq setup`

- `.omq/setup-scope.json` (scope di setup persistito)
- Installazioni dipendenti dallo scope:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Comportamento all'avvio: se lo scope persistito è `project`, l'avvio `omq` usa automaticamente `QWEN_HOME=./.qwen` (a meno che `QWEN_HOME` non sia già impostato).
- Le istruzioni di avvio uniscono `~/.qwen/AGENTS.md` (o `QWEN_HOME/AGENTS.md` se ridefinito) con `./AGENTS.md` del progetto, quindi aggiungono l'overlay di runtime.
- I file `AGENTS.md` esistenti non vengono mai sovrascritti in silenzio: in TTY interattivo il setup chiede prima di sostituire; in modalità non interattiva la sostituzione viene saltata salvo `--force` (i controlli di sicurezza della sessione attiva restano validi).
- Aggiornamenti `config.toml` (per entrambi gli scope):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Voci server MCP (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- `AGENTS.md` specifico dello scope
- Directory di esecuzione `.omq/` e configurazione HUD

## Agenti e Skill

- Prompt: `prompts/*.md` (installati in `~/.qwen/prompts/` per `user`, `./.qwen/prompts/` per `project`)
- Skill: `skills/*/SKILL.md` (installati in `~/.qwen/skills/` per `user`, `./.qwen/skills/` per `project`)

Esempi:
- Agenti: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skill: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Struttura del progetto

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

## Sviluppo

```bash
git clone https://github.com/Yeachan-Heo/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Documentazione

- **[Documentazione completa](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** — Guida completa
- **[Riferimento CLI](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** — Tutti i comandi `omq`, flag e strumenti
- **[Guida alle notifiche](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#notifications)** — Configurazione Discord, Telegram, Slack e webhook
- **[Workflow consigliati](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** — Catene di skill collaudate per i compiti comuni
- **[Note di rilascio](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#release-notes)** — Novità di ogni versione

## Note

- Changelog completo: `CHANGELOG.md`
- Guida alla migrazione (post-v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Note di copertura e parità: `COVERAGE.md`
- Workflow estensione hook: `docs/hooks-extension.md`
- Dettagli setup e contribuzione: `CONTRIBUTING.md`

## Ringraziamenti

Ispirato da [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), adattato per Qwen Code.

## Licenza

MIT
