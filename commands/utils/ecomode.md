---
description: "Token-Efficient Mode — route to cheaper models, reduce output verbosity"
---
Activate the **EcoMode** workflow from oh-my-qwencode.

Enable token-efficient operation: route to cheaper models, reduce output verbosity, minimize context budget usage.

## What Changes
- Model routing: prefer standard/spark models over frontier when safe.
- Output: concise, evidence-dense responses only.
- Context: avoid verbose explanations, prefer direct action.
- Verification: use lightweight checks instead of full suites when appropriate.

## When to Use
- Budget constraints.
- Simple tasks that don't need frontier model reasoning.
- Quick fixes, exploration, or straightforward implementation.

Task: {{args}}
