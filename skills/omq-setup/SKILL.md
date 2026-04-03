---
name: omq-setup
description: Setup and configure oh-my-qwencode using current CLI behavior
---

# OMQ Setup

Use this skill when users want to install or refresh oh-my-qwencode for the **current project plus user-level OMQ directories**.

## Command

```bash
omq setup [--force] [--dry-run] [--verbose] [--scope <user|project>]
```

If you only want lightweight `AGENTS.md` scaffolding for an existing repo or subtree, use `omq agents-init [path]` instead of full setup.

Supported setup flags (current implementation):
- `--force`: overwrite/reinstall managed artifacts where applicable
- `--dry-run`: print actions without mutating files
- `--verbose`: print per-file/per-step details
- `--scope`: choose install scope (`user`, `project`)

## What this setup actually does

`omq setup` performs these steps:

1. Resolve setup scope:
   - `--scope` explicit value
   - else persisted `./.omq/setup-scope.json` (with automatic migration of legacy values)
   - else interactive prompt on TTY (default `user`)
   - else default `user` (safe for CI/tests)
2. Create directories and persist effective scope
3. Install prompts, native agent configs, skills, and merge config.toml (scope determines target directories)
4. Verify Team CLI API interop markers exist in built `dist/cli/team.js`
5. Generate project-root `./AGENTS.md` from `templates/AGENTS.md` (or skip when existing and no force)
6. Configure notify hook references and write `./.omq/hud-config.json`

## Important behavior notes

- `omq setup` only prompts for scope when no scope is provided/persisted and stdin/stdout are TTY.
- Local project orchestration file is `./AGENTS.md` (project root).
- If `AGENTS.md` exists and `--force` is not used, interactive TTY runs ask whether to overwrite. Non-interactive runs preserve the file.
- Scope targets:
  - `user`: user directories (`~/.qwen`, `~/.qwen/skills`, `~/.omq/agents`)
  - `project`: local directories (`./.qwen`, `./.qwen/skills`, `./.omq/agents`)
- Migration hint: in `user` scope, if historical `~/.agents/skills` still exists alongside `${QWEN_HOME:-~/.qwen}/skills`, current setup prints a cleanup hint because Qwen Code may show duplicate skill entries until the legacy tree is removed or archived.
- If persisted scope is `project`, `omq` launch automatically uses `QWEN_HOME=./.qwen` unless user explicitly overrides `QWEN_HOME`.
- With `--force`, AGENTS overwrite may still be skipped if an active OMQ session is detected (safety guard).
- Legacy persisted scope values (`project-local`) are automatically migrated to `project` with a one-time warning.

## Recommended workflow

1. Run setup:

```bash
omq setup --force --verbose
```

2. Verify installation:

```bash
omq doctor
```

3. Start Qwen Code with OMQ in the target project directory.

## Expected verification indicators

From `omq doctor`, expect:
- Prompts installed (scope-dependent: user or project)
- Skills installed (scope-dependent: user or project)
- AGENTS.md found in project root
- `.omq/state` exists
- OMQ MCP servers configured in scope target `config.toml` (`~/.qwen/config.toml` or `./.qwen/config.toml`)

## Troubleshooting

- If using local source changes, run build first:

```bash
npm run build
```

- If your global `omq` points to another install, run local entrypoint:

```bash
node bin/omq.js setup --force --verbose
node bin/omq.js doctor
```

- If AGENTS.md was not overwritten during `--force`, stop active OMQ session and rerun setup.
