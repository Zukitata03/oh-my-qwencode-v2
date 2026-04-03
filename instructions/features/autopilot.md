# $autopilot 端到端自主执行指南

> 从想法到完整代码的自动驾驶仪

<!-- omq:generated:skill-doc -->

## 概述

`$autopilot` 是 OMQ 中的**端到端自主执行**工作流。它接受一个简短的产品想法，自动处理完整生命周期：

```
需求分析 → 技术设计 → 规划 → 并行实现 → QA 循环 → 多视角验证 → 完整代码
```

你只需描述想要什么，`$autopilot` 会交付可运行的、经过验证的代码。

---

## 核心能力

### 1. 需求扩展（Phase 0）

将 2-3 行描述扩展为详细规格：

```
输入："用 TypeScript 构建一个书店库存管理的 REST API，包含 CRUD 操作"

输出：
- 功能需求清单
- 非功能需求（性能、安全、扩展性）
- 数据模型设计
- API 端点清单
- 技术规格说明书
```

### 2. 实现规划（Phase 1）

从规格创建可执行的实现计划：

```
- 任务分解（依赖关系、优先级）
- 文件清单（新增/修改）
- 实现顺序
- 风险评估
```

### 3. 并行执行（Phase 2）

使用 Ralph + Ultrawork 并行实现：

```
- 简单任务 → LOW tier executor
- 标准任务 → STANDARD tier executor
- 复杂任务 → THOROUGH tier executor/architect
- 独立任务 → 并行执行
```

### 4. QA 循环（Phase 3）

自动测试→修复循环：

```
运行测试 → 发现失败 → 修复 → 重新测试
重复直到所有测试通过（最多 5 次）
```

### 5. 多视角验证（Phase 4）

并行多角色审查：

```
Architect: 功能完整性
Security-reviewer: 漏洞检查
Code-reviewer: 质量审查
All must approve → 通过
Any rejects → 修复并重新验证
```

### 6. 自动清理（Phase 5）

完成后清理状态文件：

```
state_clear("autopilot")
state_clear("ralph")
state_clear("ultrawork")
state_clear("ultraqa")
```

---

## 使用场景

### ✅ 适合使用 $autopilot 的场景

| 场景 | 示例指令 |
|------|---------|
| 端到端功能开发 | `$autopilot "构建一个博客系统"` |
| 完整 API 实现 | `$autopilot "用 TypeScript 构建书店 API"` |
| CLI 工具开发 | `$autopilot "创建一个习惯追踪 CLI"` |
| 全栈应用 | `$autopilot "做一个待办事项应用"` |
| 从想法到代码 | `$autopilot "我想做一个..."` |

### ❌ 不适合使用 $autopilot 的场景

| 场景 | 推荐替代 |
|------|---------|
| 单个 bug 修复 | `$executor` |
| 探索/头脑风暴 | `$plan` |
| 快速修改 | `$ralph` |
| 已有计划需执行 | `$ralph` 或 `$team` |

---

## 工作流程

### Phase 0 - 需求扩展

**目标**：将想法扩展为详细规格

**流程**：
```
1. 检查是否存在 deep-interview 规格
   - 存在 → 复用，跳过冗余扩展
   - 不存在 → 继续步骤 2

2. 模糊需求检测
   - 高度模糊 → 运行 $deep-interview --quick
   - 清晰 → 继续步骤 3

3. Analyst 提取需求（THOROUGH tier）
   - 功能需求
   - 非功能需求
   - 验收标准

4. Architect 创建技术规格（THOROUGH tier）
   - 架构设计
   - 数据模型
   - 技术选型

5. 输出：`.omq/plans/autopilot-spec.md`
```

### Phase 1 - 规划

**目标**：从规格创建实现计划

**流程**：
```
1. Architect 创建计划（THOROUGH tier）
   - 任务分解
   - 文件清单
   - 实现顺序

2. Critic 验证计划（THOROUGH tier）
   - 完整性检查
   - 风险评估
   - 可执行性验证

3. 输出：`.omq/plans/autopilot-impl.md`
```

### Phase 2 - 执行

**目标**：并行实现计划

