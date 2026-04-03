# Explore 路由决策指南

> 什么时候用 `omq explore`，什么时候用 Qwen Code 原生 Explore 子 agent？

<!-- omq:generated:explore-routing -->

## 核心发现

你说得对！**`omq explore` 和 Qwen Code 原生的 Explore 子 agent 功能确实重叠**。

OMQ 设计了一个**路由系统**来决定使用哪个：

---

## 路由决策流程

```
用户请求探索任务
       ↓
检测任务类型
       ↓
┌──────────────────────────────────────┐
│ 简单查找？                            │
│ - 文件/符号/模式/关系                 │
│ - 只读，不需要修改                    │
│ - 单一目标，范围明确                  │
└──────────────────────────────────────┘
       ↓
   是        否
   ↓         ↓
omq     Qwen Code 原生
explore   Explore 子 agent
```

---

## 详细对比

### `omq explore`（Shell 原生模式）

**定位**：轻量级、低成本的 Shell 命令路由

**特点**：
- ✅ 使用 Shell 命令（rg, grep, find, ls）
- ✅ 无管道、无重定向、无子 Shell
- ✅ Token 消耗极低
- ✅ 快速响应
- ❌ 功能有限（只支持 allowlisted 命令）

**使用场景**：
```bash
# ✅ 适合 omq explore
omq explore --prompt "find auth files"
omq explore --prompt "rg -n TeamPolicy src"
omq explore --prompt "git log --oneline -10"
omq explore --prompt "ls src/"
```

**底层实现**：
- 路由到 `omq sparkshell`（如果符合 Shell 原生条件）
- 或使用 `omq-explore-harness`（Rust 二进制）

---

### Qwen Code 原生 Explore 子 agent

**定位**：丰富的代码库探索，使用 LSP/MCP 工具

**特点**：
- ✅ 语义搜索（LSP）
- ✅ 符号查找（lsp_workspace_symbols）
- ✅ 结构匹配（ast_grep）
- ✅ 深度关系分析
- ❌ Token 消耗较高
- ❌ 响应较慢

**使用场景**：
```
$explore "分析认证模块的架构"
$explore "找出所有使用 JWT 的函数"
$explore "解释用户登录的数据流"
```

**底层实现**：
- 使用 `prompts/explore.md`
- 调用 MCP 工具（LSP、ast_grep、Glob 等）

---

## 路由配置

### 环境变量控制

```bash
# 启用 omq explore 优先（默认）
export USE_OMQ_EXPLORE_CMD=1

# 禁用 omq explore，使用原生路径
export USE_OMQ_EXPLORE_CMD=0
```

### AGENTS.md 中的路由指导

OMQ 在 `AGENTS.md` 中注入了路由指导：

```markdown
**Explore Command Preference:** enabled via `USE_OMQ_EXPLORE_CMD`

- For simple file/symbol lookups, use `omq explore` FIRST
- Keep `omq explore` prompts narrow and concrete
- If `omq explore` fails, fall back to the normal path
```

---

## 决策矩阵

| 任务类型 | 推荐 | 理由 |
|---------|------|------|
| "找出所有 auth 文件" | `omq explore` | 简单文件查找 |
| "搜索 TeamPolicy 引用" | `omq explore` | 符号查找，rg 可以处理 |
| "分析认证数据流" | 原生 Explore | 需要深度关系分析 |
| "解释这个函数如何工作" | 原生 Explore | 需要语义理解 |
| "git log 查看历史" | `omq explore` | Shell 原生，长输出 |
| "找出所有 TODO 注释" | `omq explore` | grep 可以处理 |
| "架构演进分析" | 原生 Explore | 需要综合分析 |

---

## 实际调用顺序

### 场景 1：简单查找

```
用户：找出所有认证文件
       ↓
AGENTS.md 检测：简单查找任务
       ↓
优先推荐：omq explore --prompt "find auth files"
       ↓
omq explore 路由：
  - 检测 "find auth files" → Shell 原生形状
  - 路由到 omq sparkshell
  - 执行：rg -l "auth" src/
       ↓
返回结果：文件列表
```

