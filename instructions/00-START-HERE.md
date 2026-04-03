# Oh-My-QwenCode 文档索引

> 完整的文档导航和快速入门指南
<!-- 从这里开始！/ START HERE! -->

## 📚 文档结构

```
instructions/
├── 00-START-HERE.md          # 文档索引和快速入门（从这里开始！）
├── 01-getting-started.md     # 小白使用手册（完整入门指南）
├── features/                 # 功能详细说明书
│   ├── architect.md         # $architect 角色指南
│   ├── executor.md          # $executor 角色指南
│   ├── plan.md              # $plan 工作流指南
│   ├── autopilot.md         # $autopilot 端到端执行
│   ├── ralph.md             # $ralph 持久执行
│   ├── team.md              # $team 团队协作
│   ├── deep-interview.md    # $deep-interview 需求澄清
│   └── cli-commands.md      # CLI 命令参考
└── best-practices/          # 最佳实践案例
    ├── 01-first-project.md  # 第一个 OMQ 项目
    ├── 02-feature-development.md # 功能开发完整流程
    ├── 03-bug-fix.md        # Bug 修复最佳实践
    ├── 04-code-review.md    # 代码审查工作流
    ├── 05-team-collaboration.md # 团队协作开发
    ├── 06-requirements-gathering.md # 需求收集实战
    └── 07-legacy-code.md    # 遗留代码重构
```

---

## 🚀 快速入门

### 5 分钟上手

1. **安装 OMQ**：
   ```bash
   npm install -g oh-my-qwencode
   omq setup
   ```

2. **启动 OMQ**：
   ```bash
   omq --madmax --high
   ```

3. **尝试第一个命令**：
   ```
   $architect "分析这个项目的结构"
   ```

4. **实现一个功能**：
   ```
   $executor "添加一个 Hello World 端点"
   ```

### 30 分钟学习路径

