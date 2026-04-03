# Skills 安装说明

> 为什么源码有 36 个 skills，但只安装了 24 个？

<!-- omq:generated:skills-explanation -->

## 概述

OMQ 源码中确实有 **36 个 skills**，但 `omq setup` 只安装 **24 个核心 skills**。这是设计行为，不是 bug。

**重要区别**：
- **Skills**：工作流命令（如 `$autopilot`, `$ralph`, `$plan`），安装在 `~/.qwen/skills/`
- **Agents/Prompts**：角色提示（如 `$debugger`, `$architect`, `$executor`），安装在 `~/.qwen/prompts/`

`$analyze` 路由到 `$debugger`（agent），不是 skill。

---

## Skills 状态分类

OMQ 使用 [manifest.json](../src/catalog/manifest.json) 来管理 skills 的状态：

| 状态 | 数量 | 说明 | 是否安装 |
|------|------|------|---------|
| `active` | 24 | 核心 skills，独立功能 | ✅ 安装 |
| `internal` | 1 | 内部使用（worker） | ✅ 安装 |
| `alias` | 8 | 别名，路由到其他 skill | ❌ 不安装 |
| `merged` | 7 | 已合并到其他 skill | ❌ 不安装 |

**总计**：36 个 skills，25 个会安装（24 active + 1 internal）

---

## 已安装的 24 个核心 skills

### 执行模式类（5 个）
- `autopilot` - 端到端自主执行
- `ralph` - 持久执行循环
- `ultrawork` - 高吞吐量并行
- `team` - 团队协作编排
- `visual-verdict` - 结构化视觉 QA

### 规划类（3 个）
- `plan` - 战略规划
- `ralplan` - 共识规划
- `deep-interview` - 深度采访

### 快捷方式类（3 个）
- `code-review` - 代码审查
- `security-review` - 安全审查
- `ai-slop-cleaner` - AI 代码清理

### 工具类（13 个）
- `cancel` - 取消模式
- `doctor` - 验证安装
- `help` - 浏览技能
- `note` - 会话笔记
- `trace` - 追踪工具
- `skill` - 技能浏览器
- `hud` - HUD 状态监控
- `omq-setup` - 安装 OMQ
- `configure-notifications` - 配置通知
- `worker` - 团队工作器（internal）
- `web-clone` - 网站克隆
- `ask-claude` - 调用 Claude
- `ask-gemini` - 调用 Gemini

---

## 未安装的 12 个 skills（别名/已合并）

### Alias（别名，8 个）

这些 skills 会自动路由到其他 skill 或 agent：

| Skill | 路由到 | 类型 | 说明 |
|------|--------|------|------|
| `analyze` | `debugger` | Agent | 深度调查 |
| `deepsearch` | `explore` | Agent | 代码库搜索 |
| `tdd` | `test-engineer` | Agent | 测试驱动开发 |
| `build-fix` | `build-fixer` | Agent | 修复构建错误 |
| `frontend-ui-ux` | `designer` | Agent | 前端 UI/UX |
| `git-master` | `git-master` | Agent | Git 工作流（自引用） |
| `review` | `plan --review` | Skill | 通用审查 |
| `swarm` | `team` | Skill | 团队协作（别名） |

### Merged（已合并，7 个）

这些 skills 已合并到其他 skills：

| Skill | 合并到 | 说明 |
|------|--------|------|
| `ecomode` | `ultrawork` | 令牌高效模式 |
| `ultraqa` | `ralph` | QA 循环 |
| `configure-discord` | `configure-notifications` | Discord 通知 |
| `configure-telegram` | `configure-notifications` | Telegram 通知 |
| `configure-slack` | `configure-notifications` | Slack 通知 |
| `configure-openclaw` | `configure-notifications` | OpenClaw 通知 |
| `ralph-init` | `plan` | Ralph PRD 模式 |

---

## 使用影响

### ✅ 你可以使用所有 36 个 skill 名称

即使某些 skills 未安装，你仍然可以在对话中使用它们的名称：

```
$analyze "调查这个 bug"      # 自动路由到 $debugger
$ecomode "优化 token 使用"    # 自动路由到 $ultrawork
$swarm "团队协作"            # 自动路由到 $team
```

### 🔧 路由机制

OMQ 的 keyword detection 系统会自动将这些别名路由到对应的核心 skill：

1. 用户输入 `$analyze "..."`
2. 系统检查 manifest，发现 `analyze` 是 `alias → debugger`
3. 自动调用 `$debugger "..."`

### 📋 查看已安装的 skills

```bash
# 查看已安装的 skills
ls ~/.qwen/skills/

# 使用 doctor 验证
omq doctor
```

---

## 为什么这样设计？

### 1. **减少冗余**

多个 skills 实现相同功能会导致：
- 维护成本增加
- 用户混淆
- 文档分散

### 2. **统一入口**

通过别名机制，用户可以使用熟悉的名称，但实际执行统一：
- 便于升级和迁移
- 便于 bug 修复
- 便于功能增强

### 3. **向后兼容**