**流程**：
```
1. 任务分类
   - 简单任务 → LOW tier
   - 标准任务 → STANDARD tier
   - 复杂任务 → THOROUGH tier

2. 并行委托
   ```
   delegate(executor, LOW, "添加类型导出")
   delegate(executor, STANDARD, "实现缓存层")
   delegate(executor, THOROUGH, "重构认证模块")
   ```

3. Ultrawork 并行执行

4. Ralph 整合结果
```

### Phase 3 - QA

**目标**：循环直到所有测试通过

**流程**：
```
1. 运行构建：npm run build
2. 运行测试：npm test
3. 运行 lint：npm run lint
4. 发现失败 → 修复
5. 重复步骤 1-4（最多 5 次）

停止条件：
- 所有测试通过 → 继续 Phase 4
- 同一错误重复 3 次 → 停止并报告根本问题
```

### Phase 4 - 验证

**目标**：多视角审查

**流程**：
```
1. 并行委托验证
   - Architect: 功能完整性
   - Security-reviewer: 漏洞检查
   - Code-reviewer: 质量审查

2. 收集结果
   - All approve → Phase 5
   - Any reject → 修复并重新验证（最多 3 次）

3. 重新验证失败 3 次 → 停止并报告
```

### Phase 5 - 清理

**目标**：清理状态文件

**流程**：
```
1. 运行 $cancel
2. 或手动清理：
   state_clear("autopilot")
   state_clear("ralph")
   state_clear("ultrawork")
   state_clear("ultraqa")
```

---

## 输出结构

### 规格说明书（`.omq/plans/autopilot-spec.md`）

```markdown
# 书店库存管理 API 规格

## 项目概述
- 领域：书店库存管理
- 类型：REST API
- 技术栈：TypeScript + Node.js + Express

## 功能需求
### FR-1: 图书管理
- 创建图书
- 查询图书列表
- 获取图书详情
- 更新图书信息
- 删除图书

### FR-2: 库存管理
- 入库操作
- 出库操作
- 库存查询
- 库存预警

## 非功能需求
- 响应时间：< 200ms (p95)
- 可用性：99.9%
- 并发：1000 QPS

## 数据模型
### Book
- id: UUID
- title: string
- author: string
- isbn: string
- price: number
- stock: number

### InventoryLog
- id: UUID
- bookId: UUID
- type: IN | OUT
- quantity: number
- timestamp: DateTime

## API 端点
- POST /books
- GET /books
- GET /books/:id
- PUT /books/:id
- DELETE /books/:id
- POST /inventory
- GET /inventory/:bookId
```

### 实现计划（`.omq/plans/autopilot-impl.md`）

```markdown
# 书店 API 实现计划

## 实现步骤

### Step 1: 项目搭建（Day 1）
- 初始化 TypeScript 项目
- 配置 ESLint + Prettier
- 设置 Jest 测试框架
- 配置 CI/CD

### Step 2: 数据层（Day 2-3）
- 创建 Book 模型
- 创建 InventoryLog 模型
- 实现数据库迁移
- 编写模型测试

### Step 3: API 层（Day 4-6）
- 实现 Books 路由
- 实现 Inventory 路由
- 添加输入验证
- 添加错误处理

### Step 4: 业务逻辑（Day 7-8）
- 库存计算逻辑
- 库存预警逻辑
- 事务处理

### Step 5: 测试与优化（Day 9-10）
- 集成测试
- 性能测试
- 安全测试

## 文件清单
新增：
- src/models/Book.ts
- src/models/InventoryLog.ts
- src/routes/books.ts
- src/routes/inventory.ts
- src/controllers/bookController.ts
- src/controllers/inventoryController.ts
- src/middleware/validation.ts
- src/middleware/errorHandler.ts
- tests/**/*.test.ts

修改：
- src/app.ts
- src/config/database.ts

## 风险与缓解
| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 数据库事务复杂 | 中 | 高 | 提前原型验证 |
| 并发库存更新 | 中 | 高 | 乐观锁 |
```

### 完成报告

