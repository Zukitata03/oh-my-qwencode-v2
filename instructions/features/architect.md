# $architect 角色完整指南

> 系统架构分析的专家

<!-- omq:generated:agent-doc -->

## 概述

`$architect` 是 OMQ 中的**系统架构专家**角色，专注于分析代码结构、系统边界、架构设计和权衡分析。

当你需要理解复杂代码库、评估架构决策或识别系统边界时，`$architect` 是你的首选角色。

---

## 核心能力

### 1. 代码结构分析

- 识别模块和组件
- 绘制依赖关系图
- 发现架构模式
- 识别技术债务

### 2. 系统边界定义

- 服务边界划分
- 模块职责界定
- 接口契约分析
- 数据流追踪

### 3. 架构设计

- 设计模式应用
- 架构风格选择（微服务/单体/分层）
- 扩展性评估
- 可维护性分析

### 4. 权衡分析

- 性能 vs 可维护性
- 灵活性 vs 复杂度
- 短期交付 vs 长期可持续
- 技术选型对比

---

## 使用场景

### ✅ 适合使用 $architect 的场景

| 场景 | 示例指令 |
|------|---------|
| 理解新代码库 | `$architect "分析这个项目的整体架构"` |
| 审查服务边界 | `$architect "这些微服务的边界清晰吗？"` |
| 评估重构方案 | `$architect "比较两种重构方案的优劣"` |
| 识别性能瓶颈 | `$architect "找出可能导致性能问题的架构设计"` |
| 技术债务审计 | `$architect "列出这个系统的技术债务"` |
| 模块职责分析 | `$architect "auth 模块的职责边界在哪里？"` |
| 依赖关系梳理 | `$architect "画出核心模块的依赖图"` |

### ❌ 不适合使用 $architect 的场景

| 场景 | 推荐角色 |
|------|---------|
| 简单代码修改 | `$executor` |
| 快速探索代码 | `$explore` |
| 实现新功能 | `$executor` |
| 修复 bug | `$debugger` + `$executor` |
| 写文档 | `$writer` |

---

## 使用方法

### 基本语法

```
$architect "<分析任务描述>"
```

### 高级用法

```
$architect --model=qwen3.6-plus "深度分析认证架构"
$architect --tier=THOROUGH "全面审查系统边界"
```

### 组合使用

```
# 先分析后实现
$architect "分析认证流程"
$executor "根据分析结果实现改进"

# 先探索后分析
$explore "找出所有服务入口"
$architect "评估这些入口的架构设计"
```

---

## 输出结构

`$architect` 的典型输出包含：

### 1. 系统概述

```markdown
## 系统概述

这是一个基于 Node.js 的微服务架构系统，包含以下核心服务：
- API Gateway（Express）
- Auth Service（JWT 认证）
- User Service（用户管理）
- ...
```

### 2. 组件图

```markdown
## 组件图

```
┌─────────────┐     ┌─────────────┐
│   Gateway   │────▶│   Auth      │
└─────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Database  │
└─────────────┘     └─────────────┘
```
```

### 3. 数据流分析

```markdown
## 数据流分析

用户请求流程：
1. 请求到达 Gateway
2. Gateway 调用 Auth Service 验证 token
3. 验证通过后转发到 User Service
4. User Service 查询数据库
5. 响应沿原路返回
```

### 4. 依赖关系

```markdown
## 依赖关系

核心依赖：
- express@4.18.0
- jsonwebtoken@9.0.0
- mongoose@7.0.0

内部依赖：
- auth-module → user-module
- api-gateway → all-services
```

### 5. 风险点

```markdown
## 风险点

🔴 高风险：
- Auth Service 单点故障
- 数据库连接池可能耗尽

🟡 中风险：
- 循环依赖：A→B→C→A
- 缺少速率限制

🟢 建议：
- 引入 Redis 缓存
- 添加断路器模式
```

### 6. 改进建议

```markdown
## 改进建议

1. **短期（1-2 周）**
   - 添加健康检查端点
   - 实现请求日志

2. **中期（1-2 月）**
   - 引入 Redis 缓存层
   - 实现断路器模式

3. **长期（3-6 月）**
   - 考虑服务网格
   - 评估事件驱动架构
```

---

## 最佳实践

### 1. 给出明确的分析范围

❌ **模糊**：
```
$architect "分析这个系统"
```

✅ **清晰**：
```
$architect "分析认证模块的架构设计，关注安全性和扩展性"
```

### 2. 指定关注的维度

❌ **笼统**：
```
$architect "这个架构怎么样？"
```

✅ **具体**：
```
$architect "从性能角度评估这个数据库设计"
```

### 3. 要求可视化输出

```
$architect "画出这个模块的依赖图，使用 ASCII 艺术"
```

### 4. 结合业务上下文

```
$architect "考虑到我们预计用户量会增长 10 倍，这个架构能支撑吗？"
```

### 5. 追问为什么

```
$architect "为什么这里选择 REST 而不是 GraphQL？"
```

---

## 配置选项

### 模型层级

| 层级 | 模型 | 用途 |
|------|------|------|
| LOW | qwen3.5-plus | 简单分析 |
| STANDARD | qwen3.6-flash | 标准分析 |
| THOROUGH | qwen3.6-plus | 深度分析 |

