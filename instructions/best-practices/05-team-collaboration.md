# 最佳实践案例 05：团队协作开发

> 使用 $team 协调多智能体并行开发

<!-- omq:generated:best-practice -->

## 场景描述

你需要在一个紧迫的截止日期前完成一个大型功能：**实时聊天系统**。本案例展示如何使用 `$team` 协调多个智能体并行开发，按时交付。

**学习目标**：
- 使用 `$deep-interview` 澄清复杂需求
- 使用 `$plan --consensus` 规划大型功能
- 使用 `$team` 协调 3+ 智能体并行开发
- 使用 `$ralph` 持久验证集成

**预计时间**：90-120 分钟

**难度**：进阶

---

## 业务背景

**需求**：为电商平台添加实时聊天功能，支持买家和卖家沟通。

**初始描述**：
```
"我们需要一个实时聊天系统，买家可以联系卖家咨询商品，
支持文字、图片、订单卡片，消息要实时送达，
需要离线消息、已读回执、消息历史，
还要有敏感词过滤和举报功能。"
```

**挑战**：
- 功能复杂（多种消息类型、实时性、离线处理）
- 技术难度高（WebSocket、消息推送、并发）
- 时间紧迫（2 周上线）
- 质量要求高（电商场景，影响用户体验）

---

## 完整流程

### 阶段 1：需求澄清（$deep-interview）

**指令**：
```
$deep-interview --deep "电商平台实时聊天系统"
```

**采访摘要**（15 轮）：

```
Round 1-4: 意图和场景
- 为什么：提高购买转化率，减少咨询障碍
- 用户场景：买家咨询商品、售后沟通
- 核心指标：消息送达率>99%，延迟<500ms

Round 5-8: 功能范围
- 消息类型：文字、图片、订单卡片、快捷回复
- 实时性：WebSocket 长连接
- 离线消息：推送通知 + 上线后同步
- 额外功能：已读回执、消息历史、敏感词过滤、举报

Round 9-12: 技术约束
- 技术栈：Node.js + Socket.IO + Redis + MongoDB
- 并发：支持 10000 同时在线
- 存储：消息保留 90 天
- 合规：敏感词过滤（第三方 API）

Round 13-15: 边界和成功标准
- 非目标：语音/视频通话（v2）、群聊（v2）
- 决策边界：OMQ 可决定 schema、协议细节
- 成功标准：压测 10000 并发、延迟<500ms、送达率>99%

## 完成
最终模糊度：0.12 ≤ 0.15 ✅
```

**输出**：
- `.omq/specs/deep-interview-chat-system.md`

---

### 阶段 2：共识规划（$plan --consensus --deliberate）

**指令**：
```
$plan --consensus --deliberate .omq/specs/deep-interview-chat-system.md
```

**说明**：使用 `--deliberate` 因为是高风险功能（高并发、实时性要求）。

**规划过程**：

```
1. Planner 创建初始计划 + RALPLAN-DR 摘要
2. Architect 审查（反论、权衡、综合）
3. Critic 评估（一致性、风险、验证）
4. 循环 4 次直到批准
5. 输出最终计划 + ADR + 人员配置指导
```

**RALPLAN-DR 摘要**：
```markdown
## 原则
1. 消息绝对不能丢失
2. 实时性优先（延迟<500ms）
3. 可扩展（支持 10000 并发）

## 决策驱动因素
1. 高并发性能
2. 消息可靠性
3. 开发效率

## 可行选项

### 选项 A：Socket.IO + Redis Adapter
**优点**：
- 成熟稳定
- 自动处理重连
- Redis 多节点支持

**缺点**：
- 额外依赖
- 内存占用较高

### 选项 B：原生 WebSocket + 自研
**优点**：
- 轻量
- 完全控制

**缺点**：
- 实现复杂
- 需要处理重连、心跳等

## 决策
选择选项 A（Socket.IO + Redis），因为：
- 开发效率高（符合 2 周上线）
- 成熟稳定（减少风险）
- Redis 支持水平扩展
```

