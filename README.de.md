# oh-my-qwencode (OMQ)

<p align="center">
  <img src="https://yeachan-heo.github.io/oh-my-qwencode-website/omq-character-nobg.png" alt="oh-my-qwencode character" width="280">
  <br>
  <em>Dein Qwen Code ist nicht allein.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://yeachan-heo.github.io/oh-my-qwencode-website/)** | **[Documentation](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** | **[CLI Reference](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** | **[Workflows](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** | **[OpenClaw-Integrationsleitfaden](./docs/openclaw-integration.de.md)** | **[GitHub](https://github.com/Yeachan-Heo/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Multi-Agenten-Orchestrierungsschicht für [Qwen Code](https://github.com/openai/qwen).

## Neu in v0.9.0 — Spark Initiative

Spark Initiative ist das Release, das den nativen Pfad für Exploration und Inspektion in OMQ stärkt.

- **Nativer Harness für `omq explore`** — führt Read-only-Repository-Exploration über einen schnelleren und strengeren Rust-Pfad aus.
- **`omq sparkshell`** — native Operator-Oberfläche für Inspektion mit Zusammenfassungen langer Ausgaben und expliziter tmux-Pane-Erfassung.
- **Plattformübergreifende native Release-Artefakte** — der Hydration-Pfad für `omq-explore-harness`, `omq-sparkshell` und `native-release-manifest.json` ist jetzt Teil der Release-Pipeline.
- **Gehärtetes CI/CD** — ergänzt ein explizites Rust-Toolchain-Setup im `build`-Job sowie `cargo fmt --check` und `cargo clippy -- -D warnings`.

Siehe auch die [Release Notes zu v0.9.0](./docs/release-notes-0.9.0.md) und den [Release-Text](./docs/release-body-0.9.0.md).

## Erste Sitzung

Innerhalb von Qwen Code:

```text
$architect "analyze current auth boundaries"
$executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Vom Terminal:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Kernmodell

OMQ installiert und verbindet diese Schichten:

```text
User
  -> Qwen Code
    -> AGENTS.md (Orchestrierungs-Gehirn)
    -> ~/.qwen/prompts/*.md (Agenten-Prompt-Katalog)
    -> ~/.qwen/skills/*/SKILL.md (Skill-Katalog)
    -> ~/.qwen/config.toml (Features, Benachrichtigungen, MCP)
    -> .omq/ (Laufzeitzustand, Speicher, Pläne, Protokolle)
