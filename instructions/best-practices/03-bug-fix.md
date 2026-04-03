# 最佳实践案例 03：Bug 修复最佳实践

> 高效定位和修复复杂 Bug 的完整流程

<!-- omq:generated:best-practice -->

## 场景描述

生产环境出现了一个**偶发性订单失败**的 Bug。本案例展示如何使用 OMQ 系统性地定位根因、修复并验证。

**学习目标**：
- 使用 `$debugger` 定位根因
- 使用 `$ralph` 持久修复
- 使用 `$verifier` 验证完成
- 添加回归测试防止复发

**预计时间**：45-60 分钟

**难度**：中级

---

## Bug 报告

**现象**：
```
用户反馈：下单时偶发性失败，错误提示"库存不足"，
但实际库存充足。大约 10% 的订单会失败。

环境：生产环境
频率：约 10% 订单
影响：用户无法下单，收入损失
紧急程度：P0
```

**初始信息**：
- 错误日志：`InventoryError: Stock not sufficient`
- 数据库库存：充足
- 失败无规律：同一用户、同一商品，有时成功有时失败

---

## 完整流程

### 步骤 1：根因分析（$debugger）

**指令**：
```
$debugger "调查订单偶发性失败的根因，错误提示库存不足但实际充足"
```

**调试过程**：

```
Phase 1: 信息收集
- 读取错误日志
- 检查数据库库存记录
- 分析失败订单模式

Phase 2: 假设生成
- 假设 1：并发下单导致竞态条件
- 假设 2：缓存和数据库不一致
- 假设 3：库存计算逻辑错误

Phase 3: 假设验证
- 验证假设 1：检查并发日志 → 发现同一商品同时下单
- 验证假设 2：检查缓存 → 缓存和数据库一致
- 验证假设 3：审查代码 → 发现库存检查未加锁

Phase 4: 根因确认
- 根因：库存检查和使用之间有时间窗口，
  并发下单时可能超卖，导致后续订单失败
```

**输出**：
```markdown
# 根因分析报告

## 现象
订单偶发性失败（~10%），错误提示"库存不足"

## 根因
库存检查（read）和库存扣减（write）之间有时间窗口，
并发下单时可能发生：

T1: 检查库存（100）
T2: 检查库存（100）
T1: 扣减库存（100-1=99）
T2: 扣减库存（99-1=98）

但如果 T2 在 T1 扣减后才检查：
T1: 检查库存（100）
T2: 检查库存（100）
T1: 扣减库存（99）
T2: 扣减失败（因为检查时是 100，实际已变 99）

## 证据
- 并发日志：同一商品同时下单记录
- 代码审查：库存检查无锁保护
- 失败模式：高并发时段失败率高

## 修复方案
1. 添加乐观锁（数据库 version 字段）
2. 或使用数据库行锁（SELECT FOR UPDATE）
3. 添加重试逻辑
```

---

### 步骤 2：规划修复（$plan --direct）

**指令**：
```
$plan --direct "修复库存竞态条件 bug，添加乐观锁和重试逻辑"
```

**修复计划**：
```markdown
# 库存竞态条件修复计划

## 修复步骤
1. 修改库存扣减逻辑，添加乐观锁
2. 添加重试逻辑（最多 3 次）
3. 添加详细错误日志
4. 编写并发测试用例
5. 验证修复效果

## 验收标准
- [ ] 并发 1000 次下单无失败
- [ ] 错误日志清晰
- [ ] 性能无明显下降
- [ ] 回归测试通过

## 风险
- 乐观锁可能导致重试，影响性能
- 缓解：监控重试率，调整重试次数
```

---

### 步骤 3：持久修复（$ralph）

**指令**：
```
$ralph "按照计划修复库存竞态条件 bug，必须通过并发测试"
```

**修复过程**：

