# Hooks Extension (Custom Plugins)

OMQ supports an additive hooks extension point for user plugins under `.omq/hooks/*.mjs`.

> Compatibility guarantee: `omq tmux-hook` remains fully supported and unchanged.
> The new `omq hooks` command group is additive and does **not** replace tmux-hook workflows.

## Quick start

```bash
omq hooks init
omq hooks status
omq hooks validate
omq hooks test
```

This creates a scaffold plugin at:

- `.omq/hooks/sample-plugin.mjs`

## Enablement model

Plugins are **enabled by default**.

Disable plugin dispatch explicitly:

```bash
export OMQ_HOOK_PLUGINS=0
```

Optional timeout tuning (default: 1500ms):

```bash
export OMQ_HOOK_PLUGIN_TIMEOUT_MS=1500
```

## Native event pipeline (v1)

Native events are emitted from existing lifecycle/notify paths:

- `session-start`
- `session-end`
- `turn-complete`
- `session-idle`

Pass one keeps this existing event vocabulary; it does **not** introduce an event-taxonomy redesign.

For clawhip-oriented operational routing, see [Clawhip Event Contract](./clawhip-event-contract.md).

Envelope fields include:

- `schema_version: "1"`
- `event`
- `timestamp`
- `source` (`native` or `derived`)
- `context`
- optional IDs: `session_id`, `thread_id`, `turn_id`, `mode`

## Derived signals (opt-in)

Best-effort derived events are gated and disabled by default.

```bash
export OMQ_HOOK_DERIVED_SIGNALS=1
```

Derived signals include:

- `needs-input`
- `pre-tool-use`
- `post-tool-use`

Derived events are labeled with:

- `source: "derived"`
- `confidence`
- parser-specific context hints

## Team-safety behavior

In team-worker sessions (`OMQ_TEAM_WORKER` set), plugin side effects are skipped by default.
This keeps the lead session as the canonical side-effect emitter and avoids duplicate sends.

## Plugin contract

Each plugin must export:

```js
export async function onHookEvent(event, sdk) {
  // handle event
}
```

SDK surface includes:

- `sdk.tmux.sendKeys(...)`
- `sdk.log.info|warn|error(...)`
- `sdk.state.read|write|delete|all(...)` (plugin namespace scoped)
- `sdk.omq.session.read()`
- `sdk.omq.hud.read()`
- `sdk.omq.notifyFallback.read()`
- `sdk.omq.updateCheck.read()`

`sdk.omq` is intentionally narrow and read-only in pass one. These helpers read the
repo-root `.omq/state/*.json` runtime files for the current workspace.

Compatibility notes:

- `omq tmux-hook` remains a CLI/runtime workflow, not `sdk.omq.tmuxHook.*`
- pass one does not add `sdk.omq.tmuxHook.*`; tmux plugin behavior stays on `sdk.tmux.sendKeys(...)`
- pass one does not add generic `sdk.omq.readJson(...)`, `sdk.omq.list()`, or `sdk.omq.exists()`
- pass one does not add `sdk.pluginState`; keep using `sdk.state`

## Logs

Plugin dispatch and plugin logs are written to:

- `.omq/logs/hooks-YYYY-MM-DD.jsonl`