**预演失败**：
```markdown
## 失败场景 1：消息丢失
**原因**：Redis 故障、节点宕机
**预防**：消息持久化 + 确认机制
**检测**：消息对账任务
**响应**：自动重发

## 失败场景 2：延迟过高
**原因**：并发过高、网络拥堵
**预防**：限流 + 降级
**检测**：延迟监控告警
**响应**：扩容 + 降级（图片延迟加载）

## 失败场景 3：连接风暴
**原因**：服务恢复后大量重连
**预防**：指数退避 + 随机抖动
**检测**：连接数监控
**响应**：限流 + 排队
```

**人员配置指导**：
```markdown
## 可用角色清单
- executor（实现）
- test-engineer（测试）
- debugger（调试）
- verifier（验证）

## 人员配置建议
- 实现通道：executor × 3
  - Worker-1: WebSocket 层 + 消息路由
  - Worker-2: 消息存储 + 离线处理
  - Worker-3: 敏感词过滤 + 举报
- 测试通道：test-engineer × 1
- 验证通道：verifier × 1

## 启动提示
```bash
omq team 3:executor "实现实时聊天系统"
```

## 团队验证路径
- 单元测试：覆盖率>90%
- 集成测试：核心场景 100%
- 压测：10000 并发、延迟<500ms
- 架构师验证：通过
```

**输出**：
- `.omq/plans/prd-chat-system.md`
- `.omq/plans/test-spec-chat-system.md`

---

### 阶段 3：团队开发（$team）

**指令**：
```bash
omq team 3:executor "按照计划实现实时聊天系统"
```

**团队配置**：
```
团队名称：chat-system
Workers: 3
- Worker-1: WebSocket 层 + 消息路由
- Worker-2: 消息存储 + 离线处理
- Worker-3: 敏感词过滤 + 举报
```

**任务分配**：
```
Task-1: Worker-1 → Socket.IO 服务器搭建
Task-2: Worker-1 → 连接管理（认证、心跳、断开）
Task-3: Worker-1 → 消息路由（私聊、广播）
Task-4: Worker-2 → MongoDB schema 设计
Task-5: Worker-2 → 消息持久化
Task-6: Worker-2 → 离线消息处理
Task-7: Worker-3 → 敏感词过滤（第三方 API 集成）
Task-8: Worker-3 → 举报功能
Task-9: Worker-3 → 管理后台 API
Task-10: Worker-1 → 已读回执
Task-11: Worker-2 → 消息历史查询
Task-12: Worker-3 → 快捷回复模板
```

**执行过程**：

```
T+0m: 团队启动
T+10m: Worker-1 完成 Socket.IO 服务器
T+15m: Worker-2 完成 MongoDB schema
T+20m: Worker-3 完成敏感词 API 集成
T+30m: Worker-1 完成连接管理
T+35m: Worker-2 完成消息持久化
T+40m: Worker-1 完成消息路由
T+45m: Worker-2 完成离线消息处理
T+50m: Worker-3 完成举报功能
T+55m: Worker-1 完成已读回执
T+60m: Worker-2 完成消息历史查询
T+65m: Worker-3 完成快捷回复
T+70m: 所有代码提交
```

**状态监控**：
```bash
# 每 30 秒检查一次
omq team status chat-system
```

**状态输出**：
```json
{
  "team_name": "chat-system",
  "workers": 3,
  "tasks": {
    "pending": 0,
    "in_progress": 2,
    "completed": 10,
    "failed": 0
  },
  "status": "running"
}
```

**团队通信**：
```markdown
## Worker-1 → Leader（ACK）
```
已收到任务，开始实现 Socket.IO 服务器。
```

## Worker-2 → Worker-1（依赖）
```
MongoDB schema 已完成，消息存储可以开始了。
```

## Leader → All Workers（通知）
```
所有 worker 注意：请在完成后立即提交代码，
便于集成测试。
```
```

---

### 阶段 4：集成验证（$ralph）

**指令**：
```
$ralph "集成聊天系统，验证所有功能正常工作"
```

**验证过程**：

```
迭代 1/10:
- 运行单元测试：85/90 通过（5 个失败）
- 失败：边界情况未处理
- 修复：添加空值检查、错误处理
- 重新测试：90/90 通过 ✅

迭代 2/10:
- 运行集成测试：25/30 通过（5 个失败）
- 失败：WebSocket 连接超时、离线消息推送
- 修复：调整超时时间、修复推送逻辑
- 重新测试：30/30 通过 ✅

迭代 3/10:
- 压力测试：8000 并发（目标 10000）
- 失败：内存泄漏
- 修复：修复连接未释放问题
- 重新测试：10000 并发通过 ✅

迭代 4/10:
- 延迟测试：p95=450ms（目标<500ms）✅
- 送达率：99.5%（目标>99%）✅
- 架构师验证：APPROVED

迭代 5/10:
- Deslop 清理：优化代码结构
- 回归验证：所有测试通过 ✅

## 完成
- 测试：120/120 通过 ✅
- 压测：10000 并发 ✅
- 延迟：p95=420ms ✅
- 送达率：99.6% ✅
- 架构师验证：APPROVED ✅
```

