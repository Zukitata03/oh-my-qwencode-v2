# 最佳实践案例 07：遗留代码重构

> 安全、系统地重构遗留代码

<!-- omq:generated:best-practice -->

## 场景描述

你的团队有一个运行了 3 年的遗留认证模块，代码质量差、测试覆盖率低、难以维护。本案例展示如何使用 OMQ 安全、系统地重构遗留代码。

**学习目标**：
- 使用 `$architect` 分析遗留代码
- 使用 `$plan` 制定重构策略
- 使用 `$ralph` 持久重构
- 使用 `$test-engineer` 补充测试
- 使用 `$code-simplifier` 清理代码

**预计时间**：90-120 分钟

**难度**：进阶

---

## 遗留代码背景

**模块**：用户认证模块（auth）

**当前状态**：
```
- 代码行数：2500 行
- 平均函数行数：65 行
- 圈复杂度：15（高）
- 测试覆盖率：25%
- 代码重复率：18%
- 技术债务：高
```

**问题**：
- 函数过长（最长 200 行）
- 嵌套过深（最多 7 层）
- 重复代码多
- 命名不清晰（`func1`, `data2`）
- 错误处理不一致
- 无类型注解（JavaScript）

**目标**：
- 重构为 TypeScript
- 函数行数 < 30
- 测试覆盖率 > 85%
- 消除重复代码
- 改进命名和注释

---

## 完整流程

### 步骤 1：架构分析（$architect）

**指令**：
```
$architect "分析遗留认证模块的架构问题和技术债务"
```

**分析过程**：

```
Phase 1: 代码结构分析
- 读取所有源文件
- 识别模块和依赖
- 绘制调用图

Phase 2: 问题识别
- 过长函数
- 深嵌套
- 重复代码
- 坏味道（God Class、Feature Envy 等）

Phase 3: 技术债务评估
- 估算修复工作量
- 优先级排序
- 风险识别

Phase 4: 重构建议
- 短期（1-2 周）
- 中期（1-2 月）
- 长期（3-6 月）
```

**分析报告**：
```markdown
# 遗留代码分析报告

## 代码结构

```
src/auth/
├── login.js (800 行)
├── register.js (600 行)
├── password.js (400 行)
├── session.js (500 行)
└── middleware.js (200 行)
```

## 问题清单

### 严重问题（P0）

1. **God Class: login.js**
   - 800 行，承担过多职责
   - 登录、验证、日志、限流都在一个文件
   - 建议：拆分为 login.controller.js, login.validator.js, rateLimiter.js

2. **过长函数：validateUser()**
   - 200 行，7 层嵌套
   - 建议：拆分为 5-6 个小函数

3. **重复代码**
   - password.js 和 register.js 有 80% 重复
   - 建议：提取为 shared/password.utils.js

4. **无错误处理**
   - 多处无 try-catch
   - 建议：统一错误处理中间件

### 中等问题（P1）

5. **命名不清晰**
   - func1, data2, temp 等命名
   - 建议：重命名为有意义的名称

6. **无类型注解**
   - 纯 JavaScript，无类型检查
   - 建议：迁移到 TypeScript

7. **测试不足**
   - 覆盖率 25%
   - 建议：补充到 85%+

## 技术债务估算

| 问题 | 修复时间 | 优先级 |
|------|---------|-------|
| God Class 拆分 | 2 天 | P0 |
| 函数拆分 | 2 天 | P0 |
| 重复代码提取 | 1 天 | P0 |
| 错误处理统一 | 1 天 | P0 |
| 命名改进 | 1 天 | P1 |
| TypeScript 迁移 | 3 天 | P1 |
| 测试补充 | 3 天 | P1 |

总计：13 天

## 重构策略

### 推荐策略：增量重构
1. 先补充关键测试（保护网）
2. 小步重构（每次一个函数）
3. 持续验证（每次重构后测试）
4. 最后迁移 TypeScript

### 风险缓解
- 每次重构不超过 50 行
- 重构前后运行完整测试
- 保留回滚能力
```

---

### 步骤 2：重构规划（$plan --direct）

**指令**：
```
$plan --direct "制定遗留认证模块重构计划，增量策略"
```

