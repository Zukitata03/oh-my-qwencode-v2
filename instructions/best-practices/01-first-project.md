# 最佳实践案例 01：第一个 OMQ 项目

> 从零开始完成你的第一个 OMQ 项目

<!-- omq:generated:best-practice -->

## 场景描述

你是一个 OMQ 新手，想要使用 OMQ 完成一个实际项目。本案例将带你从零开始，完成一个完整的**任务管理 API** 项目。

**学习目标**：
- 安装和配置 OMQ
- 使用 `$deep-interview` 澄清需求
- 使用 `$plan` 创建计划
- 使用 `$autopilot` 端到端执行
- 验证完成状态

**预计时间**：60-90 分钟

**难度**：入门

---

## 前置要求

- Node.js >= 20
- Qwen Code 账号和认证
- 基础编程知识
- 终端/命令行使用经验

---

## 完整流程

### 步骤 1：安装 OMQ

```bash
# 安装 Qwen Code
npm install -g @openai/qwen

# 安装 OMQ
npm install -g oh-my-qwencode

# 初始化配置
omq setup

# 验证安装
omq doctor
```

**预期输出**：
```
✅ Node.js v20.10.0
✅ Qwen Code installed
✅ tmux 3.3a
✅ MCP servers configured
✅ Skills installed (36)
✅ Prompts installed (33)

安装验证通过！
```

---

### 步骤 2：启动 OMQ

```bash
omq --madmax
# 注意：如需配置 reasoning effort，请在 ~/.qwen/settings.json 中设置 model_reasoning_effort
# --high 标志保留以向后兼容，但已无实际效果
```

**说明**：
- `--madmax`：启用最大性能模式
- `--high`：（保留以向后兼容）需在 settings.json 中配置 reasoning_effort

---

### 步骤 3：需求澄清（$deep-interview）

**指令**：
```
$deep-interview "我想做一个任务管理 API"
```

**采访过程示例**：

```
Round 1 | 目标：意图清晰度 | 模糊度：100%
问题：为什么想要任务管理 API？
回答：帮助团队管理项目任务，跟踪进度

Round 2 | 目标：结果清晰度 | 模糊度：85%
问题：用户成功使用后的最终状态是什么？
回答：用户可以创建任务、分配成员、更新状态、查看进度

Round 3 | 目标：范围清晰度 | 模糊度：70%
问题：核心功能有哪些？
回答：任务 CRUD、成员管理、状态跟踪、进度报告

Round 4 | 目标：约束清晰度 | 模糊度：55%
问题：技术栈偏好？
回答：Node.js + Express + TypeScript + PostgreSQL

Round 5 | 目标：成功标准 | 模糊度：40%
问题：如何评判 MVP 完成？
回答：可以创建任务、更新状态、查询列表，API 测试通过

Round 6 | 目标：非目标 | 模糊度：30%
问题：明确不做哪些功能？
回答：不做前端 UI、不做用户认证（v1）、不做通知系统

Round 7 | 目标：决策边界 | 模糊度：20% ✅
问题：OMQ 可自行决定什么？
回答：数据库 schema 细节、API 路径命名、错误处理格式

## 完成
最终模糊度：0.18 ≤ 0.20 ✅
```

**输出文件**：
- `.omq/interviews/task-management-api-{timestamp}.md`
- `.omq/specs/deep-interview-task-management-api.md`

---

### 步骤 4：共识规划（$plan --consensus）

**指令**：
```
$plan --consensus .omq/specs/deep-interview-task-management-api.md
```

**规划过程**：

```
1. Planner 创建初始计划
2. Architect 审查架构合理性
3. Critic 评估质量
4. 循环 2 次直到批准
5. 输出最终计划
```

**输出文件**：
- `.omq/plans/prd-task-management-api.md`
- `.omq/plans/test-spec-task-management-api.md`

**计划摘要**：
```markdown
# 任务管理 API 计划

## 需求摘要
- 任务 CRUD
- 成员管理
- 状态跟踪
- 进度报告

## 验收标准
- [ ] POST /tasks 创建任务
- [ ] GET /tasks 查询列表
- [ ] GET /tasks/:id 查询详情
- [ ] PUT /tasks/:id 更新任务
- [ ] DELETE /tasks/:id 删除任务
- [ ] GET /tasks/stats 进度统计
- [ ] 所有测试通过
- [ ] TypeScript 编译通过

## 实现步骤
1. 项目搭建（Day 1）
2. 数据层（Day 2-3）
3. API 层（Day 4-6）
4. 测试与优化（Day 7）

## 技术栈
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- Jest（测试）
```

---

### 步骤 5：端到端执行（$autopilot）

**指令**：
```
$autopilot .omq/plans/prd-task-management-api.md
```

**执行过程**：

