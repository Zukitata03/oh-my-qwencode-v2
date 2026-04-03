# $ralph 持久执行循环指南

> 不完成任务绝不罢休的 persistence 引擎

<!-- omq:generated:skill-doc -->

## 概述

`$ralph` 是 OMQ 中的**持久化执行循环**工作流。它包装 Ultrawork 的并行执行，添加：

- 会话持久化（跨迭代状态保存）
- 自动重试（失败后继续）
- 强制验证（完成前必须验证）
- 架构师签字（质量把关）

核心承诺：**不完成任务绝不罢休**。

---

## 核心能力

### 1. 持久化循环

```
迭代 1: 部分完成 → 继续
迭代 2: 测试失败 → 修复 → 继续
迭代 3: 验证通过 → 完成
```

状态保存在 `.omq/state/ralph/`，可随时恢复。

### 2. 并行委托

同时委托多个独立任务：

```
delegate(executor, LOW, "添加类型导出")
delegate(executor, STANDARD, "实现缓存层")
delegate(executor, THOROUGH, "重构认证模块")
```

### 3. 分层验证

根据变更规模选择验证层级：

| 规模 | 验证层级 | 要求 |
|------|---------|------|
| <5 文件，<100 行 + 完整测试 | STANDARD | 架构师角色 |
| 标准变更 | STANDARD | 架构师角色 |
| >20 文件或安全/架构变更 | THOROUGH | 架构师角色 |

### 4. 强制验证

完成前必须：
1. 运行测试 → 全部通过
2. 运行构建 → 成功
3. 运行 lint → 无错误
4. 架构师验证 → 批准

### 5. Deslop 清理（v0.8+）

完成后自动运行 AI 代码清理：
- 作用域：仅限 Ralph 会话中修改的文件
- 模式：标准清理（非审查模式）
- 回归验证：清理后重新运行测试

---

## 使用场景

### ✅ 适合使用 $ralph 的场景

| 场景 | 示例指令 |
|------|---------|
| 需要保证完成 | `$ralph "修复所有失败测试"` |
| 跨多次迭代 | `$ralph "实现用户认证系统"` |
| 需要架构师签字 | `$ralph "重构核心模块"` |
| 用户说"不要停" | `$ralph "完成这个功能，不要停"` |
| 持久执行压力 | `$ralph "必须完成"` |

### ❌ 不适合使用 $ralph 的场景

| 场景 | 推荐替代 |
|------|---------|
| 端到端自主执行 | `$autopilot` |
| 探索/规划 | `$plan` |
| 快速修复 | `$executor` |
| 手动控制完成 | `$ultrawork` |

---

## 工作流程

### Step 0: 上下文摄入

**目标**：建立 grounded context

**流程**：
```
1. 派生任务 slug
2. 加载/创建上下文快照
   - 路径：`.omq/context/{slug}-{timestamp}.md`
   - 内容：任务声明、期望结果、已知事实、约束、未知问题

3. 高模糊度检测
   - 高模糊 → 运行 $deep-interview --quick
   - 清晰 → 继续

4. 记录上下文路径到 Ralph 状态
```

### Step 1: 审查进度

**目标**：了解当前状态

**流程**：
```
1. 读取 TODO 列表
2. 读取 prior iteration state
3. 识别已完成/未完成/阻塞任务
```

### Step 2: 继续未完成任务

**目标**：从上次停止处继续

**流程**：
```
1. 优先处理阻塞任务
2. 继续进行中的任务
3. 添加新发现的任务
```

### Step 3: 并行委托

**目标**：高效分配工作

**流程**：
```
1. 任务分类
   - 简单查找 → LOW tier
   - 标准实现 → STANDARD tier
   - 复杂分析 → THOROUGH tier

2. 并行委托（同时发出）
   ```
   delegate(executor, LOW, "查找认证实现")
   delegate(executor, STANDARD, "添加错误处理")
   delegate(executor, THOROUGH, "调试竞态条件")
   ```

3. 后台运行长操作
   ```
   delegate(executor, STANDARD, "npm install", {background: true})
   delegate(executor, STANDARD, "npm run build", {background: true})
   ```

### Step 4: 视觉任务门控（如适用）

**目标**：视觉参考比对

**触发条件**：存在截图/参考图像

**流程**：
```
1. 运行 $visual-verdict
2. 要求结构化 JSON 输出：
   - score（0-100）
   - verdict（PASS/FAIL）
   - differences[]
   - suggestions[]
3. 持久化 verdict 到 `.omq/state/{scope}/ralph-progress.json`
4. 默认通过阈值：score >= 90
5. 在下一次编辑前重复运行
```

### Step 5: 验证完成

**目标**：用新鲜证据验证完成

**流程**：
```
1. 识别验证命令
   - 测试：npm test
   - 构建：npm run build
   - Lint: npm run lint
   - 类型检查：tsc --noEmit

2. 运行验证
3. 读取输出 → 确认通过
4. 检查 TODO 列表
   - pending = 0
   - in_progress = 0
```

### Step 6: 架构师验证

**目标**：质量把关

**流程**：
```
1. 选择验证层级
   - <5 文件，<100 行 + 完整测试 → STANDARD
   - 标准变更 → STANDARD
   - >20 文件或安全/架构 → THOROUGH