**重构计划**：
```markdown
# 认证模块重构计划

## 策略：增量重构

### Phase 1: 建立保护网（Day 1-2）
- 为关键函数添加测试
- 目标：覆盖率 25% → 50%
- 重点：登录、注册、密码验证

### Phase 2: 拆分 God Class（Day 3-4）
- 拆分 login.js
- 提取：login.controller.js, login.validator.js, rateLimiter.js
- 保持行为不变（测试验证）

### Phase 3: 函数重构（Day 5-6）
- 拆分 validateUser() 等长函数
- 目标：平均函数行数 < 30
- 改进命名和注释

### Phase 4: 消除重复（Day 7）
- 提取 shared/password.utils.js
- 提取 shared/email.utils.js
- 消除 80% 重复

### Phase 5: 错误处理统一（Day 8）
- 添加统一错误类
- 添加错误处理中间件
- 统一错误格式

### Phase 6: TypeScript 迁移（Day 9-11）
- 添加类型定义
- 逐文件迁移（.js → .ts）
- 类型检查通过

### Phase 7: 测试完善（Day 12-13）
- 补充边界情况测试
- 目标：覆盖率 85%+
- 集成测试

## 验收标准
- [ ] 所有现有测试通过
- [ ] 新增测试覆盖率 > 85%
- [ ] 函数平均行数 < 30
- [ ] 无 God Class
- [ ] 重复率 < 5%
- [ ] TypeScript 编译通过
- [ ] 无回归 bug

## 风险
- 重构引入 bug → 缓解：充分测试
- 时间超支 → 缓解：增量进行，随时可停
```

---

### 步骤 3：持久重构（$ralph）

**指令**：
```
$ralph "按照计划重构认证模块，先补充测试保护网"
```

**重构过程**：

```
迭代 1/15:
- 任务：补充登录功能测试
- 新增测试：15 个
- 覆盖率：25% → 40%
- 测试：15/15 通过 ✅

迭代 2/15:
- 任务：补充注册功能测试
- 新增测试：12 个
- 覆盖率：40% → 50%
- 测试：27/27 通过 ✅

迭代 3/15:
- 任务：补充密码验证测试
- 新增测试：10 个
- 覆盖率：50% → 55%
- 测试：37/37 通过 ✅

迭代 4/15:
- 任务：拆分 login.js（God Class）
- 新增文件：
  - login.controller.js
  - login.validator.js
  - rateLimiter.js
- 删除文件：
  - login.js（800 行）
- 测试：37/37 通过 ✅（行为不变）

迭代 5/15:
- 任务：拆分 validateUser() 函数
- 原函数：200 行 → 拆分为 6 个函数
  - validateEmailFormat()
  - validatePasswordStrength()
  - findUserByEmail()
  - verifyPassword()
  - checkAccountStatus()
  - generateTokens()
- 最长函数：35 行
- 测试：37/37 通过 ✅

迭代 6/15:
- 任务：提取重复代码
- 新增文件：
  - shared/password.utils.js
  - shared/email.utils.js
- 重复率：18% → 5%
- 测试：37/37 通过 ✅

迭代 7/15:
- 任务：统一错误处理
- 新增文件：
  - errors/AuthError.js
  - middleware/errorHandler.js
- 统一错误格式：
  ```json
  {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "statusCode": 401
  }
  ```
- 测试：40/40 通过 ✅

迭代 8/15:
- 任务：改进命名
- 重命名函数：
  - func1 → validateEmailFormat
  - data2 → userCredentials
  - temp → resetToken
- 添加注释：
  - 所有公开函数添加 JSDoc
  - 复杂逻辑添加行内注释
- 测试：40/40 通过 ✅

迭代 9-14/15:
- 任务：TypeScript 迁移
- 逐文件迁移：
  - login.controller.ts
  - login.validator.ts
  - rateLimiter.ts
  - ...
- 添加类型定义：
  - User, LoginRequest, RegisterRequest, etc.
- 测试：45/45 通过 ✅

迭代 15/15:
- 任务：补充测试到 85%
- 新增测试：30 个
- 覆盖率：55% → 88%
- 测试：75/75 通过 ✅
- 架构师验证：APPROVED

## 完成
- 测试：75/75 通过 ✅
- 覆盖率：88%（目标 85%）✅
- 函数平均行数：22（目标<30）✅
- 重复率：3%（目标<5%）✅
- TypeScript 编译：通过 ✅
- 架构师验证：APPROVED ✅
```

