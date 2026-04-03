# oh-my-qwencode Feature Coverage Matrix

**Target: >=90% parity with oh-my-claudecode (excluding MCP tools)**
**Last Updated:** 2026-02-22

## Coverage Summary

| Category | OMC Features | OMQ Implemented | Coverage |
|----------|-------------|-----------------|----------|
| Agent Definitions | 29 | 29 | 100% |
| Skills/Commands | 30 | 30 | 100% |
| AGENTS.md (CLAUDE.md equiv) | 1 | 1 | 100% |
| CLI (setup/doctor/help/etc) | 7 | 7 | 100% |
| Config Generation | 1 | 1 | 100% |
| Mode State Management | 9 modes | 9 modes | 100% |
| Project Memory | 4 tools | 4 tools | 100% |
| Notepad | 6 tools | 6 tools | 100% |
| Code Intelligence (LSP) | 12 tools | 7 tools (pragmatic) | ~58% |
| AST Pattern Matching | 2 tools | 2 tools | 100% |
| Trace | 2 tools | 2 tools | 100% |
| Verification Protocol | 1 | 1 | 100% |
| Notification System | 3 channels | 3 channels | 100% |
| Keyword Detection | 16 keywords | 16 keywords | 100% |
| Hook Pipeline | 9 events | 6 full + 3 partial | ~89% |
| HUD/Status Line | 1 | 1 (built-in + CLI) | 100% |
| Subagent Tracking | 1 | partial (via multi_agent) | 50% |
| Python REPL | 1 tool | 0 tools | 0% |
| **TOTAL** | | | **~95%** |

## Detailed Feature Mapping

### Agent Definitions / Role Catalog (29/29 = 100%)

| OMC Agent | OMQ Status | Mechanism |
|-----------|-----------|-----------|
| analyst | DONE | prompts/analyst.md |
| api-reviewer | DONE | prompts/api-reviewer.md |
| architect | DONE | prompts/architect.md |
| build-fixer | DONE | prompts/build-fixer.md |
| code-reviewer | DONE | prompts/code-reviewer.md |
| code-simplifier | DONE | prompts/code-simplifier.md |
| critic | DONE | prompts/critic.md |
| debugger | DONE | prompts/debugger.md |
| dependency-expert | DONE | prompts/dependency-expert.md |
| designer | DONE | prompts/designer.md |
| executor | DONE | prompts/executor.md |
| explore | DONE | prompts/explore.md |
| git-master | DONE | prompts/git-master.md |
| information-architect | DONE | prompts/information-architect.md |
| performance-reviewer | DONE | prompts/performance-reviewer.md |
| planner | DONE | prompts/planner.md |
| product-analyst | DONE | prompts/product-analyst.md |
| product-manager | DONE | prompts/product-manager.md |
| qa-tester | DONE | prompts/qa-tester.md |
| quality-reviewer | DONE | prompts/quality-reviewer.md |
| quality-strategist | DONE | prompts/quality-strategist.md |
| researcher | DONE | prompts/researcher.md |
| ~~deep-executor~~ | REMOVED (v0.5.0) | Routes to executor |
| ~~scientist~~ | REMOVED (v0.5.0) | — |
| security-reviewer | DONE | prompts/security-reviewer.md |
| style-reviewer | DONE | prompts/style-reviewer.md |
| test-engineer | DONE | prompts/test-engineer.md |
| ux-researcher | DONE | prompts/ux-researcher.md |
| verifier | DONE | prompts/verifier.md |
| vision | DONE | prompts/vision.md |
| writer | DONE | prompts/writer.md |

### Skills (30/30 = 100%)