2. 委托架构师
   ```
   delegate(architect, STANDARD, "验证实现")
   ```

3. 等待批准
   - APPROVED → Step 7
   - REJECTED → 修复问题 → 返回 Step 5
```

### Step 7: Deslop 清理（可选跳过）

**目标**：清理 AI 生成代码

**流程**：
```
1. 识别 Ralph 会话中修改的文件
2. 运行 ai-slop-cleaner（标准模式）
   - 作用域：仅限 Ralph 修改的文件
   - 不扩展到无关文件

3. 回归验证
   - 重新运行测试
   - 重新运行构建
   - 确认仍然通过

4. 回归失败 → 回滚或修复 → 重新验证
```

### Step 8: 清理退出

**目标**：清理状态

**流程**：
```
1. 运行 `/cancel`
2. 或手动清理：
   state_clear("ralph")
```

---

## 输出结构

### 进度报告（每轮迭代）

```markdown
## Ralph 迭代 3/10

### 本轮完成
- ✅ 实现用户注册 API
- ✅ 添加密码验证
- ✅ 编写单元测试

### 待完成任务
- ⏳ 邮箱验证流程
- ⏳ 登录功能

### 验证状态
- 测试：42/42 通过 ✅
- 构建：成功 ✅
- Lint: 无警告 ✅
```

### 验证报告

```markdown
## 验证报告

### 测试运行
```
$ npm test
> 42 passed, 0 failed
```

### 构建运行
```
$ npm run build
> Build succeeded
```

### Lint 运行
```
$ npm run lint
> No lint errors
```

### 类型检查
```
$ tsc --noEmit
> 0 errors
```

### 架构师验证
委托：architect @ STANDARD tier
结果：APPROVED
理由：实现完整，测试覆盖充分，代码质量良好
```

### 完成报告

```markdown
## Ralph 完成报告

### 任务状态
- 原始需求：100% 满足
- TODO 列表：0 pending, 0 in_progress

### 验证证据
- 测试：53/53 通过 ✅
- 构建：成功 ✅
- Lint: 无警告 ✅
- 类型检查：0 错误 ✅
- 架构师验证：APPROVED ✅

### Deslop 清理
- 清理文件：12 个
- 回归测试：通过 ✅

### 修改文件
新增：
- src/auth/register.ts
- src/auth/login.ts
- src/validators/password.ts
- tests/auth/**/*.test.ts

修改：
- src/routes/index.ts
- src/models/User.ts

### 状态清理
- `/cancel` 已运行
- `.omq/state/ralph/` 已清理
```

---

## 最佳实践

### 1. 明确完成标准

❌ **模糊**：
```
$ralph "修复测试"
```

✅ **清晰**：
```
$ralph "修复所有失败的集成测试，必须 100% 通过"
```

### 2. 让并行任务真正并行

❌ **串行**：
```
delegate(task1) → 等待 → delegate(task2) → 等待
```

✅ **并行**：
```
delegate(task1)
delegate(task2)
delegate(task3)
# 同时发出，等待全部完成
```

### 3. 验证必须有新鲜证据

❌ **假设**：
```
"测试应该都过了"
```

✅ **证据**：
```
运行：npm test
输出：42 passed, 0 failed
```

### 4. 架构师验证是强制的

```
不要跳过架构师验证
即使测试都通过也要验证
```

### 5. 使用 --no-deslop 跳过清理

```
$ralph --no-deslop "紧急修复"  # 跳过清理
```

---

## 配置选项

### PRD 模式（可选）

使用 `--prd` 标志创建产品需求文档：

```
$ralph --prd "构建一个待办事项应用"
```

**流程**：
```
1. 运行 $deep-interview --quick
2. 创建 PRD：`.omq/plans/prd-{slug}.md`
3. 创建进度账本：`.omq/state/{scope}/ralph-progress.json`
4. 分解为用户故事
5. 开始 Ralph 循环
```

**PRD 格式**：
```json
{
  "project": "Todo App",
  "branchName": "ralph/todo-app",
  "description": "React + TypeScript 待办事项应用",
  "userStories": [
    {
      "id": "US-001",
      "title": "创建任务",
      "description": "用户可以创建新任务",
      "acceptanceCriteria": ["表单验证", "持久化", "Typecheck 通过"],
      "priority": 1,
      "passes": false
    }
  ]
}
```

### 视觉参考标志

```
$ralph -i refs/hn.png "克隆 HackerNews 布局"
$ralph --images-dir ./screenshots "匹配设计"
```

### 后台执行规则

**后台运行**（`run_in_background: true`）：
- 包安装（npm install）
- 构建过程（make, build）
- 测试套件
- Docker 操作

**前台运行**：
- 快速状态检查（git status, ls）
- 文件读写
- 简单命令

---

## 实际案例

### 案例 1：修复失败测试

**指令**：
```
$ralph "修复所有失败的集成测试，必须 100% 通过"
```

**执行摘要**：
```markdown
## 迭代 1/10

### 发现问题
- 测试失败：12/50
- 失败原因：数据库连接超时