---

### 步骤 4：测试补充（$test-engineer）

**指令**：
```
$test-engineer "为重构后的认证模块补充边界情况测试"
```

**测试用例**：

```typescript
// 边界情况测试
describe('认证边界情况', () => {
  describe('登录', () => {
    it('应该拒绝大小写混合的邮箱', async () => {
      // 注册时使用 TEST@example.com
      await register('TEST@example.com', 'password123');
      
      // 登录时使用 test@example.com 应该成功（不区分大小写）
      const result = await login('test@example.com', 'password123');
      expect(result.user.email).toBe('test@example.com');
    });
    
    it('应该拒绝已禁用的账户', async () => {
      await register('user@example.com', 'password123');
      await disableAccount('user@example.com');
      
      await expect(
        login('user@example.com', 'password123')
      ).rejects.toThrow('Account is disabled');
    });
    
    it('应该限制登录失败次数', async () => {
      const email = 'user@example.com';
      await register(email, 'password123');
      
      // 5 次失败后锁定
      for (let i = 0; i < 5; i++) {
        await expect(login(email, 'wrong-password'))
          .rejects.toThrow('Invalid credentials');
      }
      
      // 第 6 次应该被限流
      await expect(login(email, 'password123'))
        .rejects.toThrow('Too many login attempts');
    }, 10000);
  });
  
  describe('密码验证', () => {
    it('应该拒绝弱密码', async () => {
      await expect(register('user@example.com', '123456'))
        .rejects.toThrow('Password too weak');
      
      await expect(register('user@example.com', 'password'))
        .rejects.toThrow('Password too weak');
    });
    
    it('应该接受强密码', async () => {
      const result = await register(
        'user@example.com',
        'Str0ng!Password'
      );
      expect(result.user).toBeDefined();
    });
    
    it('应该哈希密码后再存储', async () => {
      await register('user@example.com', 'Str0ng!Password');
      
      const user = await db.user.findFirst({
        where: { email: 'user@example.com' },
      });
      
      // 密码应该是哈希值，不是明文
      expect(user.password).not.toBe('Str0ng!Password');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt 格式
    });
  });
  
  describe('Token 管理', () => {
    it('应该生成有效的 access token', async () => {
      const { accessToken } = await login('user@example.com', 'password123');
      
      const decoded = verifyToken(accessToken);
      expect(decoded.userId).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
    
    it('应该拒绝过期的 token', async () => {
      const expiredToken = generateExpiredToken();
      
      await expect(verifyToken(expiredToken))
        .rejects.toThrow('Token expired');
    });
    
    it('应该支持 refresh token', async () => {
      const { refreshToken } = await login('user@example.com', 'password123');
      
      const newTokens = await refreshTokens(refreshToken);
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
    });
  });
});
```

**测试结果**：
```
$ npm test -- auth

> 75 passed, 0 failed

分类：
- 登录：20/20
- 注册：15/15
- 密码验证：15/15
- Token 管理：15/15
- 边界情况：10/10

覆盖率：
- 语句：92%
- 分支：88%
- 函数：94%
- 行：90%
```

---

### 步骤 5：代码简化（$code-simplifier）

**指令**：
```
$code-simplifier "简化重构后的认证代码，提高可读性"
```

**简化报告**：
```markdown
# 代码简化报告

## 简化内容

### 1. 函数简化
```typescript
// 简化前
async function validateUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  // ... 30 行
}

// 简化后
async function validateUser(credentials: Credentials): Promise<User> {
  validateCredentialsFormat(credentials);
  const user = await findUser(credentials.email);
  await verifyUserPassword(user, credentials.password);
  return user;
}
```

### 2. 注释改进
```typescript
// 简化前
// 检查密码
const match = await bcrypt.compare(password, hash);

// 简化后
/**
 * 验证密码是否匹配
 * @param password 用户输入的密码
 * @param hash 数据库中存储的哈希值
 * @throws {AuthError} 密码不匹配时抛出
 */