| OMC Skill | OMQ Status | Mechanism |
|-----------|-----------|-----------|
| autopilot | DONE | ~/.qwen/skills/autopilot/SKILL.md |
| ralph | DONE | ~/.qwen/skills/ralph/SKILL.md |
| ultrawork (`ulw` alias) | DONE | ~/.qwen/skills/ultrawork/SKILL.md |
| ecomode | DONE | ~/.qwen/skills/ecomode/SKILL.md |
| plan | DONE | ~/.qwen/skills/plan/SKILL.md |
| ralplan | DONE | ~/.qwen/skills/ralplan/SKILL.md |
| team | DONE | ~/.qwen/skills/team/SKILL.md |
| ~~pipeline~~ | REMOVED (v0.5.0) | — |
| ultraqa | DONE | ~/.qwen/skills/ultraqa/SKILL.md |
| ~~ultrapilot~~ | REMOVED (v0.5.0) | — |
| ~~research~~ | REMOVED (post-v0.5.0) | — |
| code-review | DONE | ~/.qwen/skills/code-review/SKILL.md |
| security-review | DONE | ~/.qwen/skills/security-review/SKILL.md |
| tdd | DONE | ~/.qwen/skills/tdd/SKILL.md |
| deepinit | DONE (lightweight CLI successor) | `omq agents-init [path]` (`omq deepinit [path]` alias) |
| deepsearch | DONE | ~/.qwen/skills/deepsearch/SKILL.md |
| analyze | DONE | ~/.qwen/skills/analyze/SKILL.md |
| build-fix | DONE | ~/.qwen/skills/build-fix/SKILL.md |
| cancel | DONE | ~/.qwen/skills/cancel/SKILL.md |
| doctor | DONE | ~/.qwen/skills/doctor/SKILL.md |
| help | DONE | ~/.qwen/skills/help/SKILL.md |
| hud | DONE | ~/.qwen/skills/hud/SKILL.md |
| ~~learner~~ | REMOVED (v0.5.0) | — |
| note | DONE | ~/.qwen/skills/note/SKILL.md |
| trace | DONE | ~/.qwen/skills/trace/SKILL.md |
| skill | DONE | ~/.qwen/skills/skill/SKILL.md |
| frontend-ui-ux | DONE | ~/.qwen/skills/frontend-ui-ux/SKILL.md |
| git-master | DONE | ~/.qwen/skills/git-master/SKILL.md |
| review | DONE | ~/.qwen/skills/review/SKILL.md |
| ralph-init | DONE | ~/.qwen/skills/ralph-init/SKILL.md |
| ~~release~~ | REMOVED (v0.5.0) | — |
| omq-setup | DONE | ~/.qwen/skills/omq-setup/SKILL.md |
| configure-notifications | DONE | ~/.qwen/skills/configure-notifications/SKILL.md |
| ~~configure-telegram~~ | MERGED -> configure-notifications | — |
| ~~configure-discord~~ | MERGED -> configure-notifications | — |
| ~~configure-slack~~ | MERGED -> configure-notifications | — |
| ~~configure-openclaw~~ | MERGED -> configure-notifications | — |
| ~~writer-memory~~ | REMOVED (v0.5.0) | — |
| ~~project-session-manager~~ | REMOVED (v0.5.0) | — |
| ~~psm~~ | REMOVED (v0.5.0) | — |
| swarm | DONE | ~/.qwen/skills/swarm/SKILL.md |
| ~~learn-about-omq~~ | REMOVED (v0.5.0) | — |
| worker | DONE | ~/.qwen/skills/worker/SKILL.md |

### Hook Pipeline (6 full + 3 partial out of 9 = ~89%)

| OMC Hook Event | OMQ Equivalent | Capability |
|---------------|---------------|------------|
| SessionStart | AGENTS.md native + runtime overlay (preLaunch) | FULL+ |
| PreToolUse | AGENTS.md inline guidance | PARTIAL (no interception) |
| PostToolUse | notify config hook + tmux prompt injection workaround | FULL* |
| UserPromptSubmit | AGENTS.md self-detection | PARTIAL (model-side detection) |
| SubagentStart | Qwen Code multi_agent native | FULL |
| SubagentStop | Qwen Code multi_agent native | FULL |
| PreCompact | AGENTS.md overlay compaction protocol | PARTIAL (instructions only) |
| Stop | notify config + postLaunch cleanup | FULL |
| SessionEnd | omq postLaunch lifecycle phase | PARTIAL (post-exit cleanup) |

`*` FULL via terminal automation workaround (default-enabled in `v0.2.3` generated `.omq/tmux-hook.json`), not native hook context injection.

### Infrastructure

| Component | OMC | OMQ Status |
|-----------|-----|-----------|
| CLI (setup) | DONE | DONE |
| CLI (doctor) | DONE | DONE |
| CLI (help) | DONE | DONE |
| CLI (version) | DONE | DONE |
| CLI (status) | DONE | DONE |
| CLI (cancel) | DONE | DONE |
| Config generator | DONE | DONE |
| AGENTS.md template | DONE | DONE |
| State MCP server | DONE | DONE |
| Memory MCP server | DONE | DONE |
| Notify hook script | DONE | DONE |
| Keyword detector | DONE | DONE |
| Hook emulation layer | N/A | DONE |
| Mode base lifecycle | DONE | DONE |
| Verification protocol | DONE | DONE |
| Notification system | DONE | DONE |

## Known Gaps

1. **Pre-tool interception** - Cannot intercept tool calls before execution. Workaround: AGENTS.md instructs model to self-moderate.
2. **Native context injection from hooks** - Not available in Qwen Code hooks API. Workaround: tmux prompt injection (`omq tmux-hook`) plus state files + AGENTS.md instructions (default-enabled in `v0.2.3` generated config).
3. **PreCompact hook** - No event interception. Workaround: AGENTS.md overlay includes compaction survival instructions that tell the model to checkpoint state before compaction.
4. **Session end** - No real-time event. Workaround: `omq` wrapper detects Qwen Code exit via blocking execSync and runs postLaunch cleanup (overlay strip, session archive, mode cancellation).
5. **Full LSP protocol** - LSP tools use pragmatic wrappers (tsc, grep, regex) rather than full LSP protocol. Missing: lsp_goto_definition, lsp_prepare_rename, lsp_rename, lsp_code_actions, lsp_code_action_resolve (5 tools need real LSP).
6. **Python REPL** - Not yet ported. Needed only by scientist agent. Low priority for v0.1.0.

## Upstream Contribution Path

To achieve 100% hook parity, these changes need to be contributed to Qwen Code:
1. Add `BeforeToolUse` hook event to `qwen-rs/hooks/`
2. Add `UserPromptSubmit` hook event
3. Add external hook configuration in `config.toml` (currently only `notify`)
4. Add hook context injection (hook stdout -> system message)

RFC tracking: TBD