旧的 skill 名称仍然可用（作为 alias），不会破坏现有工作流：
- 老用户不受影响
- 新用户学习更简单的结构
- 平滑迁移路径

---

## 验证你的安装

```bash
# 运行 doctor
omq doctor

# 期望输出：
# [OK] Skills: 24 skills installed
```

如果显示的数量不对，可以重新运行 setup：

```bash
omq setup --force
```

---

## Agents/Prompts 说明

**Agents**（也叫 Prompts）是角色提示文件，安装在 `~/.qwen/prompts/`。

### 已安装的 33 个 agents

OMQ 有 33 个 agent prompts，全部都会安装：

**构建与分析类（7 个）**：
- `explore` - 快速探索代码
- `analyst` - 需求分析
- `planner` - 计划制定
- `architect` - 架构分析
- `debugger` - 调试和根因分析
- `executor` - 功能实现
- `verifier` - 完成验证

**审查类（6 个）**：
- `style-reviewer` - 风格审查
- `quality-reviewer` - 质量审查
- `api-reviewer` - API 审查
- `security-reviewer` - 安全审查
- `performance-reviewer` - 性能审查
- `code-reviewer` - 全面代码审查

**领域专家类（8 个）**：
- `dependency-expert` - 依赖评估
- `test-engineer` - 测试工程
- `quality-strategist` - 质量策略
- `build-fixer` - 构建修复
- `designer` - UI/UX 设计
- `writer` - 文档写作
- `qa-tester` - QA 测试
- `git-master` - Git 专家

**产品类（4 个）**：
- `product-manager` - 产品管理
- `ux-researcher` - UX 研究
- `information-architect` - 信息架构
- `product-analyst` - 产品分析

**协调类（2 个）**：
- `critic` - 批评和挑战
- `vision` - 视觉分析

**其他（6 个）**：
- `code-simplifier` - 代码简化
- `researcher` - 研究
- `team-executor` - 团队执行（internal）
- `team-orchestrator` - 团队编排
- `explore-harness` - 探索工具
- `sisyphus-lite` - 持久执行

### 使用 Agents

```
$debugger "调查这个 bug 的根因"
$architect "分析系统架构"
$executor "实现这个功能"
```

---

## 常见问题

### Q: `$debugger` 是哪个 skill？我没见到

**A**: `$debugger` 不是 skill，是一个 **agent prompt**！

- **位置**：`~/.qwen/prompts/debugger.md`
- **用途**：调试和根因分析
- **使用方式**：`$debugger "调查这个 bug"`

`$analyze` 是 alias，会自动路由到 `$debugger` agent。

### Q: Skills 和 Agents 有什么区别？

**A**:
| 特性 | Skills | Agents/Prompts |
|------|--------|---------------|
| 类型 | 工作流命令 | 角色提示 |
| 安装位置 | `~/.qwen/skills/` | `~/.qwen/prompts/` |
| 数量 | 24 个核心 | 33 个全部安装 |
| 示例 | `$autopilot`, `$ralph` | `$debugger`, `$architect` |
| 文件 | `SKILL.md` | `.md` |

### Q: 我可以用 `$analyze` 吗？

**A**: 可以！但路由是**上下文感知**的，不是静态的。

**重要说明：路由是动态的**

Manifest 中的 alias（如 `analyze → debugger`）是**默认 fallback**，不是强制重定向。

Qwen Code 会根据**任务类型**和**上下文**选择最合适的 agent：

| 你说 | 任务类型 | 实际路由 |
|------|---------|---------|
| `$analyze 这个 bug` | 调试 | → `debugger` ✅ |
| `$analyze 这段代码` | 架构分析 | → `architect` 或 `explore` ✅ |
| `$analyze 小红书运营` | 研究探索 | → `deep-research` ✅ |
| `$analyze 用户需求` | 需求澄清 | → `analyst` ✅ |

**为什么这样设计？**

- **智能路由**：根据任务语义选择最佳 agent，而不是机械重定向
- **上下文感知**：考虑对话历史和当前目标
- **灵活性**：同一个词在不同场景下路由到不同专家

**结论**：
- Manifest alias 是**提示**，不是**规则**
- Qwen Code 会动态选择最合适的 agent
- 这是智能行为，不是 bug

### Q: 为什么有些文档说 36 个 skills？

**A**: 源码中确实有 36 个 skill 目录，但实际安装的是 24 个核心 skills。

### Q: 我可以手动安装所有 36 个吗？

**A**: 不推荐。alias 和 merged skills 是故意不安装的，手动安装可能导致冲突。

### Q: 如何查看某个 skill 的路由？

**A**: 查看 [manifest.json](../src/catalog/manifest.json) 中的 `canonical` 字段。

---

## 相关文件

- [manifest.json](../src/catalog/manifest.json) - Skills 状态定义
- [setup.ts](../src/cli/setup.ts) - 安装逻辑
- [01-getting-started.md](../01-getting-started.md) - 入门指南

---

*最后更新：2026 年 4 月 3 日*
*版本：v0.11.11*