```markdown
## Autopilot 完成报告

### 完成状态
✅ Phase 0: 需求扩展 - 完成
✅ Phase 1: 规划 - 完成
✅ Phase 2: 执行 - 完成
✅ Phase 3: QA - 完成（2 次循环）
✅ Phase 4: 验证 - 完成（全部批准）
✅ Phase 5: 清理 - 完成

### 交付物
- ✅ REST API（12 个端点）
- ✅ 数据模型（2 个模型）
- ✅ 单元测试（45 个测试，覆盖率 96%）
- ✅ 集成测试（8 个场景）
- ✅ API 文档
- ✅ Docker 配置

### 验证结果
- ✅ 所有测试通过（53/53）
- ✅ 构建成功
- ✅ ESLint 无警告
- ✅ 架构师批准
- ✅ 安全审查通过
- ✅ 代码质量审查通过

### 性能指标
- 平均响应时间：45ms
- p95 响应时间：120ms
- 并发测试：1200 QPS 通过

### 下一步建议
1. 添加 Redis 缓存层
2. 实现速率限制
3. 添加监控指标
```

---

## 最佳实践

### 1. 给出具体描述

❌ **模糊**：
```
$autopilot "做一个商店"
```

✅ **具体**：
```
$autopilot "用 TypeScript 构建一个书店库存管理的 REST API，包含 CRUD 操作和库存预警"
```

### 2. 指定关键功能

```
$autopilot "构建一个任务管理应用，包含：
- 用户认证（JWT）
- 任务 CRUD
- 团队协作
- 实时通知"
```

### 3. 指定技术约束

```
$autopilot "使用 React + TypeScript + Tailwind CSS 构建前端"
```

### 4. 让它运行

```
不要中途打断
让 Autopilot 完成所有阶段
```

### 5. 使用配置优化

```toml
[omq.autopilot]
maxIterations = 10
maxQaCycles = 5
maxValidationRounds = 3
pauseAfterExpansion = false  # 扩展后暂停审查
pauseAfterPlanning = false   # 规划后暂停审查
skipQa = false               # 跳过 QA
skipValidation = false       # 跳过验证
```

---

## 配置选项

### 全局配置

```toml
[omq.autopilot]
maxIterations = 10        # 最大迭代次数
maxQaCycles = 5           # 最大 QA 循环
maxValidationRounds = 3   # 最大验证轮数
pauseAfterExpansion = false
pauseAfterPlanning = false
skipQa = false
skipValidation = false
```

### Pipeline 配置

```toml
[omq.autopilot.pipeline]
maxRalphIterations = 10   # Ralph 验证迭代上限
workerCount = 2           # 团队工作器数量
agentType = "executor"    # 工作器角色类型
```

### 环境变量

```bash
# 覆盖默认模型
export OMQ_DEFAULT_FRONTIER_MODEL=qwen3.6-plus
export OMQ_DEFAULT_SPARK_MODEL=qwen3.5-plus
```

---

## 实际案例

### 案例 1：REST API 开发

**指令**：
```
$autopilot "用 TypeScript 构建一个书店库存管理的 REST API，包含 CRUD 操作"
```

**执行摘要**：
```markdown
## 执行报告

### Phase 0: 需求扩展
- Analyst 提取 15 个功能需求
- Architect 设计 2 个数据模型、12 个 API 端点
- 输出：autopilot-spec.md（2400 字）

### Phase 1: 规划
- 分解为 5 个阶段、18 个任务
- 识别 3 个风险点
- 输出：autopilot-impl.md

### Phase 2: 执行
- 并行执行 18 个任务
- 新增 14 个文件，修改 2 个文件
- 实现 3500 行代码

### Phase 3: QA
- 循环 2 次
- 修复 5 个测试失败
- 最终：53 个测试全部通过

### Phase 4: 验证
- Architect: ✅ 功能完整
- Security-reviewer: ✅ 无高危漏洞
- Code-reviewer: ✅ 质量良好

### Phase 5: 清理
- 状态文件已清理
- 工作区整洁
```

### 案例 2：CLI 工具开发

**指令**：
```
$autopilot "创建一个习惯追踪 CLI 工具，支持：
- 创建/删除习惯
- 每日打卡
- 显示连续天数
- 导出统计数据"
```

