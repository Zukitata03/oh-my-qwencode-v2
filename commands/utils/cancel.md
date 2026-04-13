---
description: "Cancel Active Execution Modes"
---
Activate the **Cancel** workflow from oh-my-qwencode.

Cancel all active OMQ execution modes and clean up state.

## What Gets Cancelled
- Ralph persistence loop
- Autopilot pipeline
- Team/swarm orchestration
- Ultrawork parallel execution
- UltraQA cycling
- Any other active mode

## Cleanup
- Clear mode state from `.omq/state/`
- Kill worker panes (if team mode active)
- Report what was cancelled

Usage: `/cancel`

Task: {{args}}
