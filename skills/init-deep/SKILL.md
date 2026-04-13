---
name: init-deep
description: Generate hierarchical AGENTS.md files for scoped context injection at project, module, and component levels
argument-hint: "[path or subdirectory]"
---

<Purpose>
Generate hierarchical `AGENTS.md` files throughout the project structure to provide scoped context for agents working at different directory levels.
</Purpose>

<Use_When>
- The project has no AGENTS.md files and would benefit from scoped context
- The user says "init-deep", "generate agents files", "bootstrap agents context"
- A new module or component directory needs its own agent guidance
- The user wants to set up project-wide agent context hierarchy
</Use_When>

<Do_Not_Use_When>
- AGENTS.md files already exist at the relevant levels
- The project is trivial (single file, no subdirectories)
- The user only needs a single root AGENTS.md (use simpler guidance)
</Do_Not_Use_When>

<Why_This_Exists>
Agents working in different directories benefit from scoped context. A root AGENTS.md provides project-wide guidance, but module-level files capture local conventions, patterns, and pitfalls specific to that area of the codebase.
</Why_This_Exists>

<Execution_Policy>
- Explore the project structure first to understand the hierarchy
- Generate only where context differs — don't duplicate parent-level content
- Keep each AGENTS.md concise and specific to its scope
- Use `omq agents-init` as the underlying mechanism when available
</Execution_Policy>

<Steps>

## Phase 1: Discovery

1. Scan project structure using Glob and exploration tools
2. Identify module boundaries (src/, lib/, components/, services/, etc.)
3. Identify component-level directories that would benefit from scoped context
4. Map the hierarchy:
   ```
   AGENTS.md              (root — project overview)
   ├── src/AGENTS.md      (module — architecture patterns)
   ├── src/components/AGENTS.md (component — UI conventions)
   ├── src/services/AGENTS.md   (module — service patterns)
   └── tests/AGENTS.md    (module — testing conventions)
   ```

## Phase 2: Analysis

For each directory level, determine:

### Root Level
- Project overview and architecture summary
- Tech stack and coding conventions
- Test strategy and tooling
- Directory map and module responsibilities

### Module Level (e.g., src/, lib/)
- Module purpose and key patterns
- Important files and their roles
- Module-specific conventions
- Common pitfalls and gotchas

### Component Level (e.g., src/components/)
- Component purpose and patterns
- State management approach
- Styling and testing conventions
- Props/contract interfaces

## Phase 3: Generation

Generate AGENTS.md at each level. Content should be:
- **Specific to that directory** — don't repeat parent-level content
- **Actionable** — give agents concrete guidance they can apply
- **Concise** — 20-50 lines max, dense with signal

### Root AGENTS.md Template
```markdown
# [Project Name]

## Architecture
[Brief overview of how the project is structured]

## Tech Stack
- [Key technologies]

## Conventions
- [Coding standards]
- [Naming conventions]
- [Import/ordering rules]

## Testing
- [Test framework and conventions]

## Directory Map
- [Key directories and their purposes]
```

### Module AGENTS.md Template
```markdown
# [Module Name]

## Purpose
[What this module does]

## Key Patterns
- [Patterns used here]

## Important Files
- [file.ts] — [role]

## Conventions
- [Module-specific rules]

## Common Pitfalls
- [Things to avoid]
```

## Phase 4: Verification

1. Verify each AGENTS.md has unique, non-redundant content
2. Verify parent-child relationship makes sense (child doesn't repeat parent)
3. Run `omq doctor` to confirm installation health

## Phase 5: Output Report

```
## AGENTS.md Generation Complete

### Files Created
- [list each file created]

### Coverage
- N directories with context files
- M patterns documented
- K conventions captured

Agents working in these directories will automatically load the relevant AGENTS.md for context.
```
</Steps>

<Tool_Usage>
- Use Glob/Grep to discover project structure
- Use Read to understand existing conventions
- Write AGENTS.md files at each level
- Prefer `omq agents-init` when available as the underlying mechanism
</Tool_Usage>

<Final_Checklist>
- [ ] Project structure scanned and understood
- [ ] Module boundaries identified
- [ ] Root AGENTS.md generated (if missing)
- [ ] Module-level AGENTS.md files generated
- [ ] Component-level AGENTS.md files generated where appropriate
- [ ] No redundant content between parent/child levels
- [ ] Each file is concise and specific to its scope
</Final_Checklist>

Task: {{ARGUMENTS}}