```
Phase 0: 需求扩展
- 复用 deep-interview 规格
- 输出：.omq/plans/autopilot-spec.md

Phase 1: 规划
- 细化实现步骤
- 输出：.omq/plans/autopilot-impl.md

Phase 2: 执行
- 并行实现 15 个任务
- 新增 12 个文件

Phase 3: QA
- 循环 2 次
- 修复 3 个测试失败
- 最终：28/28 测试通过

Phase 4: 验证
- Architect: ✅ 功能完整
- Security-reviewer: ✅ 无高危漏洞
- Code-reviewer: ✅ 质量良好

Phase 5: 清理
- 状态文件已清理
```

---

### 步骤 6：验证完成

**运行验证**：
```bash
# 测试
npm test

# 构建
npm run build

# Lint
npm run lint
```

**预期输出**：
```
$ npm test
> 28 passed, 0 failed

$ npm run build
> Build succeeded

$ npm run lint
> No lint errors
```

---

## 项目结构

最终生成的项目结构：

```
task-management-api/
├── src/
│   ├── app.ts                 # Express 应用入口
│   ├── config/
│   │   └── database.ts        # 数据库配置
│   ├── models/
│   │   ├── Task.ts            # 任务模型
│   │   └── Member.ts          # 成员模型
│   ├── routes/
│   │   ├── tasks.ts           # 任务路由
│   │   └── members.ts         # 成员路由
│   ├── controllers/
│   │   ├── taskController.ts  # 任务控制器
│   │   └── memberController.ts# 成员控制器
│   ├── middleware/
│   │   ├── validation.ts      # 输入验证
│   │   └── errorHandler.ts    # 错误处理
│   └── types/
│       └── index.ts           # 类型定义
├── tests/
│   ├── tasks/
│   │   ├── create.test.ts
│   │   ├── update.test.ts
│   │   └── delete.test.ts
│   └── members/
│       └── members.test.ts
├── prisma/
│   ├── schema.prisma          # Prisma schema
│   └── migrations/            # 数据库迁移
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 关键代码示例

### 任务模型（`src/models/Task.ts`）

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTask(
  title: string,
  description?: string,
  assigneeId?: string
): Promise<Task> {
  return prisma.task.create({
    data: { title, description, assigneeId },
  });
}

export async function getTasks() {
  return prisma.task.findMany({
    include: { assignee: true },
  });
}

// ... 其他 CRUD 函数
```

### 任务路由（`src/routes/tasks.ts`）

```typescript
import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { validateTaskInput } from '../middleware/validation';

const router = Router();

router.post('/', validateTaskInput, createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
```

---

## 常见问题

### Q: 采访轮数太多怎么办？

**A**: 可以说"跳过这个"或"直接生成计划"。但可能影响执行质量。

### Q: Autopilot 执行失败怎么办？

**A**: 查看失败报告，通常有三种情况：
1. 需求太模糊 → 重新运行 `$deep-interview`
2. QA 循环耗尽 → 同一错误 3 次，需要人工干预
3. 验证失败 → 审查具体拒绝原因

### Q: 如何查看进度？

**A**: 查看 `.omq/state/` 目录中的状态文件。

### Q: 可以中途修改需求吗？

**A**: 可以，但建议先完成当前循环，然后重新运行 `$deep-interview` 澄清变更。

---

## 经验总结

### ✅ 做得好的

1. **需求澄清充分**：7 轮采访确保需求清晰
2. **共识规划**：多角色审议保证计划质量
3. **端到端执行**：Autopilot 自动完成所有阶段
4. **验证完整**：测试、构建、lint 全部通过

### ⚠️ 可以改进的

1. **时间估计**：实际耗时比预期长 20%
2. **测试覆盖**：可以添加更多边界情况测试
3. **文档**：API 文档可以更详细

### 📝 关键学习

1. **模糊度量化**：每轮看到模糊度下降很有成就感
2. **压力测试**：Contrarian 模式帮助发现隐藏假设
3. **执行桥**：从 deep-interview → plan → autopilot 流程顺畅
4. **验证重要**：QA 循环修复了 3 个早期 bug

---

## 下一步

完成第一个项目后，可以尝试：

1. **添加用户认证**：
   ```
   $ralph "添加 JWT 用户认证"
   ```

2. **实现实时通知**：
   ```
   $team 2:executor "实现 WebSocket 实时通知"
   ```

3. **性能优化**：
   ```
   $analyze "找出性能瓶颈"
   $executor "优化慢查询"
   ```

4. **部署到生产**：
   ```
   $plan "规划部署流程"
   ```

---

## 总结

通过这个案例，你学习了：

- ✅ OMQ 安装和配置
- ✅ `$deep-interview` 需求澄清
- ✅ `$plan --consensus` 共识规划
- ✅ `$autopilot` 端到端执行
- ✅ 验证和完成检查

**下一步**：尝试 [最佳实践案例 02：功能开发完整流程](./02-feature-development.md)

[🔙 返回使用手册](../usage-guide.md)
