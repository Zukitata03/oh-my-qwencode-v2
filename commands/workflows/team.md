---
description: "Coordinated Parallel Execution — multi-agent team orchestration"
---
Activate the **Team** workflow from oh-my-qwencode.

Coordinate parallel worker agents for large, multi-lane tasks.

## When to Use
- Task is large, multi-lane, or blocker-sensitive enough to justify coordinated parallel execution.
- Multiple independent work streams that benefit from simultaneous execution.
- Task benefits from shared execution context and cross-worker coordination.

## Pipeline
`team-plan → team-prd → team-exec → team-verify → team-fix (loop)`

## Commands
```bash
omq team 3:executor "fix the failing tests with verification"
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

## Requirements
- `tmux` installed on macOS/Linux.
- Clear task definition with acceptance criteria.

Task: {{args}}