**输出摘要**：
```markdown
## 交付物

### CLI 命令
- `habit create <name> [--frequency daily|weekly]`
- `habit list`
- `habit check-in <id>`
- `habit stats [--export json|csv]`
- `habit delete <id>`

### 功能
- ✅ 习惯管理（CRUD）
- ✅ 每日打卡
- ✅ 连续天数计算
- ✅ 统计数据导出
- ✅ 本地数据持久化（SQLite）

### 测试
- 单元测试：32 个
- 集成测试：8 个
- 覆盖率：94%

### 文档
- README.md（使用指南）
- CLI 帮助文档
- 贡献指南
```

### 案例 3：全栈应用

**指令**：
```
$autopilot "用 React + Node.js 构建一个待办事项应用，支持用户注册、任务管理、团队协作"
```

**执行摘要**：
```markdown
## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- React Query
- Zustand（状态管理）

### 后端
- Node.js
- Express
- TypeScript
- Prisma（ORM）
- PostgreSQL

### 认证
- JWT
- bcrypt

## 功能清单

### 用户系统
- [x] 注册/登录
- [x] 密码重置
- [x] 用户资料

### 任务管理
- [x] 创建任务
- [x] 编辑任务
- [x] 删除任务
- [x] 标记完成
- [x] 设置截止日期
- [x] 优先级标签

### 团队协作
- [x] 创建团队
- [x] 邀请成员
- [x] 分配任务
- [x] 团队看板

## 验证结果
- 前端测试：45 个通过
- 后端测试：52 个通过
- e2e 测试：12 个通过
- 总覆盖率：92%
```

---

## 与其他 Skills 协作

### $deep-interview + $autopilot

```
$deep-interview "模糊想法"
# 输出：.omq/specs/deep-interview-*.md

$autopilot .omq/specs/deep-interview-*.md
# 使用规格作为输入
```

### $plan + $autopilot

```
$plan --consensus "高风险任务"
# 输出：.omq/plans/prd-*.md

$autopilot .omq/plans/prd-*.md
# 按照计划执行
```

### $ralph + $autopilot

```
# Autopilot 内部使用 Ralph 进行 Phase 2 执行和 Phase 3 QA
# 无需手动调用
```

---

## 常见问题

### Q: Autopilot 需要多长时间？

**A**: 取决于任务复杂度：
- 简单 API：15-30 分钟
- 中等应用：30-60 分钟
- 复杂系统：1-2 小时

### Q: 可以中途查看进度吗？

**A**: 可以。查看 `.omq/state/autopilot/` 中的状态文件。

### Q: 如何取消 Autopilot？

**A**: 运行 `/cancel`，进度会保存，可恢复。

### Q: Autopilot 失败怎么办？

**A**: 查看失败报告，通常有三种情况：
1. 需求太模糊 → 先运行 `$deep-interview`
2. QA 循环耗尽 → 同一错误 3 次，需要人工干预
3. 验证失败 → 审查具体拒绝原因

### Q: 可以跳过某些阶段吗？

**A**: 可以配置：
```toml
[omq.autopilot]
skipQa = true        # 跳过 QA
skipValidation = true # 跳过验证
```

---

## 性能调优

### 加快执行速度

```
$autopilot --skip-qa "快速实现"  # 跳过 QA
$autopilot --tier=LOW "简单任务"  # 使用 LOW tier
```

### 提高执行质量

```
$autopilot --tier=THOROUGH "关键任务"
$autopilot --max-qa-cycles=10 "需要严格测试"
```

### 限制执行范围

```
$autopilot "只实现核心功能，UI 稍后处理"
```

---

## 总结

`$autopilot` 是你的**自动驾驶仪**，适合：

- ✅ 从想法到完整代码
- ✅ 端到端功能开发
- ✅ 需要完整测试和验证
- ✅ 放手让系统自动完成

记住：
- 给出具体描述
- 指定关键功能和技术约束
- 让它运行，不要中途打断
- 使用配置优化行为

[🔙 返回使用手册](../usage-guide.md)