### 场景 2：深度分析

```
用户：分析认证模块的架构
       ↓
AGENTS.md 检测：复杂分析任务
       ↓
推荐：原生 Explore 子 agent
       ↓
Explore 执行：
  - Glob("**/*auth*.ts")
  - lsp_workspace_symbols("Auth")
  - ast_grep_search("class $NAME")
  - 读取关键文件
       ↓
返回结果：架构分析报告
```

### 场景 3：Shell 命令

```
用户：run rg -n TeamPolicy src
       ↓
omq explore 检测：明确 Shell 命令
       ↓
路由到 omq sparkshell
       ↓
执行：rg -n TeamPolicy src
       ↓
返回结果：带行号的匹配
```

---

## 我的推荐

### 🏆 推荐策略：**分层使用**

```
第一层：omq explore（Shell 原生）
├── 文件查找
├── 文本搜索
├── Git 历史
└── 简单统计

第二层：原生 Explore 子 agent
├── 语义分析
├── 关系映射
├── 架构理解
└── 数据流分析

第三层：$architect（深度分析）
├── 架构决策
├── 权衡分析
└── 技术债务评估
```

### 具体建议

**1. 优先使用 `omq explore` 的情况**：
```bash
# 你知道具体要搜什么
omq explore --prompt "rg -n 'interface.*Service' src"

# 只需要文件列表
omq explore --prompt "find . -name '*.ts' | head -20"

# Git 查询
omq explore --prompt "git log --oneline -- src/auth/"
```

**2. 使用原生 Explore 的情况**：
```
$explore "分析认证模块的依赖关系"
$explore "解释用户登录的完整流程"
$explore "找出所有可能影响性能的代码"
```

**3. 使用 $architect 的情况**：
```
$architect "评估当前认证架构的优缺点"
$architect "这个系统的扩展性如何？"
$architect "识别技术债务和风险点"
```

---

## 配置建议

### 默认配置（推荐）

```bash
# ~/.qwen/config.toml
[env]
USE_OMQ_EXPLORE_CMD = "1"  # 启用 omq explore 优先
```

**优点**：
- ✅ 简单查找更快、更便宜
- ✅ 自动路由到最优路径
- ✅ 保留原生路径作为 fallback

### 禁用 omq explore

```bash
# ~/.qwen/config.toml
[env]
USE_OMQ_EXPLORE_CMD = "0"  # 禁用 omq explore
```

**适用场景**：
- 你更喜欢原生 Explore 的丰富功能
- 你的任务主要是深度分析，不是简单查找
- 你想避免 Shell 路由的复杂性

---

## 故障排除

### Q: omq explore 返回结果不完整

**A**: 切换到原生 Explore：
```
$explore "找出所有认证相关的文件"
```

### Q: 原生 Explore 太慢

**A**: 尝试 omq explore：
```bash
omq explore --prompt "find auth files"
```

### Q: 如何查看当前路由配置

**A**: 检查环境变量：
```bash
echo $USE_OMQ_EXPLORE_CMD
# 输出：1（启用）或 0（禁用）或未设置（默认启用）
```

---

## 总结

### 核心差异

| 特性 | omq explore | 原生 Explore |
|------|------------|-------------|
| **底层** | Shell 命令 | LSP/MCP 工具 |
| **速度** | 快 | 中等 |
| **成本** | 低 | 中等 |
| **功能** | 有限 | 丰富 |
| **适用** | 简单查找 | 深度分析 |

### 最佳实践

1. **简单查找** → `omq explore`
2. **深度分析** → 原生 Explore
3. **架构理解** → $architect
4. **不确定** → 先用 `omq explore`，失败再用原生

### 配置检查清单

- [ ] `USE_OMQ_EXPLORE_CMD` 设置正确
- [ ] 了解两种 explore 的差异
- [ ] 根据任务类型选择合适的工具
- [ ] 知道如何 fallback

---

*最后更新：2026 年 4 月 3 日*
*版本：v0.11.11*
