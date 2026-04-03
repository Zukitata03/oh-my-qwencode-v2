# oh-my-qwencode (OMQ)

> **Remarque :** Ce projet est un port de [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) adapté pour Qwen Code.

<p align="center">
  
  <br>
  <em>Votre qwen n'est pas seul.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[Guide d’intégration OpenClaw](./docs/openclaw-integration.fr.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Couche d'orchestration multi-agents pour [Qwen Code](https://github.com/openai/qwen).

## Nouveautés de la v0.9.0 — Spark Initiative

Spark Initiative est la version qui renforce la voie native d’exploration et d’inspection dans OMQ.

- **Harness natif pour `omq explore`** — exécute l’exploration read-only du dépôt via une voie Rust plus rapide et plus stricte.
- **`omq sparkshell`** — surface native orientée opérateur, avec résumés de sorties longues et capture explicite de panneaux tmux.
- **Artifacts natifs multiplateformes** — le chemin d’hydratation de `omq-explore-harness`, `omq-sparkshell` et `native-release-manifest.json` fait désormais partie du pipeline de release.
- **CI/CD renforcé** — ajoute une configuration explicite de la toolchain Rust dans le job `build`, ainsi que `cargo fmt --check` et `cargo clippy -- -D warnings`.

Voir aussi les [notes de version v0.9.0](./docs/release-notes-0.9.0.md) et le [corps de release](./docs/release-body-0.9.0.md).

## Première session

Dans Qwen Code :

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Depuis le terminal :

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Modèle de base

OMQ installe et connecte ces couches :

```text
User
  -> Qwen Code
    -> AGENTS.md (cerveau d'orchestration)
    -> ~/.qwen/prompts/*.md (catalogue de prompts d'agents)
    -> ~/.qwen/skills/*/SKILL.md (catalogue de skills)
    -> ~/.qwen/config.toml (fonctionnalités, notifications, MCP)
    -> .omq/ (état d'exécution, mémoire, plans, journaux)
```

## Commandes principales

```bash
omq                # Lancer Qwen Code (+ HUD dans tmux si disponible)
omq setup          # Installer prompts/skills/config par scope + .omq du projet + AGENTS.md propre au scope
omq doctor         # Diagnostics d'installation/exécution
omq doctor --team  # Diagnostics Team/Swarm
omq team ...       # Démarrer/statut/reprendre/arrêter les workers d'équipe tmux
omq status         # Afficher les modes actifs
omq cancel         # Annuler les modes d'exécution actifs
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (workflow d'extension de plugins)
omq hud ...        # --watch|--json|--preset
omq help
```

## Extension Hooks (Surface additive)

OMQ inclut désormais `omq hooks` pour l'échafaudage et la validation de plugins.

- `omq tmux-hook` reste supporté et inchangé.
- `omq hooks` est additif et ne remplace pas les workflows tmux-hook.
- Les fichiers de plugins se trouvent dans `.omq/hooks/*.mjs`.
- Les plugins sont désactivés par défaut ; activez-les avec `OMQ_HOOK_PLUGINS=1`.

Consultez `docs/hooks-extension.md` pour le workflow d'extension complet et le modèle d'événements.

## Flags de lancement

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # uniquement pour setup
```

`--madmax` correspond à Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
À utiliser uniquement dans des environnements sandbox de confiance/externes.

### Politique MCP workingDirectory (durcissement optionnel)

Par défaut, les outils MCP état/mémoire/trace acceptent le `workingDirectory` fourni par l'appelant.
Pour restreindre cela, définissez une liste d'autorisation de racines :

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Lorsque défini, les valeurs `workingDirectory` en dehors de ces racines sont rejetées.

## Contrôle Qwen Code-First des prompts

Par défaut, OMQ injecte :

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Cela fusionne le `AGENTS.md` de `QWEN_HOME` avec le `AGENTS.md` du projet (s'il existe), puis ajoute l'overlay d'exécution.
Cela étend le comportement de Qwen Code, mais ne remplace/contourne pas les politiques système de base de Qwen Code.

Contrôles :

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # désactiver l'injection AGENTS.md
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Mode équipe

Utilisez le mode équipe pour les travaux importants qui bénéficient de workers parallèles.

Cycle de vie :

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Commandes opérationnelles :

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Règle importante : n'arrêtez pas tant que des tâches sont encore `in_progress`, sauf en cas d'abandon.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Sélection du CLI worker pour les workers d'équipe :

```bash
OMQ_TEAM_WORKER_CLI=auto    # par défaut ; utilise claude quand worker --model contient "claude"
OMQ_TEAM_WORKER_CLI=qwen   # forcer les workers Qwen Code
OMQ_TEAM_WORKER_CLI=claude  # forcer les workers Claude CLI
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # mix CLI par worker (longueur=1 ou nombre de workers)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # optionnel : désactiver le fallback adaptatif queue->resend
```

Notes :
- Les arguments de lancement des workers sont toujours partagés via `OMQ_TEAM_WORKER_LAUNCH_ARGS`.
- `OMQ_TEAM_WORKER_CLI_MAP` remplace `OMQ_TEAM_WORKER_CLI` pour la sélection par worker.
- La soumission de déclencheurs utilise par défaut des tentatives adaptatives (queue/submit, puis fallback sécurisé clear-line+resend si nécessaire).
- En mode worker Claude, OMQ lance les workers en tant que simple `claude` (pas d'arguments de lancement supplémentaires) et ignore les surcharges explicites `--model` / `--config` / `--effort` pour que Claude utilise le `settings.json` par défaut.

## Ce que `omq setup` écrit

- `.omq/setup-scope.json` (scope de setup persisté)
- Installations dépendantes du scope :
  - `user` : `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project` : `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Comportement au lancement : si le scope persisté est `project`, le lancement `omq` utilise automatiquement `QWEN_HOME=./.qwen` (sauf si `QWEN_HOME` est déjà défini).
- Les instructions de lancement fusionnent `~/.qwen/AGENTS.md` (ou `QWEN_HOME/AGENTS.md` s'il est redéfini) avec `./AGENTS.md` du projet, puis ajoutent l'overlay d'exécution.
- Les fichiers `AGENTS.md` existants ne sont jamais écrasés silencieusement : en TTY interactif, setup demande avant de remplacer ; en non-interactif, le remplacement est ignoré sauf avec `--force` (les vérifications de sécurité de session active s'appliquent toujours).
- Mises à jour de `config.toml` (pour les deux scopes) :
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Entrées de serveurs MCP (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- `AGENTS.md` spécifique au scope
- Répertoires d'exécution `.omq/` et configuration HUD

## Agents et Skills

- Prompts : `prompts/*.md` (installés dans `~/.qwen/prompts/` pour `user`, `./.qwen/prompts/` pour `project`)
- Skills : `skills/*/SKILL.md` (installés dans `~/.qwen/skills/` pour `user`, `./.qwen/skills/` pour `project`)

Exemples :
- Agents : `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills : `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Structure du projet

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

## Développement

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Documentation

- **[Documentation complète](./docs/getting-started.html)** — Guide complet
- **[Référence CLI](./docs/getting-started.html#cli-reference)** — Toutes les commandes `omq`, flags et outils
- **[Guide des notifications](./docs/getting-started.html#notifications)** — Configuration Discord, Telegram, Slack et webhooks
- **[Workflows recommandés](./docs/getting-started.html#workflows)** — Chaînes de skills éprouvées pour les tâches courantes
- **[Notes de version](./docs/getting-started.html#release-notes)** — Nouveautés de chaque version

## Notes

- Journal des modifications complet : `CHANGELOG.md`
- Guide de migration (post-v0.4.4 mainline) : `docs/migration-mainline-post-v0.4.4.md`
- Notes de couverture et parité : `COVERAGE.md`
- Workflow d'extension hooks : `docs/hooks-extension.md`
- Détails de configuration et contribution : `CONTRIBUTING.md`

## Remerciements

Inspiré par [oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode), adapté pour Qwen Code.

## Licence

MIT