### 推理努力

| 级别 | 用途 |
|------|------|
| low | 快速浏览 |
| medium | 标准分析 |
| high | 深度思考 |

### 配置文件示例

```toml
[omq.roles.architect]
defaultTier = "STANDARD"
defaultModel = "qwen3.6-plus"
# Note: defaultReasoningEffort is configured in ~/.qwen/settings.json, not here
```

---

## 实际案例

### 案例 1：分析认证流程

**指令**：
```
$architect "分析这个项目的认证流程，找出潜在的安全风险"
```

**输出摘要**：
```markdown
## 认证流程分析

当前实现：
1. 用户登录 → 生成 JWT token
2. 请求携带 token → Auth 中间件验证
3. 验证通过 → 转发到业务逻辑

## 安全风险

🔴 严重：
- JWT secret 硬编码在代码中
- token 没有过期时间
- 缺少刷新 token 机制

🟡 中等：
- 密码哈希使用 MD5（应改用 bcrypt）
- 缺少登录失败限制

## 建议

1. 立即将 JWT secret 移到环境变量
2. 设置 token 过期时间（推荐 1 小时）
3. 实现刷新 token 机制
4. 升级密码哈希算法到 bcrypt
5. 添加登录失败限制（5 次失败后锁定）
```

### 案例 2：评估微服务边界

**指令**：
```
$architect "评估当前微服务划分的合理性，是否需要调整？"
```

**输出摘要**：
```markdown
## 服务划分评估

当前服务：
- user-service（用户管理）
- order-service（订单管理）
- payment-service（支付处理）
- notification-service（通知发送）

## 评估结果

✅ 合理划分：
- user-service：职责单一，边界清晰
- payment-service：符合单一职责原则

⚠️ 需要调整：
- order-service 包含了库存逻辑，建议拆分
- notification-service 耦合了业务逻辑

## 调整建议

1. 从 order-service 拆分出 inventory-service
2. 将 notification-service 改为纯事件驱动
3. 考虑将 user-service 拆分为 account-service 和 profile-service
```

### 案例 3：技术债务审计

**指令**：
```
$architect "列出这个系统的所有技术债务，按优先级排序"
```

**输出摘要**：
```markdown
## 技术债务清单

### P0（紧急）

1. **数据库没有备份策略**
   - 风险：数据丢失
   - 修复成本：1 天
   - 建议：立即实施自动备份

2. **API 没有速率限制**
   - 风险：DDoS 攻击
   - 修复成本：2 天
   - 建议：添加 rate-limiting 中间件

### P1（高优先级）

3. **循环依赖**
   - 位置：auth ↔ user 模块
   - 风险：难以测试和维护
   - 修复成本：3 天

4. **缺少集成测试**
   - 覆盖率：0%
   - 风险：回归 bug
   - 修复成本：1 周

### P2（中优先级）

5. **代码重复**
   - 位置：多个服务中的验证逻辑
   - 修复成本：2 天
   - 建议：提取为共享库

...
```

---

## 与其他角色协作

### $architect + $executor

```
$architect "分析这个模块的架构问题"
$executor "根据架构师的建議重构代码"
```

### $architect + $planner

```
$architect "识别系统瓶颈"
$planner "规划优化实施路径"
```

### $architect + $critic

```
$architect "提出架构方案 A 和 B"
$critic "挑战这两个方案的假设"
```

### $architect + $security-reviewer

```
$architect "分析系统架构"
$security-reviewer "从安全角度审查架构"
```

---

## 常见问题

### Q: $architect 和 $explore 有什么区别？

**A**: 
- `$explore`：快速查找代码位置和符号
- `$architect`：深度分析架构设计和权衡

**示例**：
```
$explore "找出所有认证相关的文件"  # 快速定位
$architect "分析认证架构的设计"      # 深度分析
```

### Q: 如何让 $architect 输出图表？

**A**: 明确要求使用 ASCII 艺术或 Mermaid 语法：
```
$architect "用 ASCII 艺术画出组件图"
$architect "用 Mermaid 语法画出序列图"
```

### Q: $architect 会修改代码吗？

**A**: 不会。`$architect` 是只读分析角色。如需修改代码，使用 `$executor`。

### Q: 分析结果保存在哪里？

**A**: 分析结果默认输出在对话中。如需持久化：
```
$note "保存架构分析到 .omq/arch-notes.md"
```

---

## 性能调优

### 加快分析速度

```
$architect --tier=LOW "快速浏览这个模块"
```

### 提高分析深度

```
$architect --tier=THOROUGH --model=qwen3.6-plus "深度分析"
```

### 限制分析范围

```
$architect "只分析 src/auth 目录下的文件"
```

---

## 总结

`$architect` 是你的**系统架构师**，适合：

- ✅ 理解复杂代码库
- ✅ 评估架构设计
- ✅ 识别技术债务
- ✅ 规划重构路径
- ✅ 权衡技术选型

记住：
- 给出明确的分析范围
- 指定关注的维度
- 要求可视化输出
- 结合业务上下文

[🔙 返回使用手册](../usage-guide.md)