### 修复
- 增加超时时间：1000ms → 5000ms
- 添加重试逻辑

### 验证
- 测试：38/50 通过（进步，但仍有 12 个失败）

## 迭代 2/10

### 发现问题
- 剩余 12 个失败：认证相关测试

### 修复
- 修复 JWT token 生成逻辑
- 添加 mock 用户

### 验证
- 测试：50/50 通过 ✅

## 架构师验证

委托：architect @ STANDARD tier
结果：APPROVED

## 完成

- 测试：50/50 通过 ✅
- 构建：成功 ✅
- 清理：完成 ✅
```

### 案例 2：实现用户认证

**指令**：
```
$ralph "实现完整的用户认证系统，包含注册、登录、密码重置"
```

**执行摘要**：
```markdown
## 迭代 1/10

### 完成
- 用户注册 API
- 密码哈希（bcrypt）
- JWT token 生成

### 待完成
- 登录功能
- 密码重置
- 邮箱验证

## 迭代 2/10

### 完成
- 登录 API
- Token 验证中间件
- 用户会话管理

### 待完成
- 密码重置
- 邮箱验证

## 迭代 3/10

### 完成
- 密码重置流程
- 重置 token 生成
- 重置邮件发送

### 待完成
- 邮箱验证

## 迭代 4/10

### 完成
- 邮箱验证流程
- 验证 token 处理

### 验证
- 测试：65/65 通过 ✅
- 构建：成功 ✅

## 架构师验证

委托：architect @ THOROUGH tier（>20 文件）
结果：APPROVED

## Deslop 清理

- 清理文件：18 个
- 回归测试：通过 ✅

## 完成

- 注册、登录、密码重置、邮箱验证全部实现
- 测试覆盖率：96%
- 代码质量：A
```

### 案例 3：重构核心模块

**指令**：
```
$ralph "重构认证模块，提高可维护性和测试覆盖率"
```

**执行摘要**：
```markdown
## 迭代 1/10

### 分析
- 当前覆盖率：45%
- 代码异味：重复逻辑、过长函数、耦合严重

### 重构
- 提取验证逻辑为独立函数
- 拆分 auth 控制器
- 添加类型定义

## 迭代 2/10

### 重构
- 实现策略模式（支持多种认证方式）
- 添加错误处理中间件
- 改进日志记录

## 迭代 3/10

### 测试
- 新增单元测试：45 个
- 新增集成测试：12 个
- 覆盖率：92%

## 验证

- 测试：78/78 通过 ✅
- 构建：成功 ✅
- Lint: 无警告 ✅

## 架构师验证

委托：architect @ THOROUGH tier
结果：APPROVED
评价："重构显著提高了可维护性，测试覆盖充分"

## 完成

- 代码行数：-300（简化）
- 测试覆盖率：45% → 92%
- 函数平均复杂度：12 → 5
```

---

## 与其他 Skills 协作

### $plan + $ralph

```
$plan --consensus --interactive "..."
# 用户选择"批准并执行" → 自动调用 $ralph
```

### $deep-interview + $ralph

```
$deep-interview "模糊想法"
# 输出：.omq/specs/deep-interview-*.md

$ralph .omq/specs/deep-interview-*.md
# 使用规格作为输入
```

### $autopilot + $ralph

```
# Autopilot 内部使用 Ralph 进行 Phase 2 执行
# 无需手动调用
```

### $team + $ralph

```
# Team 执行后，Ralph 可用于后续验证/修复循环
$team "协调实现"
$ralph "验证并修复剩余问题"
```

---

## 常见问题

### Q: Ralph 最多迭代多少次？

**A**: 默认 10 次。可在配置中调整：
```toml
[omq.ralph]
maxIterations = 15
```

### Q: 如何恢复中断的 Ralph？

**A**: 重新运行 `$ralph "继续"`，会从 `.omq/state/ralph/` 恢复。

### Q: 如何跳过 Deslop 清理？

**A**: 使用 `--no-deslop` 标志：
```
$ralph --no-deslop "紧急修复"
```

### Q: 架构师验证失败怎么办？

**A**: 修复架构师提出的问题，然后重新验证。

### Q: Ralph 和 Ultrawork 有什么区别？

**A**: 
- `$ultrawork`：单次并行执行，无循环
- `$ralph`：包装 Ultrawork，添加循环、持久化、验证

---

## 性能调优

### 加快执行速度

```
$ralph --tier=LOW "简单任务"  # 使用 LOW tier
```

### 提高执行质量

```
$ralph --tier=THOROUGH "关键任务"  # 使用 THOROUGH tier
```

### 限制执行范围

```
$ralph "只实现核心逻辑，UI 稍后处理"
```

---

## 总结

`$ralph` 是你的**持久执行引擎**，适合：

- ✅ 需要保证完成
- ✅ 跨多次迭代
- ✅ 需要架构师签字
- ✅ 用户说"不要停"

记住：
- 明确完成标准
- 让并行任务真正并行
- 验证必须有新鲜证据
- 架构师验证是强制的
- Deslop 清理后回归验证

[🔙 返回使用手册](../usage-guide.md)
