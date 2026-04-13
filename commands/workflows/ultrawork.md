---
description: "Parallel Execution — launch multiple agents simultaneously"
---
Activate the **Ultrawork** workflow from oh-my-qwencode.

Launch independent agents in parallel for high-throughput task completion.

## When to Use
- Multiple independent tasks that don't depend on each other.
- Tasks that benefit from simultaneous execution.
- Large workloads that can be split into parallel lanes.

## Principles
- Fire independent agent calls simultaneously — never wait sequentially.
- Use appropriate model tiers for each subtask complexity.
- Verify each lane independently, then merge results.

Task: {{args}}
