# 最佳实践案例 02：功能开发完整流程

> 从需求到上线的完整功能开发流程

<!-- omq:generated:best-practice -->

## 场景描述

你需要为一个电商平台开发"**优惠券系统**"功能。本案例展示如何使用 OMQ 完整工作流，从模糊需求到上线-ready 代码。

**学习目标**：
- 使用 `$deep-interview` 澄清复杂业务需求
- 使用 `$ralplan` 共识规划高风险功能
- 使用 `$team` 协调并行开发
- 使用 `$ralph` 持久验证

**预计时间**：2-3 小时

**难度**：进阶

---

## 业务背景

**需求**：电商平台需要优惠券系统来支持促销活动。

**初始描述**：
```
"我们需要一个优惠券系统，用户可以领取优惠券，下单时使用，
可以设置各种类型的优惠券（满减、折扣、包邮），
需要防止滥用，有使用门槛和有效期。"
```

**挑战**：
- 业务规则复杂（多种券类型、门槛、有效期）
- 需要防滥用（限领、限用）
- 与现有订单系统集成
- 数据一致性要求高

---

## 完整流程

### 阶段 1：需求澄清（$deep-interview）

**指令**：
```
$deep-interview --standard "电商平台优惠券系统"
```

**采访摘要**（12 轮）：

```
Round 1-3: 意图和结果
- 为什么：支持促销活动，提高转化率
- 目标状态：用户可领券、下单用券、系统防滥用

Round 4-6: 范围
- 券类型：满减、折扣、包邮
- 功能：创建、领取、使用、核销、统计
- 不做：积分系统、会员等级（v1）

Round 7-9: 约束
- 技术栈：复用现有 Node.js + PostgreSQL
- 性能：支持 1000 QPS 领券
- 一致性：优惠券库存不能超发

Round 10-12: 边界
- 非目标：移动端 UI、客服后台
- 决策边界：OMQ 可决定 schema 细节、缓存策略
- 成功标准：所有场景测试通过、无超发 bug

## 完成
最终模糊度：0.15 ≤ 0.20 ✅
```

**输出**：
- `.omq/specs/deep-interview-coupon-system.md`

**关键规格**：
```markdown
## 券类型
1. 满减券：满 100 减 20
2. 折扣券：8 折（最高减 50）
3. 包邮券：免运费

## 领取规则
- 每人限领 1 张
- 总库存限制
- 领取时间窗口

## 使用规则
- 订单金额满足门槛
- 在有效期内
- 未使用过
- 商品在适用范围内

## 防滥用
- 领取频率限制
- 使用频率限制
- 异常检测（同一 IP 多次领取）
```

---

### 阶段 2：共识规划（$ralplan）

**指令**：
```
$plan --consensus --deliberate .omq/specs/deep-interview-coupon-system.md
```

**说明**：使用 `--deliberate` 因为是高风险功能（涉及资金、库存）。

**规划过程**：

```
1. Planner 创建初始计划 + RALPLAN-DR 摘要
2. Architect 审查（最强反论、权衡、综合）
3. Critic 评估（一致性、风险、验证）
4. 循环 3 次直到批准
5. 输出最终计划 + ADR
```

**RALPLAN-DR 摘要**：
```markdown
## 原则
1. 库存绝对不能超发
2. 用户体验优先（领券快、用券简单）
3. 向后兼容（不影响现有订单系统）

## 决策驱动因素
1. 数据一致性
2. 高并发性能
3. 业务灵活性

## 可行选项

### 选项 A：乐观锁 + 对账
**优点**：
- 高性能
- 实现简单

**缺点**：
- 需要重试逻辑
- 极端情况可能失败

### 选项 B：分布式锁
**优点**：
- 强一致性
- 无超发风险

**缺点**：
- 性能开销
- 死锁风险

## 无效化理由
选项 B 因性能开销大（影响领券体验），不符合原则 2，故排除。
选择选项 A + 补偿对账任务。
```

**预演失败**（Deliberate 模式）：
```markdown
## 失败场景 1：超发
**原因**：并发领券，库存检查竞态
**预防**：乐观锁 + 数据库唯一约束
**检测**：库存监控告警
**响应**：自动对账 + 补偿

## 失败场景 2：优惠券重复使用
**原因**：使用状态更新失败
**预防**：数据库事务 + 幂等设计
**检测**：使用记录审计
**响应**：订单回滚 + 通知

## 失败场景 3：性能下降
**原因**：领券高峰，数据库压力大
**预防**：Redis 缓存 + 限流
**检测**：延迟监控
**响应**：降级（排队等待）
```