---

### 阶段 5：测试完善（$test-engineer）

**指令**：
```
$test-engineer "为聊天系统添加完整的测试覆盖"
```

**测试用例**：

```typescript
// WebSocket 连接测试
describe('WebSocket 连接', () => {
  it('应该成功建立连接', async () => {
    const socket = io(SERVER_URL, {
      auth: { token: validToken },
    });
    
    await waitForEvent(socket, 'connect');
    expect(socket.connected).toBe(true);
  });
  
  it('应该拒绝无效 token', async () => {
    const socket = io(SERVER_URL, {
      auth: { token: invalidToken },
    });
    
    await waitForEvent(socket, 'connect_error');
    expect(socket.connected).toBe(false);
  });
  
  it('应该处理重连', async () => {
    const socket = io(SERVER_URL);
    await waitForEvent(socket, 'connect');
    
    // 模拟断开
    socket.disconnect();
    
    // 自动重连
    await waitForEvent(socket, 'reconnect');
    expect(socket.connected).toBe(true);
  });
});

// 消息路由测试
describe('消息路由', () => {
  it('应该成功发送私聊消息', async () => {
    const sender = createSocket();
    const receiver = createSocket();
    
    sender.emit('message', {
      to: receiver.userId,
      content: 'Hello',
      type: 'text',
    });
    
    const received = await waitForEvent(receiver, 'message');
    expect(received.content).toBe('Hello');
  });
  
  it('应该存储消息', async () => {
    const sender = createSocket();
    
    sender.emit('message', {
      to: 'user-2',
      content: 'Hello',
      type: 'text',
    });
    
    const message = await db.message.findFirst();
    expect(message).toBeDefined();
    expect(message.content).toBe('Hello');
  });
  
  it('应该推送离线消息', async () => {
    const sender = createSocket();
    const offlineUser = 'offline-user'; // 不在线
    
    sender.emit('message', {
      to: offlineUser,
      content: 'Hello',
      type: 'text',
    });
    
    // 验证离线消息队列
    const offlineMessages = await db.offlineMessage.findMany({
      where: { userId: offlineUser },
    });
    expect(offlineMessages.length).toBe(1);
  });
});

// 压力测试
describe('压力测试', () => {
  it('应该支持 10000 并发连接', async () => {
    const sockets = await createManySockets(10000);
    
    // 验证所有连接成功
    const connected = sockets.filter(s => s.connected);
    expect(connected.length).toBeGreaterThanOrEqual(9900); // 99%
    
    // 清理
    sockets.forEach(s => s.disconnect());
  }, 60000); // 60 秒超时
  
  it('应该在 10000 并发下延迟<500ms', async () => {
    const sender = createSocket();
    const receivers = await createManySockets(10000);
    
    const start = Date.now();
    
    sender.emit('broadcast', {
      content: 'Hello',
    });
    
    // 等待所有消息送达
    await waitForAllMessages(receivers);
    
    const latency = Date.now() - start;
    expect(latency).toBeLessThan(500);
    
    receivers.forEach(s => s.disconnect());
  }, 60000);
});
```

**测试结果**：
```
$ npm test -- chat

> 120 passed, 0 failed

分类：
- WebSocket 连接：15/15
- 消息路由：25/25
- 离线处理：20/20
- 敏感词过滤：15/15
- 举报功能：15/15
- 压力测试：10/10
- 集成测试：20/20

覆盖率：
- 语句：95%
- 分支：92%
- 函数：96%
- 行：94%
```

---

## 最终交付

### 系统架构

```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Gateway   │
└─────────────┘     │  (Nginx)    │
                    └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌────▼────┐ ┌────▼────┐
        │  Node 1   │ │ Node 2  │ │ Node N  │
        │ Socket.IO │ │ Socket.IO│ │ Socket.IO│
        └─────┬─────┘ └────┬────┘ └────┬────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │
                    │  (Adapter)  │
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  MongoDB    │
                    │ (Persistence)│
                    └─────────────┘
```