| 时间 | 内容 | 文档 |
|------|------|------|
| 5 分钟 | 安装和启动 | [01-getting-started.md](./01-getting-started.md#安装与配置) |
| 10 分钟 | 理解角色和 Skills | [01-getting-started.md](./01-getting-started.md#核心功能) |
| 15 分钟 | 完成第一个项目 | [best-practices/01-first-project.md](./best-practices/01-first-project.md) |

### 2 小时深入学习

| 时间 | 内容 | 文档 |
|------|------|------|
| 30 分钟 | 阅读功能说明书 | [features/](./features/) |
| 30 分钟 | 学习需求澄清 | [features/deep-interview.md](./features/deep-interview.md) |
| 60 分钟 | 完成一个完整案例 | [best-practices/02-feature-development.md](./best-practices/02-feature-development.md) |

---

## 📖 功能说明书清单

以下是详细的功能说明书，每个文档深入讲解一个功能：

| 文档 | 内容 | 难度 | 阅读时间 |
|------|------|------|---------|
| [architect.md](./features/architect.md) | $architect 角色完整指南 | 入门 | 15 分钟 |
| [executor.md](./features/executor.md) | $executor 角色完整指南 | 入门 | 15 分钟 |
| [plan.md](./features/plan.md) | $plan 工作流完整指南 | 中级 | 20 分钟 |
| [autopilot.md](./features/autopilot.md) | $autopilot 端到端执行 | 中级 | 20 分钟 |
| [ralph.md](./features/ralph.md) | $ralph 持久执行循环 | 中级 | 20 分钟 |
| [team.md](./features/team.md) | $team 团队协作模式 | 进阶 | 25 分钟 |
| [deep-interview.md](./features/deep-interview.md) | $deep-interview 需求澄清 | 中级 | 20 分钟 |
| [cli-commands.md](./features/cli-commands.md) | CLI 命令完整参考 | 入门 | 15 分钟 |
| [skills-explanation.md](./features/skills-explanation.md) | 为什么只安装 24 个 skills | 入门 | 5 分钟 |
| [explore-routing.md](./features/explore-routing.md) | explore 路由决策指南 | 中级 | 10 分钟 |

### 按场景选择文档

**我想分析代码**：
→ [architect.md](./features/architect.md)

**我想实现功能**：
→ [executor.md](./features/executor.md)

**我想规划任务**：
→ [plan.md](./features/plan.md)

**我想端到端执行**：
→ [autopilot.md](./features/autopilot.md)

**我想保证完成**：
→ [ralph.md](./features/ralph.md)

**我想团队协作**：
→ [team.md](./features/team.md)

**我想澄清需求**：
→ [deep-interview.md](./features/deep-interview.md)

**我想查看 CLI 命令**：
→ [cli-commands.md](./features/cli-commands.md)

---

## 🏆 最佳实践案例清单

以下是实际场景中的最佳实践案例，每个案例都是完整的工作流程：

| 案例 | 场景 | 难度 | 预计时间 |
|------|------|------|---------|
| [01-first-project.md](./best-practices/01-first-project.md) | 第一个 OMQ 项目 | 入门 | 60-90 分钟 |
| [02-feature-development.md](./best-practices/02-feature-development.md) | 功能开发完整流程 | 进阶 | 2-3 小时 |
| [03-bug-fix.md](./best-practices/03-bug-fix.md) | Bug 修复最佳实践 | 中级 | 45-60 分钟 |
| [04-code-review.md](./best-practices/04-code-review.md) | 代码审查工作流 | 中级 | 30-45 分钟 |
| [05-team-collaboration.md](./best-practices/05-team-collaboration.md) | 团队协作开发 | 进阶 | 90-120 分钟 |
| [06-requirements-gathering.md](./best-practices/06-requirements-gathering.md) | 需求收集实战 | 中级 | 45-60 分钟 |
| [07-legacy-code.md](./best-practices/07-legacy-code.md) | 遗留代码重构 | 进阶 | 90-120 分钟 |

### 按学习路径选择案例

**新手入门**：
1. [01-first-project.md](./best-practices/01-first-project.md) - 第一个 OMQ 项目
2. [03-bug-fix.md](./best-practices/03-bug-fix.md) - Bug 修复
3. [04-code-review.md](./best-practices/04-code-review.md) - 代码审查

**进阶提升**：
1. [02-feature-development.md](./best-practices/02-feature-development.md) - 功能开发
2. [06-requirements-gathering.md](./best-practices/06-requirements-gathering.md) - 需求收集
3. [07-legacy-code.md](./best-practices/07-legacy-code.md) - 遗留代码重构

**高级应用**：
1. [05-team-collaboration.md](./best-practices/05-team-collaboration.md) - 团队协作

---

## 🎯 按场景查找文档

### 场景 1：我是新手，想学习 OMQ

**学习路径**：
1. [01-getting-started.md](./01-getting-started.md) - 小白使用手册
2. [01-first-project.md](./best-practices/01-first-project.md) - 第一个项目
3. [features/](./features/) - 选择感兴趣的功能文档

### 场景 2：我有一个模糊想法

**工作流程**：
1. [deep-interview.md](./features/deep-interview.md) - 澄清需求
2. [plan.md](./features/plan.md) - 创建计划
3. [autopilot.md](./features/autopilot.md) - 端到端执行

### 场景 3：我需要修复一个 Bug

**工作流程**：
1. [debugger.md](./features/debugger.md) - 定位根因
2. [ralph.md](./features/ralph.md) - 持久修复
3. [03-bug-fix.md](./best-practices/03-bug-fix.md) - 参考案例

### 场景 4：我要开发一个新功能

**工作流程**：
1. [deep-interview.md](./features/deep-interview.md) - 澄清需求（如模糊）
2. [plan --consensus.md](./features/plan.md) - 共识规划（如高风险）
3. [team.md](./features/team.md) - 团队协作（如大型功能）
4. [02-feature-development.md](./best-practices/02-feature-development.md) - 参考案例

### 场景 5：我需要重构遗留代码

**工作流程**：
1. [architect.md](./features/architect.md) - 分析代码
2. [plan --direct.md](./features/plan.md) - 制定计划
3. [ralph.md](./features/ralph.md) - 持久重构
4. [07-legacy-code.md](./best-practices/07-legacy-code.md) - 参考案例

### 场景 6：我想进行代码审查

**工作流程**：
1. [code-review.md](./features/code-review.md) - 全面审查
2. [security-reviewer.md](./features/security-reviewer.md) - 安全审计
3. [quality-reviewer.md](./features/quality-reviewer.md) - 质量检查
4. [04-code-review.md](./best-practices/04-code-review.md) - 参考案例

---

## 🔧 快速参考

### 常用 Skills

| Skill | 用途 | 触发词 |
|-------|------|--------|
| `$architect` | 分析代码架构 | - |
| `$executor` | 实现功能 | - |
| `$plan` | 规划任务 | "plan this", "let's plan" |
| `$autopilot` | 端到端执行 | "autopilot", "build me" |
| `$ralph` | 持久执行 | "ralph", "don't stop" |
| `$team` | 团队协作 | "team", "swarm" |
| `$deep-interview` | 需求澄清 | "deep interview", "interview me" |
| `$code-review` | 代码审查 | "code review" |

### 常用 CLI 命令

| 命令 | 用途 |
|------|------|
| `omq` | 启动 Qwen Code |
| `omq setup` | 安装配置 |
| `omq doctor` | 验证安装 |
| `omq team` | 启动团队 |
| `omq explore` | 探索代码 |

### 配置文件位置

| 文件 | 位置 |
|------|------|
| 主配置 | `~/.qwen/config.toml` |
| OMQ 配置 | `~/.qwen/.omq-config.json` |
| 项目配置 | `<project>/.qwen/config.toml` |
| 状态文件 | `.omq/state/` |
| 计划文件 | `.omq/plans/` |

---

## 📞 获取帮助

### 文档内帮助

- 每个功能说明书都有"常见问题"章节
- 每个最佳实践案例都有"经验总结"章节

### 内置帮助

```bash
# 查看 Skills
/skills

# 查看帮助
$help
```

### 在线资源

- **GitHub**: https://github.com/chrisxue90/oh-my-qwencode
- **Discord**: https://discord.gg/PUwSMR9XNk
- **文档**: https://chrisxue90.github.io/oh-my-qwencode-website/

---

## 📝 文档更新记录

| 日期 | 更新内容 |
|------|---------|
| 2026-04-03 | 初始版本，包含 8 个功能说明书和 7 个最佳实践案例 |

---

## 🎓 学习检查清单

完成以下检查，确认你已经掌握 OMQ：

### 入门级
- [ ] 成功安装 OMQ
- [ ] 运行第一个 `$architect` 命令
- [ ] 运行第一个 `$executor` 命令
- [ ] 完成 [01-first-project.md](./best-practices/01-first-project.md)

### 进阶级
- [ ] 使用 `$deep-interview` 澄清需求
- [ ] 使用 `$plan` 创建计划
- [ ] 使用 `$autopilot` 端到端执行
- [ ] 完成 [02-feature-development.md](./best-practices/02-feature-development.md)

### 高级级
- [ ] 使用 `$team` 协调多智能体
- [ ] 使用 `$ralph` 持久执行
- [ ] 使用 `$code-review` 进行全面审查
- [ ] 完成 [05-team-collaboration.md](./best-practices/05-team-collaboration.md)

---

*最后更新：2026 年 4 月 3 日*
*版本：v0.11.11*