**输出**：
- `.omq/plans/prd-coupon-system.md`
- `.omq/plans/test-spec-coupon-system.md`

---

### 阶段 3：团队开发（$team）

**指令**：
```
$team 3:executor "按照计划实现优惠券系统"
```

**团队配置**：
```
团队名称：coupon-system
Workers: 3
- Worker-1: 数据层（模型、迁移）
- Worker-2: 业务逻辑（领券、用券）
- Worker-3: API 层（路由、控制器）
```

**任务分配**：
```
Task-1: Worker-1 → Prisma schema + 迁移
Task-2: Worker-1 → 数据访问层
Task-3: Worker-2 → 领券逻辑（含防滥用）
Task-4: Worker-2 → 用券逻辑（含验证）
Task-5: Worker-3 → 创建优惠券 API
Task-6: Worker-3 → 领取/使用 API
Task-7: Worker-2 → 对账任务
Task-8: Worker-3 → 管理后台 API
```

**执行过程**：

```
T+0m: 团队启动
T+5m: Worker-1 完成 schema 设计
T+10m: Worker-2 完成领券逻辑初稿
T+15m: Worker-3 完成 API 路由框架
T+20m: Worker-1 完成数据访问层
T+25m: Worker-2 完成用券逻辑
T+30m: Worker-3 完成所有 API 端点
T+35m: Worker-2 完成对账任务
T+40m: 所有代码提交
```

**状态监控**：
```bash
omq team status coupon-system
```

**输出**：
```json
{
  "team_name": "coupon-system",
  "workers": 3,
  "tasks": {
    "pending": 0,
    "in_progress": 0,
    "completed": 8,
    "failed": 0
  },
  "status": "completed"
}
```

---

### 阶段 4：持久验证（$ralph）

**指令**：
```
$ralph "验证优惠券系统，确保无超发 bug"
```

**验证过程**：

```
迭代 1/10:
- 运行单元测试：42/45 通过（3 个失败）
- 失败：边界情况未处理
- 修复：添加边界检查
- 重新测试：45/45 通过 ✅

迭代 2/10:
- 运行集成测试：12/15 通过（3 个失败）
- 失败：并发领券场景
- 修复：添加乐观锁重试逻辑
- 重新测试：15/15 通过 ✅

迭代 3/10:
- 压力测试：1000 QPS 领券
- 结果：p95=120ms，无超发 ✅
- 架构师验证：APPROVED

迭代 4/10:
- Deslop 清理：优化代码结构
- 回归验证：所有测试通过 ✅

## 完成
- 测试：60/60 通过 ✅
- 构建：成功 ✅
- 压力测试：通过 ✅
- 架构师验证：APPROVED ✅
```

---

### 阶段 5：代码审查（$code-review）

**指令**：
```
$code-review "审查优惠券系统代码"
```

**审查报告**：
```markdown
## 代码审查报告

### 安全性
✅ SQL 注入防护（Prisma ORM）
✅ 输入验证（所有 API 端点）
✅ 幂等设计（领券、用券）
⚠️ 建议：添加速率限制

### 可维护性
✅ 模块化设计
✅ 类型定义完整
✅ 注释充分
⚠️ 建议：添加更多错误日志

### 性能
✅ Redis 缓存
✅ 数据库索引
✅ 批量查询优化
⚠️ 建议：异步对账任务

### 测试
✅ 单元测试覆盖率 95%
✅ 集成测试覆盖核心场景
✅ 压力测试通过
⚠️ 建议：添加混沌测试

## 总体评价：APPROVED
修复建议可在后续迭代处理
```

---

## 最终交付

### 代码结构