### 核心代码

**Socket.IO 服务器**：
```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './redis';

const io = new Server({
  cors: { origin: process.env.CLIENT_URL },
});

// Redis Adapter（多节点支持）
io.adapter(createAdapter(pubClient, subClient));

// 认证中间件
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = await verifyToken(token);
    socket.userId = user.id;
    next();
  } catch (e) {
    next(new Error('Authentication failed'));
  }
});

// 连接处理
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // 加入用户房间
  socket.join(`user:${socket.userId}`);
  
  // 心跳
  socket.on('ping', () => socket.emit('pong'));
  
  // 消息
  socket.on('message', async (data) => {
    await handleMessage(socket.userId, data);
  });
  
  // 断开
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});
```

**消息处理**：
```typescript
async function handleMessage(fromUserId: string, data: MessageData) {
  const { to, content, type } = data;
  
  // 敏感词过滤
  const filteredContent = await filterSensitiveWords(content);
  
  // 存储消息
  const message = await db.message.create({
    data: {
      from: fromUserId,
      to,
      content: filteredContent,
      type,
    },
  });
  
  // 发送给接收者
  const receiverOnline = await isOnline(to);
  if (receiverOnline) {
    io.to(`user:${to}`).emit('message', {
      id: message.id,
      from: fromUserId,
      content: filteredContent,
      type,
      timestamp: message.createdAt,
    });
    
    // 已读回执
    socket.emit('message:delivered', { messageId: message.id });
  } else {
    // 离线消息
    await db.offlineMessage.create({
      data: {
        userId: to,
        messageId: message.id,
      },
    });
    
    // 推送通知
    await sendPushNotification(to, {
      title: '新消息',
      body: filteredContent,
    });
  }
}
```

---

## 验证清单

```markdown
## 功能验证
- [x] WebSocket 连接（认证、心跳、重连）
- [x] 消息路由（私聊、广播）
- [x] 消息存储（MongoDB 持久化）
- [x] 离线消息（推送 + 同步）
- [x] 已读回执
- [x] 消息历史查询
- [x] 敏感词过滤
- [x] 举报功能
- [x] 快捷回复

## 非功能验证
- [x] 压力测试：10000 并发
- [x] 延迟：p95 < 500ms
- [x] 送达率：> 99%
- [x] 消息不丢失：100% 持久化

## 代码质量
- [x] 测试覆盖率：95%
- [x] TypeScript 编译：通过
- [x] Lint: 无警告
- [x] 架构师验证：APPROVED
```

---

## 经验总结

### ✅ 做得好的

1. **深度采访**：15 轮确保需求清晰
2. **共识规划**：Deliberate 模式识别关键风险
3. **团队并行**：3 个 worker 高效分工
4. **持久验证**：Ralph 确保集成顺利
5. **测试完善**：95% 覆盖率

### ⚠️ 可以改进的

1. **时间估计**：实际耗时比预期长 25%
2. **文档**：API 文档可以更详细
3. **监控**：可以添加更多业务指标

### 📝 关键学习

1. **$team 适合大型功能**：3 个 worker 并行效率高
2. **清晰分工重要**：每个 worker 职责明确
3. **集成验证必须**：Ralph 发现 5 个集成问题
4. **压测很重要**：提前发现性能瓶颈

---

## 下一步

1. **监控告警**：
   ```
   $executor "添加聊天系统监控指标和告警"
   ```

2. **管理后台**：
   ```
   $team 2:executor "实现聊天管理后台 UI"
   ```

3. **v2 规划**：
   ```
   $plan "规划语音/视频通话、群聊功能"
   ```

---

## 总结

通过这个案例，你学习了：

- ✅ `$deep-interview --deep` 澄清复杂需求
- ✅ `$plan --consensus --deliberate` 高风险规划
- ✅ `$team 3:executor` 协调多智能体并行
- ✅ `$ralph` 持久集成验证
- ✅ `$test-engineer` 完善测试覆盖

**下一步**：尝试 [最佳实践案例 06：需求收集实战](./06-requirements-gathering.md)

[🔙 返回使用手册](../usage-guide.md)
