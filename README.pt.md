# oh-my-qwencode (OMQ)

> **Nota:** Este projeto é uma adaptação de [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) para o Qwen Code.

<p align="center">
  
  <br>
  <em>Seu qwen não está sozinho.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[Guia de integração OpenClaw](./docs/openclaw-integration.pt.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

Camada de orquestração multiagente para [Qwen Code](https://github.com/openai/qwen).

## Novidades na v0.9.0 — Spark Initiative

Spark Initiative é a versão que fortalece o caminho nativo de exploração e inspeção no OMQ.

- **Harness nativo para `omq explore`** — executa exploração de repositório somente leitura com uma via em Rust mais rápida e mais restrita.
- **`omq sparkshell`** — superfície nativa voltada ao operador, com resumos de saídas longas e captura explícita de painéis tmux.
- **Assets nativos multiplataforma** — o caminho de hidratação de `omq-explore-harness`, `omq-sparkshell` e `native-release-manifest.json` agora faz parte do pipeline de release.
- **CI/CD reforçado** — adiciona configuração explícita de Rust no job `build`, além de `cargo fmt --check` e `cargo clippy -- -D warnings`.

Veja também as [notas de release da v0.9.0](./docs/release-notes-0.9.0.md) e o [corpo do release](./docs/release-body-0.9.0.md).

## Primeira sessão

Dentro do Qwen Code:

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Do terminal:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Modelo central

OMQ instala e conecta estas camadas:

```text
User
  -> Qwen Code
    -> AGENTS.md (cérebro de orquestração)
    -> ~/.qwen/prompts/*.md (catálogo de prompts de agentes)
    -> ~/.qwen/skills/*/SKILL.md (catálogo de skills)
    -> ~/.qwen/config.toml (funcionalidades, notificações, MCP)
    -> .omq/ (estado de execução, memória, planos, logs)
```

## Comandos principais

```bash
omq                # Iniciar Qwen Code (+ HUD no tmux quando disponível)
omq setup          # Instalar prompts/skills/config por escopo + .omq do projeto + AGENTS.md específico do escopo
omq doctor         # Diagnósticos de instalação/execução
omq doctor --team  # Diagnósticos de Team/swarm
omq team ...       # Iniciar/status/retomar/encerrar workers tmux da equipe
omq status         # Mostrar modos ativos
omq cancel         # Cancelar modos de execução ativos
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (fluxo de trabalho de extensão de plugins)
omq hud ...        # --watch|--json|--preset
omq help
```

## Extensão de Hooks (Superfície adicional)

OMQ agora inclui `omq hooks` para scaffolding e validação de plugins.

- `omq tmux-hook` continua sendo suportado e não foi alterado.
- `omq hooks` é aditivo e não substitui os fluxos de trabalho do tmux-hook.
- Arquivos de plugins ficam em `.omq/hooks/*.mjs`.
- Plugins estão desativados por padrão; ative com `OMQ_HOOK_PLUGINS=1`.

Consulte `docs/hooks-extension.md` para o fluxo de trabalho completo de extensões e modelo de eventos.

## Flags de inicialização

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # apenas para setup
```

`--madmax` mapeia para Qwen Code `--dangerously-bypass-approvals-and-sandbox`.
Use apenas em ambientes sandbox confiáveis ou externos.

### Política de workingDirectory MCP (endurecimento opcional)

Por padrão, as ferramentas MCP de state/memory/trace aceitam o `workingDirectory` fornecido pelo chamador.
Para restringir isso, defina uma lista de raízes permitidas:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Quando definido, valores de `workingDirectory` fora dessas raízes são rejeitados.

## Controle de prompts Qwen Code-First

Por padrão, OMQ injeta:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Isso combina o `AGENTS.md` de `QWEN_HOME` com o `AGENTS.md` do projeto (se existir) e depois adiciona o overlay de runtime.
Estende o comportamento do Qwen Code, mas não substitui nem contorna as políticas centrais do sistema Qwen Code.

Controles:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # desativar injeção de AGENTS.md
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Modo equipe

Use o modo equipe para trabalhos amplos que se beneficiam de workers paralelos.

Ciclo de vida:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Comandos operacionais:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Regra importante: não encerre enquanto tarefas estiverem em estado `in_progress`, a menos que esteja abortando.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Seleção de Worker CLI para workers da equipe:

```bash
OMQ_TEAM_WORKER_CLI=auto    # padrão; usa claude quando worker --model contém "claude"
OMQ_TEAM_WORKER_CLI=qwen   # forçar workers Qwen Code
OMQ_TEAM_WORKER_CLI=claude  # forçar workers Claude CLI
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # mix de CLI por worker (comprimento=1 ou quantidade de workers)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # opcional: desativar fallback adaptativo queue->resend
```

Notas:
- Argumentos de inicialização de workers são compartilhados via `OMQ_TEAM_WORKER_LAUNCH_ARGS`.
- `OMQ_TEAM_WORKER_CLI_MAP` sobrescreve `OMQ_TEAM_WORKER_CLI` para seleção por worker.
- O envio de triggers usa retentativas adaptativas por padrão (queue/submit, depois fallback seguro clear-line+resend quando necessário).
- No modo Claude worker, OMQ inicia workers como `claude` simples (sem argumentos extras de inicialização) e ignora substituições explícitas de `--model` / `--config` / `--effort` para que o Claude use o `settings.json` padrão.

## O que `omq setup` grava

- `.omq/setup-scope.json` (escopo de instalação persistido)
- Instalações dependentes do escopo:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Comportamento de inicialização: se o escopo persistido for `project`, o lançamento do `omq` usa automaticamente `QWEN_HOME=./.qwen` (a menos que `QWEN_HOME` já esteja definido).
- As instruções de inicialização combinam `~/.qwen/AGENTS.md` (ou `QWEN_HOME/AGENTS.md`, quando sobrescrito) com o `./AGENTS.md` do projeto e depois adicionam o overlay de runtime.
- Arquivos `AGENTS.md` existentes nunca são sobrescritos silenciosamente: em TTY interativo o setup pergunta antes de substituir; em modo não interativo a substituição é ignorada, a menos que você use `--force` (verificações de segurança de sessões ativas continuam valendo).
- Atualizações do `config.toml` (para ambos os escopos):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - Entradas de servidores MCP (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- `AGENTS.md` específico do escopo
- Diretórios `.omq/` de execução e configuração do HUD

## Agentes e skills

- Prompts: `prompts/*.md` (instalados em `~/.qwen/prompts/` para `user`, `./.qwen/prompts/` para `project`)
- Skills: `skills/*/SKILL.md` (instalados em `~/.qwen/skills/` para `user`, `./.qwen/skills/` para `project`)

Exemplos:
- Agentes: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skills: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Estrutura do projeto

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

## Desenvolvimento

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Documentação

- **[Documentação completa](./docs/getting-started.html)** — Guia completo
- **[Referência CLI](./docs/getting-started.html#cli-reference)** — Todos os comandos `omq`, flags e ferramentas
- **[Guia de notificações](./docs/getting-started.html#notifications)** — Configuração de Discord, Telegram, Slack e webhooks
- **[Fluxos de trabalho recomendados](./docs/getting-started.html#workflows)** — Cadeias de skills testadas em batalha para tarefas comuns
- **[Notas de versão](./docs/getting-started.html#release-notes)** — Novidades em cada versão

## Notas

- Log de alterações completo: `CHANGELOG.md`
- Guia de migração (pós-v0.4.4 mainline): `docs/migration-mainline-post-v0.4.4.md`
- Notas de cobertura e paridade: `COVERAGE.md`
- Fluxo de trabalho de extensão de hooks: `docs/hooks-extension.md`
- Detalhes de instalação e contribuição: `CONTRIBUTING.md`

## Agradecimentos

Inspirado em [oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode), adaptado para Qwen Code.

## Licença

MIT