```
src/coupon/
├── models/
│   ├── Coupon.ts           # 优惠券模型
│   ├── CouponTemplate.ts   # 券模板模型
│   └── UserCoupon.ts       # 用户领券记录
├── services/
│   ├── couponService.ts    # 领券服务
│   ├── verificationService.ts # 用券验证
│   └── reconciliationService.ts # 对账服务
├── routes/
│   └── coupon.ts           # 优惠券路由
├── controllers/
│   └── couponController.ts # 优惠券控制器
├── middleware/
│   ├── rateLimit.ts        # 速率限制
│   └── antiAbuse.ts        # 防滥用检测
└── types/
    └── coupon.ts           # 类型定义

tests/coupon/
├── services/
│   ├── coupon.test.ts
│   ├── verification.test.ts
│   └── reconciliation.test.ts
└── integration/
    └── coupon-flow.test.ts
```

### API 端点

```typescript
// 创建优惠券模板
POST /api/coupon/templates
{
  "type": "PERCENT_OFF",
  "discount": 20,
  "minAmount": 100,
  "maxDiscount": 50,
  "totalStock": 1000,
  "startTime": "2026-04-01T00:00:00Z",
  "endTime": "2026-04-30T23:59:59Z"
}

// 领取优惠券
POST /api/coupon/claim
{
  "templateId": "uuid"
}

// 使用优惠券验证
POST /api/coupon/verify
{
  "couponId": "uuid",
  "orderId": "uuid",
  "amount": 150
}

// 核销优惠券
POST /api/coupon/use
{
  "couponId": "uuid",
  "orderId": "uuid"
}

// 查询用户优惠券
GET /api/users/:userId/coupons
```

### 关键实现

**乐观锁防超发**：
```typescript
async function claimCoupon(templateId: string, userId: string) {
  const maxRetries = 3;
  
  for (let i = 0; i < maxRetries; i++) {
    const template = await prisma.couponTemplate.findFirst({
      where: { id: templateId },
    });
    
    if (template.stock <= 0) {
      throw new Error('库存不足');
    }
    
    try {
      const result = await prisma.couponTemplate.update({
        where: {
          id: templateId,
          stock: template.stock, // 乐观锁
        },
        data: { stock: template.stock - 1 },
      });
      
      // 创建用户领券记录
      await prisma.userCoupon.create({
        data: { templateId, userId },
      });
      
      return result;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      // 重试
    }
  }
}
```

---

## 验证清单

```markdown
## 功能验证
- [x] 创建优惠券模板
- [x] 领取优惠券（限领、限库存）
- [x] 用券验证（门槛、有效期）
- [x] 核销优惠券
- [x] 查询用户优惠券

## 非功能验证
- [x] 压力测试：1000 QPS 领券
- [x] 无超发：并发测试 1000 次
- [x] 性能：p95 < 200ms
- [x] 恢复性：失败重试成功

## 代码质量
- [x] 单元测试覆盖率 95%
- [x] 集成测试覆盖核心场景
- [x] 代码审查通过
- [x] TypeScript 编译通过
- [x] Lint 无警告
```

---

## 经验总结

### ✅ 做得好的

1. **深度采访**：12 轮采访确保业务规则清晰
2. **共识规划**：Deliberate 模式识别了关键风险
3. **团队并行**：3 个 worker 同时开发，效率高
4. **持久验证**：Ralph 确保无超发 bug

### ⚠️ 可以改进的

1. **时间估计**：实际耗时比预期长 30%
2. **文档**：API 文档可以更详细
3. **监控**：可以添加更多业务指标

### 📝 关键学习

1. **高风险功能用 Deliberate**：预演失败帮助提前识别风险
2. **团队协作需要清晰分工**：Worker 职责明确，减少冲突
3. **验证不能跳过**：Ralph 发现了 3 个并发 bug
4. **防滥用很重要**：速率限制和异常检测是必须的

---

## 下一步

1. **监控告警**：
   ```
   $executor "添加优惠券监控指标和告警"
   ```

2. **管理后台**：
   ```
   $team 2:executor "实现优惠券管理后台 UI"
   ```

3. **A/B 测试**：
   ```
   $plan "规划优惠券 A/B 测试框架"
   ```

---

## 总结

通过这个案例，你学习了：

- ✅ `$deep-interview` 澄清复杂业务需求
- ✅ `$plan --consensus --deliberate` 高风险规划
- ✅ `$team` 协调并行开发
- ✅ `$ralph` 持久验证
- ✅ `$code-review` 质量把关

**下一步**：尝试 [最佳实践案例 03：Bug 修复](./03-bug-fix.md)

[🔙 返回使用手册](../usage-guide.md)