```
迭代 1/10:
- 修改库存扣减逻辑，添加 version 字段
- 添加重试逻辑（最多 3 次）
- 运行单元测试：28/30 通过（2 个失败）
- 失败原因：边界情况未处理
- 修复：添加超时处理
- 重新测试：30/30 通过 ✅

迭代 2/10:
- 添加详细错误日志
- 运行集成测试：15/15 通过 ✅
- 日志清晰，包含重试次数、version 等信息

迭代 3/10:
- 编写并发测试用例
- 并发 1000 次下单：998/1000 通过（2 个失败）
- 失败原因：重试次数不足
- 修复：增加重试次数到 5 次
- 重新测试：1000/1000 通过 ✅

迭代 4/10:
- 性能测试：p95 从 100ms → 110ms（可接受）
- 重试率监控：0.1%（很低）
- 架构师验证：APPROVED

迭代 5/10:
- Deslop 清理：优化代码结构
- 回归验证：所有测试通过 ✅

## 完成
- 测试：45/45 通过 ✅
- 并发测试：1000/1000 通过 ✅
- 性能：p95=110ms（+10ms，可接受）
- 架构师验证：APPROVED ✅
```

**修复代码**：
```typescript
async function deductStock(productId: string, quantity: number) {
  const maxRetries = 5;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 乐观锁：检查 version
      const product = await prisma.product.findFirst({
        where: { id: productId },
      });
      
      if (product.stock < quantity) {
        throw new InventoryError('Stock not sufficient', {
          productId,
          available: product.stock,
          requested: quantity,
        });
      }
      
      // 乐观锁扣减
      await prisma.product.update({
        where: {
          id: productId,
          version: product.version, // 乐观锁
        },
        data: {
          stock: product.stock - quantity,
          version: product.version + 1,
        },
      });
      
      // 记录成功日志
      logger.info('Stock deducted', {
        productId,
        quantity,
        retries: i,
      });
      
      return;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // 乐观锁冲突，重试
        if (i === maxRetries - 1) {
          logger.error('Stock deduct failed after retries', {
            productId,
            quantity,
            retries: maxRetries,
          });
          throw new InventoryError('Failed to deduct stock after retries');
        }
        // 继续重试
        continue;
      }
      // 其他错误，直接抛出
      throw e;
    }
  }
}
```

---

### 步骤 4：回归测试（$test-engineer）

**指令**：
```
$test-engineer "为库存竞态条件修复添加回归测试"
```

**测试用例**：
```typescript
describe('库存并发测试', () => {
  it('应该支持 1000 次并发下单无失败', async () => {
    // 准备：1000 个库存
    await prisma.product.update({
      where: { id: 'product-1' },
      data: { stock: 1000 },
    });
    
    // 并发：1000 次下单
    const promises = Array.from({ length: 1000 }).map(() =>
      deductStock('product-1', 1)
    );
    
    // 验证：全部成功
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(
      (r) => r.status === 'fulfilled'
    ).length;
    
    expect(successCount).toBe(1000);
    
    // 验证：库存为 0
    const product = await prisma.product.findFirst({
      where: { id: 'product-1' },
    });
    expect(product.stock).toBe(0);
  });
  
  it('应该在库存不足时抛出清晰错误', async () => {
    await prisma.product.update({
      where: { id: 'product-1' },
      data: { stock: 1 },
    });
    
    // 第一次下单成功
    await deductStock('product-1', 1);
    
    // 第二次下单失败
    await expect(deductStock('product-1', 1))
      .rejects.toThrow('Stock not sufficient');
  });
  
  it('应该在乐观锁冲突时重试', async () => {
    // Mock 乐观锁冲突
    prisma.product.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Lock conflict', {
        code: 'P2003',
        clientVersion: '4.0.0',
      })
    );
    
    // 应该重试成功
    await expect(deductStock('product-1', 1)).resolves.not.toThrow();
    
    // 验证：重试了 1 次
    expect(prisma.product.update).toHaveBeenCalledTimes(2);
  });
});
```

**测试结果**：
```
$ npm test -- inventory

> 45 passed, 0 failed

并发测试:
✅ 1000 次并发下单无失败
✅ 库存不足时抛出清晰错误
✅ 乐观锁冲突时重试
```

---

### 步骤 5：验证完成（$verifier）

**指令**：
```
$verifier "验证库存竞态条件 bug 已修复，无回归"
```

**验证报告**：
```markdown
## 验证报告

### Bug 修复验证
- [x] 根因已识别（竞态条件）
- [x] 修复已实施（乐观锁 + 重试）
- [x] 并发测试通过（1000/1000）
- [x] 性能无明显下降（p95 +10ms）

### 回归测试
- [x] 所有现有测试通过（45/45）
- [x] 新增回归测试通过（3/3）
- [x] 集成测试通过（15/15）

### 代码质量
- [x] 错误日志清晰（包含重试次数、version）
- [x] 代码审查通过
- [x] TypeScript 编译通过
- [x] Lint 无警告

### 监控准备
- [x] 重试率指标已添加
- [x] 失败告警已配置
- [x] 仪表盘已更新

## 结论
✅ Bug 已修复，无回归，可以上线
```

