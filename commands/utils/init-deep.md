---
description: "Generate Hierarchical AGENTS.md Files for Scoped Context Injection"
---
Activate the **Init-Deep** workflow from oh-my-qwencode.

Generate hierarchical `AGENTS.md` files throughout the project structure to provide scoped context for agents working at different directory levels.

## Execution Plan
1. **Discovery** — scan project structure, identify modules and components.
2. **Analysis** — determine context boundaries and hierarchy.
3. **Generation** — create AGENTS.md at each level:
   - Root: project overview, architecture, tech stack, conventions
   - Module (src/, lib/): module purpose, patterns, conventions, pitfalls
   - Component (src/components/): component purpose, props, state, styling

## Output
```
## AGENTS.md Generation Complete
### Files Created
- [list of created files]
### Coverage
- N directories with context files
- M patterns documented
- K conventions captured
```

Task: {{args}}