async function verifyPassword(password: string, hash: string): Promise<void> {
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    throw new AuthError('AUTH_PASSWORD_MISMATCH');
  }
}
```

### 3. 错误处理简化
```typescript
// 简化前
try {
  const user = await db.user.findUnique(...);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
} catch (e) {
  if (e.message === 'User not found') {
    throw e;
  }
  throw new Error('Database error: ' + e.message);
}

// 简化后
const user = await db.user.findUnique(...);
if (!user) {
  throw new AuthError('AUTH_USER_NOT_FOUND');
}
return user;
```

## 简化效果
- 平均函数行数：22 → 18
- 注释覆盖率：60% → 95%
- 可读性评分：6/10 → 9/10
```

---

## 最终交付

### 重构前后对比

| 指标 | 重构前 | 重构后 | 改进 |
|------|-------|-------|------|
| 代码行数 | 2500 | 1800 | -28% |
| 平均函数行数 | 65 | 18 | -72% |
| 最长函数 | 200 | 35 | -82% |
| 圈复杂度 | 15 | 6 | -60% |
| 测试覆盖率 | 25% | 88% | +252% |
| 重复率 | 18% | 3% | -83% |
| 文件数 | 5 | 15 | +200%（拆分） |
| TypeScript | ❌ | ✅ | 迁移完成 |

### 重构后的文件结构

```
src/auth/
├── controllers/
│   ├── login.controller.ts    # 登录逻辑
│   └── register.controller.ts # 注册逻辑
├── validators/
│   ├── login.validator.ts     # 登录验证
│   └── password.validator.ts  # 密码验证
├── services/
│   ├── token.service.ts       # Token 生成/验证
│   └── email.service.ts       # 邮件发送
├── middleware/
│   ├── rateLimiter.ts         # 限流
│   └── errorHandler.ts        # 错误处理
├── errors/
│   └── AuthError.ts           # 自定义错误类
├── shared/
│   ├── password.utils.ts      # 密码工具
│   └── email.utils.ts         # 邮件工具
└── types/
    └── auth.types.ts          # 类型定义
```

---

## 验证清单

```markdown
## 重构验证
- [x] 所有现有测试通过（75/75）
- [x] 新增测试覆盖率 > 85%（实际 88%）
- [x] 函数平均行数 < 30（实际 18）
- [x] 无 God Class（已拆分）
- [x] 重复率 < 5%（实际 3%）
- [x] TypeScript 编译通过
- [x] 无回归 bug

## 代码质量
- [x] 命名清晰
- [x] 注释充分（JSDoc 95%）
- [x] 错误处理统一
- [x] 单一职责原则

## 可维护性
- [x] 模块化设计
- [x] 依赖注入
- [x] 可测试性强
```

---

## 经验总结

### ✅ 做得好的

1. **先补充测试**：建立保护网再重构
2. **增量重构**：小步快跑，随时可停
3. **持久验证**：Ralph 确保每步都验证
4. **测试完善**：88% 覆盖率

### ⚠️ 可以改进的

1. **时间估计**：实际耗时比计划长 20%
2. **文档**：可以添加更多架构文档
3. **监控**：可以添加重构指标监控

### 📝 关键学习

1. **测试保护网重要**：没有测试不敢重构
2. **增量策略有效**：每次小步，风险可控
3. **$code-simplifier 有用**：自动简化提高可读性
4. **架构师验证必要**：确保重构不改变行为

---

## 下一步

1. **持续监控**：
   ```
   $executor "添加代码质量监控指标"
   ```

2. **定期重构**：
   ```
   $plan "建立月度重构日流程"
   ```

3. **知识分享**：
   ```
   $writer "编写重构最佳实践文档"
   ```

---

## 总结

通过这个案例，你学习了：

- ✅ `$architect` 分析遗留代码
- ✅ `$plan --direct` 制定重构计划
- ✅ `$ralph` 持久重构
- ✅ `$test-engineer` 补充测试
- ✅ `$code-simplifier` 简化代码

**下一步**：尝试 [最佳实践案例 08：性能优化](./08-performance-optimization.md)

[🔙 返回使用手册](../usage-guide.md)