---

### 步骤 6：事后复盘（$note）

**指令**：
```
$note "记录库存竞态条件 bug 的事后复盘"
```

**复盘报告**：
```markdown
# 事后复盘报告

## 时间线
- 2026-04-03 10:00：用户首次报告
- 10:15：确认为 P0 bug
- 10:30：$debugger 开始根因分析
- 11:00：根因确认（竞态条件）
- 11:15：$plan 制定修复计划
- 11:30：$ralph 开始修复
- 12:15：修复完成，测试通过
- 12:30：$verifier 验证通过
- 13:00：上线

## 根因
库存检查和使用之间有时间窗口，并发下单时发生竞态条件。

## 修复
- 添加乐观锁（version 字段）
- 添加重试逻辑（最多 5 次）
- 添加详细日志和监控

## 改进措施
1. **短期**（本周）
   - [x] 修复 bug
   - [x] 添加回归测试
   - [ ] 审查其他并发代码路径

2. **中期**（本月）
   - [ ] 添加并发测试模板
   - [ ] 代码审查清单添加并发检查
   - [ ] 监控告警完善

3. **长期**（下季度）
   - [ ] 考虑引入分布式锁服务
   - [ ] 架构评审并发敏感流程

## 学习
- 并发 bug 需要系统性调试
- 乐观锁 + 重试是有效方案
- 回归测试防止复发很重要
```

---

## 最终交付

### 修改的文件

```typescript
// src/inventory/deductStock.ts（修改）
- 添加 version 字段乐观锁
- 添加重试逻辑
- 添加详细日志

// src/inventory/deductStock.test.ts（新增）
- 并发测试用例
- 重试测试用例
- 边界情况测试

// src/monitoring/metrics.ts（修改）
- 添加重试率指标
- 添加失败告警

// docs/postmortem/inventory-race-condition.md（新增）
- 事后复盘报告
```

### 监控指标

```typescript
// 重试率
inventory.deduct.retry_rate = retry_count / total_count

// 失败率
inventory.deduct.failure_rate = failure_count / total_count

// 延迟
inventory.deduct.latency.p95 = 110ms

// 告警
- 重试率 > 1% → 警告
- 失败率 > 0.1% → 严重
```

---

## 验证清单

```markdown
## Bug 修复
- [x] 根因已识别
- [x] 修复已实施
- [x] 并发测试通过
- [x] 性能可接受

## 回归预防
- [x] 回归测试已添加
- [x] 所有测试通过
- [x] 监控告警已配置

## 文档
- [x] 事后复盘报告
- [x] 代码注释更新
- [x] 运行手册更新
```

---

## 经验总结

### ✅ 做得好的

1. **系统性调试**：$debugger 按步骤定位根因
2. **修复彻底**：乐观锁 + 重试 + 日志 + 监控
3. **回归测试**：防止复发
4. **事后复盘**：学习并改进流程

### ⚠️ 可以改进的

1. **早期发现**：可以添加更早的监控告警
2. **测试覆盖**：并发测试应该更早添加
3. **代码审查**：并发代码审查清单不完善

### 📝 关键学习

1. **$debugger 很有用**：系统性地定位根因
2. **乐观锁 + 重试**：处理并发竞态的有效方案
3. **回归测试重要**：防止同一 bug 复发
4. **监控告警**：早发现早处理

---

## 下一步

1. **审查其他并发路径**：
   ```
   $analyze "找出其他可能有竞态条件的代码"
   ```

2. **添加并发测试模板**：
   ```
   $executor "创建并发测试工具函数"
   ```

3. **代码审查清单**：
   ```
   $plan "更新代码审查清单，添加并发检查"
   ```

---

## 总结

通过这个案例，你学习了：

- ✅ `$debugger` 系统性定位根因
- ✅ `$plan --direct` 制定修复计划
- ✅ `$ralph` 持久修复
- ✅ `$test-engineer` 添加回归测试
- ✅ `$verifier` 验证完成
- ✅ `$note` 事后复盘

**下一步**：尝试 [最佳实践案例 04：代码审查](./04-code-review.md)

[🔙 返回使用手册](../usage-guide.md)