```

## Hauptbefehle

```bash
omq                # Qwen Code starten (+ HUD in tmux wenn verfügbar)
omq setup          # Prompts/Skills/Config nach Bereich installieren + Projekt-.omq + bereichsspezifische AGENTS.md
omq doctor         # Installations-/Laufzeitdiagnose
omq doctor --team  # Team/Swarm-Diagnose
omq team ...       # tmux-Team-Worker starten/Status/fortsetzen/herunterfahren
omq status         # Aktive Modi anzeigen
omq cancel         # Aktive Ausführungsmodi abbrechen
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (Plugin-Erweiterungs-Workflow)
omq hud ...        # --watch|--json|--preset
omq help
```

## Hooks-Erweiterung (Additive Oberfläche)

OMQ enthält jetzt `omq hooks` für Plugin-Gerüstbau und -Validierung.

- `omq tmux-hook` wird weiterhin unterstützt und ist unverändert.
- `omq hooks` ist additiv und ersetzt keine tmux-hook-Workflows.
- Plugin-Dateien befinden sich unter `.omq/hooks/*.mjs`.
- Plugins sind standardmäßig deaktiviert; aktivieren mit `OMQ_HOOK_PLUGINS=1`.

Siehe `docs/hooks-extension.md` für den vollständigen Erweiterungs-Workflow und das Ereignismodell.

## Start-Flags

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # nur bei setup
```

`--madmax` entspricht Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
Nur in vertrauenswürdigen/externen Sandbox-Umgebungen verwenden.

### MCP workingDirectory-Richtlinie (optionale Härtung)

Standardmäßig akzeptieren MCP-Zustand/Speicher/Trace-Tools das vom Aufrufer bereitgestellte `workingDirectory`.
Um dies einzuschränken, setzen Sie eine Erlaubnisliste von Wurzelverzeichnissen:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Wenn gesetzt, werden `workingDirectory`-Werte außerhalb dieser Wurzeln abgelehnt.

## Qwen Code-First Prompt-Steuerung

Standardmäßig injiziert OMQ:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Dies kombiniert `AGENTS.md` aus `QWEN_HOME` mit dem Projekt-`AGENTS.md` (falls vorhanden) und legt dann die Laufzeit-Überlagerung darüber.
Es erweitert das Qwen Code-Verhalten, ersetzt/umgeht aber nicht die Qwen Code-Kernsystemrichtlinien.

Steuerung:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # AGENTS.md-Injektion deaktivieren
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Team-Modus

Verwenden Sie den Team-Modus für umfangreiche Arbeiten, die von parallelen Workern profitieren.

Lebenszyklus:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Operationelle Befehle:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Wichtige Regel: Fahren Sie nicht herunter, während Aufgaben noch `in_progress` sind, es sei denn, Sie brechen ab.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Worker-CLI-Auswahl für Team-Worker:

```bash
OMQ_TEAM_WORKER_CLI=auto    # Standard; verwendet claude wenn Worker --model "claude" enthält
OMQ_TEAM_WORKER_CLI=qwen   # Qwen Code-CLI-Worker erzwingen
OMQ_TEAM_WORKER_CLI=claude  # Claude-CLI-Worker erzwingen
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # CLI-Mix pro Worker (Länge=1 oder Worker-Anzahl)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # optional: adaptiven Queue->Resend-Fallback deaktivieren
```

Hinweise:
- Worker-Startargumente werden weiterhin über `OMQ_TEAM_WORKER_LAUNCH_ARGS` geteilt.
- `OMQ_TEAM_WORKER_CLI_MAP` überschreibt `OMQ_TEAM_WORKER_CLI` für Worker-spezifische Auswahl.
- Trigger-Übermittlung verwendet standardmäßig adaptive Wiederholungsversuche (Queue/Submit, dann sicherer Clear-Line+Resend-Fallback bei Bedarf).
- Im Claude-Worker-Modus startet OMQ Worker als einfaches `claude` (keine zusätzlichen Startargumente) und ignoriert explizite `--model` / `--config` / `--effort`-Überschreibungen, sodass Claude die Standard-`settings.json` verwendet.

## Was `omq setup` schreibt

- `.omq/setup-scope.json` (persistierter Setup-Bereich)
- Bereichsabhängige Installationen:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Startverhalten: Wenn der persistierte Bereich `project` ist, verwendet `omq` automatisch `QWEN_HOME=./.qwen` (sofern `QWEN_HOME` nicht bereits gesetzt ist).
- Startanweisungen kombinieren `~/.qwen/AGENTS.md` (bzw. `QWEN_HOME/AGENTS.md`, wenn überschrieben) mit dem Projekt-`./AGENTS.md` und hängen anschließend die Runtime-Überlagerung an.
- Vorhandene `AGENTS.md`-Dateien werden nie stillschweigend überschrieben: Interaktive TTY-Läufe fragen vor dem Ersetzen, nicht-interaktive Läufe überspringen das Ersetzen ohne `--force` (aktive Sitzungs-Sicherheitsprüfungen gelten weiterhin).
- `config.toml`-Aktualisierungen (für beide Bereiche):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP-Server-Einträge (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- Bereichsspezifische `AGENTS.md`
- `.omq/`-Laufzeitverzeichnisse und HUD-Konfiguration

## Agenten und Skills

- Prompts: `prompts/*.md` (installiert nach `~/.qwen/prompts/` für `user`, `./.qwen/prompts/` für `project`)
- Skills: `skills/*/SKILL.md` (installiert nach `~/.qwen/skills/` für `user`, `./.qwen/skills/` für `project`)

Beispiele:
- Agenten: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Projektstruktur

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

## Entwicklung

```bash
git clone https://github.com/Yeachan-Heo/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Dokumentation

- **[Vollständige Dokumentation](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html)** — Kompletter Leitfaden
- **[CLI-Referenz](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#cli-reference)** — Alle `omq`-Befehle, Flags und Tools
- **[Benachrichtigungs-Leitfaden](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#notifications)** — Discord, Telegram, Slack und Webhook-Einrichtung
- **[Empfohlene Workflows](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#workflows)** — Praxiserprobte Skill-Ketten für häufige Aufgaben
- **[Versionshinweise](https://yeachan-heo.github.io/oh-my-qwencode-website/docs.html#release-notes)** — Neuheiten in jeder Version

## Hinweise

- Vollständiges Änderungsprotokoll: `CHANGELOG.md`
- Migrationsleitfaden (nach v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Abdeckungs- und Paritätsnotizen: `COVERAGE.md`
- Hook-Erweiterungs-Workflow: `docs/hooks-extension.md`
- Setup- und Beitragsdetails: `CONTRIBUTING.md`

## Danksagungen

Inspiriert von [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode), angepasst für Qwen Code.

## Lizenz

MIT
