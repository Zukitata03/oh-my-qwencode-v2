# Oh-My-QwenCode 入门指南

> 从零开始，一步步掌握 OMQ

<!-- omq:generated:getting-started -->

## 欢迎来到 Oh-My-QwenCode 的世界！

你好！欢迎来到 **Oh-My-QwenCode**（简称 **OMQ**）。如果你是一个想要提高编程效率的开发者，或者想要轻松完成代码项目的学习者，那么你来对地方了！

这本手册将带你从零开始，一步步掌握 OMQ 的强大功能。不用担心术语太多，我们会用最简单的方式讲解每一个功能。

---

## 📖 目录

### 第一部分：快速入门
- [什么是 OMQ？](#什么是-omq)
- [安装与配置](#安装与配置)
- [第一次使用 OMQ](#第一次使用-omq)

### 第二部分：核心功能
- [角色智能体](#角色智能体)
- [Skills 工作流](#skills-工作流)
- [自然语言触发](#自然语言触发)

### 第三部分：常用功能详解
- [分析代码：$architect](#分析代码-architect)
- [实现功能：$executor](#实现功能-executor)
- [规划任务：$plan](#规划任务-plan)
- [自动执行：$autopilot](#自动执行-autopilot)
- [持久执行：$ralph](#持久执行-ralph)
- [团队协作：$team](#团队协作-team)
- [深度采访：$deep-interview](#深度采访-deep-interview)

### 第四部分：进阶技巧
- [CLI 命令](#cli-命令)
- [配置系统](#配置系统)
- [状态管理](#状态管理)

### 第五部分：故障排除
- [常见问题](#常见问题)
- [错误处理](#错误处理)

### 附录
- [功能说明书清单](#附录 a-功能说明书清单)
- [最佳实践案例清单](#附录 b-最佳实践案例清单)

---

## 第一部分：快速入门

### 什么是 OMQ？

**Oh-My-QwenCode** 是一个构建在 **Qwen Code** 之上的智能助手层。

想象一下：
- **Qwen Code** 是一个聪明的程序员，可以帮你写代码
- **OMQ** 是一个经验丰富的项目经理，知道如何组织工作、分配任务、保证质量

OMQ 不会替代 Qwen Code，而是让它工作得更好：

| 功能 | Qwen Code | OMQ |
|------|-----------|-----|
| 写代码 | ✅ | ✅（通过 Qwen Code） |
| 角色分工 | ❌ | ✅（33 个专家角色） |
| 工作流 | ❌ | ✅（36 个可复用流程） |
| 状态管理 | ❌ | ✅（持久化进度追踪） |
| 团队协作 | ❌ | ✅（多智能体并行） |

**核心价值**：让 Qwen Code 从"聪明的程序员"变成"高效的开发团队"。

---

### 安装与配置

#### 前置要求

- Node.js 版本 >= 20
- Qwen Code 账号（需要配置认证）
- tmux（macOS/Linux，用于团队模式）

#### 安装步骤

**步骤 1：安装 Qwen Code**

```bash
npm install -g @openai/qwen
```

**步骤 2：安装 OMQ**

```bash
npm install -g oh-my-qwencode
```

**步骤 3：初始化配置**

```bash
omq setup
```

这个命令会自动：
- 安装 33 个角色提示文件
- 安装 24 个核心 Skills 工作流（源码有 36 个，其余是别名/已合并，会自动路由）
- 配置 MCP 服务器
- 生成项目指导文件 AGENTS.md

**步骤 4：验证安装**

```bash
omq doctor
```

看到 ✅ 表示一切正常！

#### 配置 Qwen Code 认证

OMQ 依赖 Qwen Code 的 API。你需要：

1. 访问 [Qwen Code 官网](https://qwen.ai/) 获取 API 密钥
2. 创建或编辑 `~/.qwen/setting.json` 文件
3. 添加你的认证信息

---

### 第一次使用 OMQ

#### 启动 OMQ

推荐启动方式：

```bash
omq --madmax --high
```

参数说明：
- `--madmax`：启用最大性能模式
- `--high`：使用高推理能力的模型

#### 你的第一个任务

启动后，你会进入 Qwen Code 的交互界面。试试这两个命令：

**1. 分析代码**

```
$architect "分析这个项目的认证流程"
```

**2. 规划任务**

```
$plan "安全地实现这个功能"
```

#### 完成工作

当你完成任务后，可以：

```
$cancel
```

这会清理状态并退出当前模式。

---

## 第二部分：核心功能

### 角色智能体

OMQ 提供 **33 个专家角色**，每个角色都有特定的技能和用途。

#### 角色分类

**1. 构建与分析类（7 个）**

| 角色 | 用途 | 示例 |
|------|------|------|
| `$explore` | 快速探索代码库 | `$explore "找出所有 API 端点"` |
| `$analyst` | 提取需求和验收标准 | `$analyst "定义这个功能的范围"` |
| `$planner` | 创建工作计划 | `$planner "规划迁移路径"` |
| `$architect` | 系统架构分析 | `$architect "审查服务边界"` |
| `$debugger` | 根因分析 | `$debugger "调查不稳定的测试"` |
| `$executor` | 实现和重构 | `$executor "添加输入验证"` |
| `$verifier` | 完成度验证 | `$verifier "验证发布准备情况"` |

**2. 审查类（6 个）**

| 角色 | 用途 |
|------|------|
| `$style-reviewer` | 格式和命名约定检查 |
| `$quality-reviewer` | 逻辑和可维护性缺陷 |
| `$api-reviewer` | API 合同和兼容性 |
| `$security-reviewer` | 安全边界和漏洞 |
| `$performance-reviewer` | 性能和复杂度瓶颈 |
| `$code-reviewer` | 全面代码审查 |

**3. 领域专家类（8 个）**

| 角色 | 用途 |
|------|------|
| `$dependency-expert` | 外部 SDK/API/包评估 |
| `$test-engineer` | 测试策略和覆盖率 |
| `$quality-strategist` | 发布质量和风险策略 |
| `$build-fixer` | 构建/工具链/类型问题修复 |
| `$designer` | UI/UX 架构和交互设计 |
| `$writer` | 文档和用户指南 |
| `$qa-tester` | 交互式运行时 QA 验证 |
| `$git-master` | 提交策略和历史整理 |

**4. 产品类（4 个）**

| 角色 | 用途 |
|------|------|
| `$product-manager` | 问题框架和 PRD 定义 |
| `$ux-researcher` | 可用性和可访问性审计 |
| `$information-architect` | 导航、分类和结构 |
| `$product-analyst` | 指标、漏斗和实验 |

**5. 协调类（2 个）**

| 角色 | 用途 |
|------|------|
| `$critic` | 计划和设计的关键挑战 |
| `$vision` | 图像/截图/图表分析 |

**6. 其他专家（6 个）**

| 角色 | 用途 |
|------|------|
| `$code-simplifier` | 代码简化和清理 |
| `$researcher` | 外部文档研究 |
| `$frontend-ui-ux` | 前端 UI/UX 工作流 |
| `$build-fixer` | 构建问题修复 |
| `$security-reviewer` | 安全审计 |
| `$ai-slop-cleaner` | AI 生成代码清理 |

#### 使用角色的最佳实践

1. **选择合适的角色**：根据任务类型选择专家
2. **给出清晰的指令**：角色知道做什么，但需要明确的目标
3. **让角色完成工作**：不要中途打断，除非真正需要

---

### Skills 工作流

**Skills** 是 OMQ 的核心工作流抽象。通过 `$name` 语法调用。

#### Skills 分类

**注意**：以下列出所有 36 个 skills，但实际安装的是 24 个核心 skills。标注为 `alias` 或 `merged` 的 skills 会自动路由到对应的核心 skill，所以你可以使用所有这些名称。

**重要：路由是上下文感知的**

Manifest 中的 alias 是**默认 fallback**，不是强制重定向。Qwen Code 会根据**任务类型**和**上下文**选择最合适的 agent：

```
$analyze 这个 bug       → debugger（调试任务）
$analyze 这段代码       → architect（架构分析）
$analyze 小红书运营     → deep-research（研究探索）
$analyze 用户需求       → analyst（需求澄清）
```

这是智能行为，不是 bug！

**执行模式类（8 个）**

| Skill | 用途 | 触发词 | 状态 |
|-------|------|--------|------|
| `$autopilot` | 端到端自主执行 | "autopilot", "build me" | ✅ 核心 |
| `$ralph` | 持久化循环直到完成 | "ralph", "don't stop" | ✅ 核心 |
| `$ultrawork` | 高吞吐量并行执行 | "ultrawork", "parallel" | ✅ 核心 |
| `$ultraqa` | QA 循环（测试→修复→重复） | "ultraqa" | merged → ralph |
| `$team` | N 个协调智能体 | "team", "swarm" | ✅ 核心 |
| `$ecomode` | 令牌高效模式 | "ecomode", "budget" | merged → ultrawork |
| `$swarm` | 团队兼容模式 | "swarm" | alias → team |
| `$visual-verdict` | 结构化视觉 QA | - | ✅ 核心 |

**规划类（3 个）**

| Skill | 用途 | 触发词 | 状态 |
|-------|------|--------|------|
| `$plan` | 战略规划 | "plan this", "let's plan" | ✅ 核心 |
| `$ralplan` | 共识规划 | "ralplan", "consensus plan" | ✅ 核心 |
| `$deep-interview` | 苏格拉底式深度采访 | "deep interview", "interview me" | ✅ 核心 |

**智能体快捷方式（9 个）**

| Skill | 用途 | 触发词 | 状态 |
|-------|------|--------|------|
| `$analyze` | 深度调查 | "analyze", "investigate" | alias → debugger |
| `$deepsearch` | 彻底代码库搜索 | - | alias → explore |
| `$tdd` | 测试驱动开发 | "tdd", "test first" | alias → test-engineer |
| `$build-fix` | 修复构建错误 | "fix build", "type errors" | alias → build-fixer |
| `$code-review` | 全面代码审查 | "code review" | ✅ 核心 |
| `$security-review` | OWASP 安全审计 | "security review" | ✅ 核心 |
| `$frontend-ui-ux` | 前端 UI/UX 工作流 | - | alias → designer |
| `$git-master` | Git 工作流 | - | alias → git-master |
| `$review` | 通用审查 | - | alias → plan --review |

**工具类（10 个）**

| Skill | 用途 | 触发词 | 状态 |
|-------|------|--------|------|
| `$cancel` | 取消任何活跃模式 | "cancel", "stop" | ✅ 核心 |
| `$doctor` | 验证安装 | - | ✅ 核心 |
| `$help` | 浏览可用技能 | - | ✅ 核心 |
| `$note` | 会话笔记 | - | ✅ 核心 |
| `$trace` | 追踪工具 | - | ✅ 核心 |
| `$skill` | 技能浏览器 | - | ✅ 核心 |
| `$hud` | HUD 状态监控 | - | ✅ 核心 |
| `$omq-setup` | 安装 OMQ 组件 | - | ✅ 核心 |
| `$configure-notifications` | 配置通知 | - | ✅ 核心 |
| `$worker` | 团队工作器协议 | - | internal |
| `$ai-slop-cleaner` | AI 生成代码清理 | - | ✅ 核心 |
| `$web-clone` | URL 驱动的网站克隆 | "web-clone", "clone site" | ✅ 核心 |
| `$ask-claude` | 调用 Claude | - | ✅ 核心 |
| `$ask-gemini` | 调用 Gemini | - | ✅ 核心 |
| `$web-clone` | URL 驱动的网站克隆 | "web-clone", "clone site" |

#### 浏览 Skills

随时可以输入：

```
/skills
```

查看当前可用的所有 Skills。

---

### 自然语言触发

OMQ 支持**自然语言触发 Skills**，无需记忆 `$name` 语法！

#### 触发词对照表

| 你说 | 触发 Skill |
|------|-----------|
| "ralph", "don't stop", "must complete" | `$ralph` |
| "autopilot", "build me", "I want a" | `$autopilot` |
| "ultrawork", "ulw", "parallel" | `$ultrawork` |
| "ultraqa" | `$ultraqa` |
| "analyze", "investigate" | `$analyze` |
| "plan this", "plan the", "let's plan" | `$plan` |
| "interview", "deep interview", "gather requirements" | `$deep-interview` |
| "ralplan", "consensus plan" | `$ralplan` |
| "team", "swarm", "coordinated team" | `$team` |
| "ecomode", "eco", "budget" | `$ecomode` |
| "cancel", "stop", "abort" | `$cancel` |
| "tdd", "test first" | `$tdd` |
| "fix build", "type errors" | `$build-fix` |
| "review code", "code review" | `$code-review` |
| "security review" | `$security-review` |
| "web-clone", "clone site", "copy webpage" | `$web-clone` |

#### 示例

**你说**："我需要深入分析这个性能问题"

**触发**：`$analyze`

**结果**：OMQ 启动深度调查工作流

**你说**："帮我构建一个任务管理应用"

**触发**：`$autopilot`

**结果**：OMQ 端到端执行（需求→设计→实现→测试→验证）

---

## 第三部分：常用功能详解

### 分析代码：$architect

**用途**：分析代码结构、系统边界、架构设计

**何时使用**：
- 理解新代码库
- 审查服务边界
- 评估架构决策
- 识别技术债务

**示例**：

```
$architect "分析认证流程的实现"
$architect "这个微服务架构的边界在哪里？"
$architect "找出所有可能导致性能瓶颈的代码"
```

**输出**：
- 系统组件图
- 数据流分析
- 依赖关系
- 风险点和建议

**最佳实践**：
1. 给出明确的分析范围
2. 指定关注的维度（性能/安全/可维护性）
3. 要求输出可视化图表（如适用）

[📖 详细说明书 → features/architect.md](./features/architect.md)

---

### 实现功能：$executor

**用途**：实现功能、重构代码、修复 bug

**何时使用**：
- 添加新功能
- 重构现有代码
- 修复已知问题
- 优化性能

**示例**：

```
$executor "为这个模块添加错误处理"
$executor "重构这段代码以提高可读性"
$executor "实现用户注册功能"
```

**输出**：
- 修改的代码文件
- 测试用例
- 变更说明

**最佳实践**：
1. 明确功能需求
2. 指定技术约束（如"使用 TypeScript"）
3. 要求包含测试

[📖 详细说明书 → features/executor.md](./features/executor.md)

---

### 规划任务：$plan

**用途**：创建工作计划、需求收集、风险评估

**何时使用**：
- 任务范围不明确
- 需要多阶段执行
- 高风险变更
- 需要团队共识

**工作模式**：

| 模式 | 触发方式 | 行为 |
|------|---------|------|
| 采访模式 | 默认（模糊请求） | 交互式需求收集 |
| 直接模式 | `--direct` | 直接生成计划 |
| 共识模式 | `--consensus` | 多角色审议直到一致 |
| 审查模式 | `--review` | 评估现有计划 |

**示例**：

```
# 采访模式（任务模糊）
$plan "我想做一个任务管理应用"

# 直接模式（任务清晰）
$plan --direct "迁移到 TypeScript"

# 共识模式（高风险）
$plan --consensus "重构核心认证模块"

# 审查模式
$plan --review .omq/plans/migration-plan.md
```

**输出**：
- 需求摘要
- 验收标准
- 实现步骤（含文件引用）
- 风险和缓解措施
- 验证步骤

**最佳实践**：
1. 模糊任务用采访模式
2. 高风险任务用共识模式
3. 计划必须包含可测试的验收标准

[📖 详细说明书 → features/plan.md](./features/plan.md)

---

### 自动执行：$autopilot

**用途**：从想法到完整代码的端到端自主执行

**何时使用**：
- 有清晰的产品想法
- 需要完整的功能实现
- 想放手让系统自动完成
- 任务需要多个阶段（规划→实现→测试→验证）

**执行流程**：

```
Phase 0: 需求扩展 → 详细规格说明书
Phase 1: 规划 → 实现计划（评论家验证）
Phase 2: 执行 → Ralph + Ultrawork 并行实现
Phase 3: QA → 循环直到所有测试通过（最多 5 次）
Phase 4: 验证 → 多视角审查（架构/安全/质量）
Phase 5: 清理 → 清理状态文件
```

**示例**：

```
$autopilot "用 TypeScript 构建一个书店库存管理的 REST API，包含 CRUD 操作"
```

**输出**：
- `.omq/plans/autopilot-spec.md`（规格说明）
- `.omq/plans/autopilot-impl.md`（实现计划）
- 完整的代码实现
- 测试用例
- 验证报告

**最佳实践**：
1. **具体描述领域**："书店" 而不是 "商店"
2. **提及关键功能**："带 CRUD 操作"
3. **指定技术约束**："使用 TypeScript"
4. **让它运行**：避免中途打断

**配置选项**（`~/.qwen/config.toml`）：

```toml
[omq.autopilot]
maxIterations = 10      # 最大迭代次数
maxQaCycles = 5         # 最大 QA 循环
maxValidationRounds = 3 # 最大验证轮数
pauseAfterExpansion = false  # 扩展后暂停
pauseAfterPlanning = false   # 规划后暂停
skipQa = false          # 跳过 QA
skipValidation = false  # 跳过验证
```

[📖 详细说明书 → features/autopilot.md](./features/autopilot.md)

---

### 持久执行：$ralph

**用途**：持久化循环直到任务完成并通过架构师验证

**何时使用**：
- 需要保证完成（不是"尽力而为"）
- 任务可能跨多次迭代
- 需要架构师最终签字
- 用户说"不要停"、"必须完成"

**执行策略**：
1. **审查进度**：检查 TODO 列表和 prior iteration state
2. **并行委托**：将任务分配给专业智能体
   - 简单任务：LOW tier
   - 标准任务：STANDARD tier
   - 复杂任务：THOROUGH tier
3. **后台运行**：构建、安装、测试套件使用 `run_in_background: true`
4. **验证完成**：运行测试/构建，读取输出，确认通过
5. **架构师验证**：
   - <5 文件，<100 行 + 完整测试：STANDARD tier
   - 标准变更：STANDARD tier
   - >20 文件或安全/架构变更：THOROUGH tier
6. **清理**：运行 `/cancel` 清理状态

**示例**：

```
$ralph "修复所有失败的集成测试"
$ralph "实现用户认证功能，必须包含完整的测试覆盖"
```

**输出**：
- 执行进度（持久化在 `.omq/state/`）
- 验证证据（测试/构建输出）
- 架构师批准

**最佳实践**：
1. 明确完成标准
2. 让并行任务真正并行
3. 验证必须有新鲜证据
4. 架构师验证是强制性的

[📖 详细说明书 → features/ralph.md](./features/ralph.md)

---

### 团队协作：$team

**用途**：N 个协调智能体使用 tmux 编排并行执行

**何时使用**：
- 需要 tmux/工作树/共享状态的协作
- 大型任务需要多个智能体并行
- 需要持久化工作会话
- 任务需要显式生命周期控制

**启动方式**：

```bash
# CLI 启动
omq team 3:executor "修复所有失败的测试"

# 混合 CLI 团队（Qwen + Claude）
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude omq team 3:executor "运行验证"

# 会话内启动
$team 2:executor "分析功能 X 并报告问题"
```

**生命周期**：

```
1. 启动团队 → 验证启动证据（团队行、tmux 目标、窗格、ACK 邮箱）
2. 监控进度 → omq team status / omq team resume
3. 等待终端状态 → pending=0, in_progress=0
4. 关闭团队 → omq team shutdown
5. 验证清理 → 状态文件已删除
```

**示例**：

```bash
# 启动 3 个执行者
omq team 3:executor "端到端修复，包含验证"

# 查看状态
omq team status my-team

# 恢复会话
omq team resume my-team

# 关闭
omq team shutdown my-team
```

**环境变量**：

| 变量 | 默认值 | 用途 |
|------|-------|------|
| `OMQ_TEAM_WORKER_CLI` | `auto` | 工作器 CLI 选择器 |
| `OMQ_TEAM_WORKER_CLI_MAP` | - | 每工作器 CLI 映射 |
| `OMQ_TEAM_READY_TIMEOUT_MS` | 45000 | 工作器就绪超时 |
| `OMQ_TEAM_LEADER_NUDGE_MS` | 120000 | 领导者提醒间隔 |

**最佳实践**：
1. 启动前验证 tmux 环境
2. 使用 `omq team status` 监控而非手动干预
3. 等待终端状态再关闭
4. 清理残留窗格

[📖 详细说明书 → features/team.md](./features/team.md)

---

### 深度采访：$deep-interview

**用途**：苏格拉底式深度采访，将模糊想法转化为可执行规格

**何时使用**：
- 请求模糊、缺少验收标准
- 需要避免需求误解
- 想在规划/实现前澄清意图
- 用户说"采访我"、"不要假设"

**深度配置**：

| 配置 | 触发 | 目标阈值 | 最大轮数 |
|------|------|---------|---------|
| 快速 | `--quick` | <= 0.30 | 5 |
| 标准 | `--standard`（默认） | <= 0.20 | 12 |
| 深度 | `--deep` | <= 0.15 | 20 |

**采访流程**：

```
Phase 0: 上下文摄入 → 加载/创建上下文快照
Phase 1: 初始化 → 检测项目类型（绿场/棕场）
Phase 2: 采访循环 → 每轮一个问题，压力测试答案
Phase 3: 挑战模式 → 反对派/简化派/本体派
Phase 4: 结晶 → 输出采访记录和规格说明
Phase 5: 执行桥 → 提供执行选项（$ralplan/$autopilot/$ralph/$team）
```

**澄清维度**：

1. **意图清晰度**（30%）- 为什么用户想要这个
2. **结果清晰度**（25%）- 想要什么最终状态
3. **范围清晰度**（20%）- 变更应该走多远
4. **约束清晰度**（15%）- 技术/业务限制
5. **成功标准清晰度**（10%）- 如何评判完成
6. **上下文清晰度**（10%，棕场专用）- 现有代码库理解

**示例**：

```
# 标准采访
$deep-interview "我想做一个习惯追踪应用"

# 快速采访
$deep-interview --quick "添加缓存层"

# 深度采访
$deep-interview --deep "重构整个认证系统"
```

**输出**：
- `.omq/interviews/{slug}-{timestamp}.md`（采访记录）
- `.omq/specs/deep-interview-{slug}.md`（可执行规格）

**执行桥**：
采访完成后，提供以下选项：

1. **$ralplan**（推荐）- 共识规划
2. **$autopilot** - 直接执行
3. **$ralph** - 持久执行
4. **$team** - 协调并行执行
5. **继续细化** - 进一步采访

**最佳实践**：
1. 每轮只问一个问题
2. 先问意图和边界，再问实现细节
3. 棕场项目先探索代码库再提问
4. 压力测试每个答案（要证据/例子）
5. 非目标和决策边界必须明确

[📖 详细说明书 → features/deep-interview.md](./features/deep-interview.md)

---

## 第四部分：进阶技巧

### CLI 命令

OMQ 提供丰富的命令行工具。

#### 核心命令

| 命令 | 用途 | 示例 |
|------|------|------|
| `omq` | 启动 Qwen Code（带 OMQ 配置） | `omq --madmax --high` |
| `omq setup` | 安装 prompts, skills, 配置 | `omq setup --force` |
| `omq doctor` | 验证安装状态 | `omq doctor` |
| `omq version` | 显示版本信息 | `omq version` |
| `omq status` | 检查活跃模式 | `omq status` |
| `omq cancel` | 取消活跃模式 | `omq cancel` |

#### 团队编排命令

| 命令 | 用途 | 示例 |
|------|------|------|
| `omq team N:agent-type "task"` | 启动 N 个协调工作器 | `omq team 3:executor "fix tests"` |
| `omq team status <name>` | 查看团队状态 | `omq team status my-team` |
| `omq team resume <name>` | 恢复团队会话 | `omq team resume my-team` |
| `omq team shutdown <name>` | 关闭团队 | `omq team shutdown my-team` |
| `omq team api <operation>` | 团队 API 互操作 | `omq team api send-message --json` |

#### 探索与 Sparkshell

| 命令 | 用途 | 示例 |
|------|------|------|
| `omq explore --prompt "..."` | 只读仓库查找 | `omq explore --prompt "find TeamPolicy"` |
| `omq sparkshell <cmd>` | Shell 原生检查 | `omq sparkshell -- rg -n "pattern" src` |
| `omq sparkshell --tmux-pane %ID` | tmux 窗格摘要 | `omq sparkshell --tmux-pane %12 --tail-lines 400` |

#### 其他命令

| 命令 | 用途 |
|------|------|
| `omq agents-init [path]` | 初始化 AGENTS.md |
| `omq hud --watch` | HUD 状态监控 |
| `omq tmux-hook` | tmux 钩子配置 |
| `omq update` | 更新 OMQ 安装 |
| `omq uninstall` | 卸载 OMQ |

[📖 详细说明书 → features/cli-commands.md](./features/cli-commands.md)

---

### 配置系统

#### 配置文件位置

| 文件 | 位置 | 用途 |
|------|------|------|
| 主配置 | `~/.qwen/config.toml` | Qwen Code 配置（含 MCP 服务器） |
| OMQ 配置 | `~/.qwen/.omq-config.json` | OMQ 特定设置 |
| 项目配置 | `<project>/.qwen/config.toml` | 项目级覆盖 |
| AGENTS.md | `<project>/AGENTS.md` | 项目编排大脑 |

#### MCP 服务器配置

OMQ 配置 4 个 MCP 服务器：

```toml
[mcp_servers.omq_state]
command = "node"
args = ["path/to/omq", "mcp", "state"]

[mcp_servers.omq_memory]
command = "node"
args = ["path/to/omq", "mcp", "memory"]

[mcp_servers.omq_code_intel]
command = "node"
args = ["path/to/omq", "mcp", "code-intel"]

[mcp_servers.omq_trace]
command = "node"
args = ["path/to/omq", "mcp", "trace"]
```

#### 模型配置

| 角色 | 模型 | 推理努力 | 用途 |
|------|------|---------|------|
| Frontier (leader) | `qwen3.6-plus` | high | 主要领导者/编排器 |
| Spark (explorer/fast) | `qwen3.5-plus` | low | 快速分类、探索 |
| Standard (subagent default) | `qwen3.6-flash` | high | 默认标准能力模型 |

环境变量覆盖：
- `OMQ_DEFAULT_FRONTIER_MODEL` - 前端默认模型
- `OMQ_DEFAULT_SPARK_MODEL` - 快速默认模型
- `OMQ_TEAM_WORKER_LAUNCH_ARGS` - 团队工作器启动参数

#### Autopilot 配置

```toml
[omq.autopilot]
maxIterations = 10
maxQaCycles = 5
maxValidationRounds = 3
pauseAfterExpansion = false
pauseAfterPlanning = false
skipQa = false
skipValidation = false

[omq.autopilot.pipeline]
maxRalphIterations = 10
workerCount = 2
agentType = "executor"
```

[📖 详细说明书 → features/configuration.md](./features/configuration.md)

---

### 状态管理

#### .omq/ 目录结构

```
.omq/
├── state/          # 模式状态
│   ├── autopilot/
│   ├── ralph/
│   ├── team/
│   └── ...
├── plans/          # 计划文件
│   ├── prd-*.md
│   ├── test-spec-*.md
│   └── autopilot-*.md
├── specs/          # 规格文件
│   └── deep-interview-*.md
├── interviews/     # 采访记录
│   └── {slug}-{timestamp}.md
├── context/        # 上下文快照
│   └── {slug}-{timestamp}.md
├── logs/           # 日志
└── project-memory.json  # 跨会话内存
```

#### 模式生命周期

```
启动 → state_write({active: true, ...})
     → 执行任务
     → state_write({current_phase: "...", ...})
     → 完成 → state_write({active: false, completed_at: "..."})
     → /cancel → state_clear(mode="...")
```

#### 使用 MCP 工具管理状态

```javascript
// 写入状态
state_write({
  mode: "autopilot",
  active: true,
  current_phase: "planning",
  started_at: "<now>"
})

// 读取状态
state_read({mode: "autopilot"})

// 清除状态
state_clear({mode: "autopilot"})
```

[📖 详细说明书 → features/state-management.md](./features/state-management.md)

---

## 第五部分：故障排除

### 常见问题

#### Q1: Qwen Code 未找到

**错误**：`command not found: qwen`

**解决**：
```bash
npm install -g @openai/qwen
```

#### Q2: Slash 命令未出现

**错误**：`/skills` 等命令不工作

**解决**：
```bash
omq setup --force
```

#### Q3: MCP 服务器未连接

**错误**：MCP tools unavailable

**解决**：
1. 检查 `~/.qwen/config.toml` 中 `[mcp_servers.omq_*]` 条目
2. 确认 OMQ 安装路径正确
3. 重启 Qwen Code

#### Q4: 团队模式启动失败

**错误**：`tmux not found`

**解决**：
```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# Windows
winget install psmux
```

#### Q5: 团队启动但领导者未收到 ACK

**检查**：
1. 工作器窗格显示收件箱处理
2. `.omq/state/team/<team>/mailbox/leader-fixed.json` 存在
3. 工作器技能已加载

#### Q6: 关闭后残留工作器窗格

**解决**：
```bash
# 查看窗格
tmux list-panes -F '#{pane_id}\t#{pane_current_command}'

# 手动清理
tmux kill-pane -t %450
rm -rf .omq/state/team/<team-name>
```

#### Q7: Intel Mac CPU 峰值

**现象**：`syspolicyd`/`trustd` CPU 使用率高

**解决**：
```bash
xattr -dr com.apple.quarantine $(which omq)
```
或将终端添加到 macOS 安全设置的 Developer Tools 允许列表

---

### 错误处理

#### 取消模式

**取消 Ralph**：
```bash
/cancel
# 或强制
/cancel --force
```

**取消团队**：
```bash
omq team shutdown <team-name>
# 或
/cancel  # 检测并关闭团队
```

#### 恢复中断的任务

大多数模式支持恢复：

```bash
# Ralph
$ralph "继续之前的任务"

# Autopilot
$autopilot "resume"

# Deep Interview
$deep-interview "继续采访"
```

状态会从 `.omq/state/` 自动恢复。

#### 查看日志

```bash
# 查看模式日志
cat .omq/logs/autopilot.log

# 查看团队日志
cat .omq/state/team/<team>/workers/worker-1/heartbeat.json
```

---

## 附录 A：功能说明书清单

以下是详细的功能说明书，每个文档深入讲解一个功能：

| 文件 | 内容 |
|------|------|
| [features/architect.md](./features/architect.md) | $architect 角色完整指南 |
| [features/executor.md](./features/executor.md) | $executor 角色完整指南 |
| [features/plan.md](./features/plan.md) | $plan 工作流完整指南 |
| [features/autopilot.md](./features/autopilot.md) | $autopilot 端到端执行 |
| [features/ralph.md](./features/ralph.md) | $ralph 持久执行循环 |
| [features/team.md](./features/team.md) | $team 团队协作模式 |
| [features/deep-interview.md](./features/deep-interview.md) | $deep-interview 需求澄清 |
| [features/cli-commands.md](./features/cli-commands.md) | CLI 命令完整参考 |
| [features/configuration.md](./features/configuration.md) | 配置系统详解 |
| [features/state-management.md](./features/state-management.md) | 状态管理详解 |
| [features/agents-catalog.md](./features/agents-catalog.md) | 33 个智能体完整目录 |
| [features/skills-reference.md](./features/skills-reference.md) | 36 个 Skills 完整参考 |

---

## 附录 B：最佳实践案例清单

以下是实际场景中的最佳实践案例：

| 文件 | 场景 |
|------|------|
| [best-practices/01-first-project.md](./best-practices/01-first-project.md) | 第一个 OMQ 项目 |
| [best-practices/02-feature-development.md](./best-practices/02-feature-development.md) | 功能开发完整流程 |
| [best-practices/03-bug-fix.md](./best-practices/03-bug-fix.md) | Bug 修复最佳实践 |
| [best-practices/04-code-review.md](./best-practices/04-code-review.md) | 代码审查工作流 |
| [best-practices/05-team-collaboration.md](./best-practices/05-team-collaboration.md) | 团队协作案例 |
| [best-practices/06-requirements-gathering.md](./best-practices/06-requirements-gathering.md) | 需求收集实战 |
| [best-practices/07-legacy-code.md](./best-practices/07-legacy-code.md) | 遗留代码重构 |
| [best-practices/08-performance-optimization.md](./best-practices/08-performance-optimization.md) | 性能优化案例 |
| [best-practices/09-testing-strategy.md](./best-practices/09-testing-strategy.md) | 测试策略制定 |
| [best-practices/10-deployment-pipeline.md](./best-practices/10-deployment-pipeline.md) | 部署流水线搭建 |

---

## 结语

恭喜你完成了 Oh-My-QwenCode 小白使用手册的学习！

现在你已经掌握了：
- ✅ OMQ 的核心概念和架构
- ✅ 33 个角色智能体的使用方法
- ✅ 36 个 Skills 工作流的触发和应用
- ✅ 自然语言触发的便捷性
- ✅ 常用功能的详细用法
- ✅ 配置和状态管理
- ✅ 故障排除技巧

### 下一步

1. **实践**：用 OMQ 完成一个小项目
2. **探索**：尝试不同的角色和 Skills 组合
3. **分享**：遇到问题？加入 [Discord 社区](https://discord.gg/PUwSMR9XNk)
4. **贡献**：发现可以改进的地方？查看 [CONTRIBUTING.md](../CONTRIBUTING.md)

### 记住

> OMQ 不会替代你的思考，而是让你的思考更高效地转化为代码。

祝你编程愉快！🚀

---

*最后更新：2026 年 4 月 3 日*
*版本：v0.11.11*
