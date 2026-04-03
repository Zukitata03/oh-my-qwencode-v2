# 最佳实践案例 04：代码审查工作流

> 使用 OMQ 进行高效、全面的代码审查

<!-- omq:generated:best-practice -->

## 场景描述

你的团队准备上线一个新功能，需要在合并前进行代码审查。本案例展示如何使用 OMQ 进行多层次、自动化的代码审查。

**学习目标**：
- 使用 `$code-review` 进行全面审查
- 使用 `$security-reviewer` 进行安全审计
- 使用 `$quality-reviewer` 检查代码质量
- 使用 `$performance-reviewer` 优化性能

**预计时间**：30-45 分钟

**难度**：中级

---

## 审查背景

**审查对象**：用户认证模块重构

**变更描述**：
```
重构用户认证模块，从 Session 认证迁移到 JWT 认证。
涉及文件：15 个
代码行数：+1200, -800
影响范围：所有需要认证的 API 端点
```

**审查目标**：
- 安全性：无认证绕过风险
- 质量：符合团队代码规范
- 性能：无明显性能下降
- 可维护性：易于理解和修改

---

## 完整流程

### 步骤 1：全面代码审查（$code-review）

**指令**：
```
$code-review "审查用户认证模块重构，关注安全性、质量和性能"
```

**审查过程**：

```
Phase 1: 变更概览
- 读取 git diff
- 识别关键变更点
- 确定审查重点

Phase 2: 安全性审查
- 认证逻辑是否正确
- Token 生成和验证是否安全
- 有无认证绕过风险

Phase 3: 质量审查
- 代码结构是否清晰
- 命名是否有意义
- 有无重复代码

Phase 4: 性能审查
- 有无性能瓶颈
- 数据库查询是否优化
- 缓存使用是否合理

Phase 5: 可维护性审查
- 注释是否充分
- 测试是否覆盖
- 错误处理是否完善
```

**审查报告**：
```markdown
# 代码审查报告

## 变更概览
- 文件：15 个
- 代码：+1200, -800
- 类型：重构（Session → JWT）

## 安全性审查 🔴

### 严重问题
1. **Token 过期时间过长**
   - 位置：src/auth/jwt.ts:45
   - 问题：access token 设置为 30 天
   - 风险：token 泄露后影响范围大
   - 建议：access token 1 小时，refresh token 7 天

2. **缺少 token 刷新机制**
   - 问题：token 过期后用户需重新登录
   - 建议：实现 refresh token 流程

3. **密码哈希算法过时**
   - 位置：src/auth/password.ts:12
   - 问题：仍在使用 MD5
   - 建议：升级到 bcrypt 或 Argon2

### 中等问题
4. **缺少速率限制**
   - 建议：登录端点添加 rate limiting

5. **Token 存储不安全**
   - 建议：使用 HttpOnly cookie，不用 localStorage

## 质量审查 🟡

### 改进点
1. **函数过长**
   - 位置：src/auth/login.ts:validateUser()
   - 问题：80 行，建议拆分为多个小函数

2. **重复代码**
   - 位置：src/auth/login.ts 和 src/auth/register.ts
   - 问题：密码验证逻辑重复
   - 建议：提取为共享函数

3. **命名不清晰**
   - 位置：src/auth/jwt.ts:verify()
   - 建议：重命名为 verifyToken()

## 性能审查 🟢

### 良好
- 使用 Redis 缓存 token
- 数据库查询有索引
- 批量操作使用 Promise.all

### 建议
1. **缓存穿透风险**
   - 建议：添加缓存空值保护

2. **N+1 查询**
   - 位置：src/auth/middleware.ts
   - 问题：每个请求单独查询用户
   - 建议：批量加载或缓存

## 可维护性审查 🟡

### 良好
- TypeScript 类型定义完整
- 单元测试覆盖率 85%

### 改进点
1. **注释不足**
   - 建议：JWT 生成和验证逻辑添加注释

2. **错误处理不统一**
   - 建议：统一错误格式和状态码

3. **日志不足**
   - 建议：添加认证失败日志

## 总体评价

🔴 需要修复（安全问题）后重新审查

### P0（必须修复）
- Token 过期时间调整
- 密码哈希算法升级
- 添加 token 刷新机制

### P1（建议修复）
- 速率限制
- Token 存储方式
- 函数拆分

### P2（可选优化）
- 代码重复提取
- 命名改进
- 注释补充
```

---

### 步骤 2：安全审计（$security-reviewer）

**指令**：
```
$security-reviewer "深度安全审计认证模块， OWASP Top 10 视角"
```

**审计过程**：

```
OWASP Top 10 检查清单：

1. 注入攻击（A03）
   - 检查：SQL 注入、NoSQL 注入
   - 结果：✅ 使用 Prisma ORM，参数化查询

2. 认证失败（A07）
   - 检查：弱密码、暴力破解、session 固定
   - 结果：⚠️ 缺少速率限制、token 过期时间长

3. 敏感数据泄露（A02）
   - 检查：密码存储、token 传输
   - 结果：⚠️ MD5 哈希、localStorage 存储

4. XXE（A05）
   - 检查：XML 解析
   - 结果：✅ 无 XML 解析

5. 访问控制失效（A01）
   - 检查：权限验证、水平/垂直越权
   - 结果：✅ 中间件统一验证

6. 安全日志和监控（A09）
   - 检查：审计日志、告警
   - 结果：⚠️ 日志不足

7. 其他检查...
```

**审计报告**：
```markdown
# 安全审计报告

## 执行摘要
- 审查范围：用户认证模块
- 审查方法：OWASP Top 10 检查
- 发现：3 个高危、5 个中危、8 个低危

## 高危漏洞

### 1. 密码哈希算法过时（CVSS 7.5）
**位置**：src/auth/password.ts:12
**问题**：使用 MD5 哈希密码
**影响**：彩虹表攻击可破解密码
**修复**：升级到 bcrypt（cost=10）或 Argon2

**修复代码**：
```typescript
// 修复前
const hash = crypto.createHash('md5').update(password).digest('hex');

// 修复后
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
```

### 2. Token 过期时间过长（CVSS 6.5）
**位置**：src/auth/jwt.ts:45
**问题**：access token 30 天
**影响**：token 泄露后长期可用
**修复**：access token 1 小时，refresh token 7 天

### 3. Token 存储不安全（CVSS 6.0）
**位置**：frontend/src/auth.ts
**问题**：localStorage 存储 token
**影响**：XSS 攻击可窃取 token
**修复**：HttpOnly cookie

## 中危漏洞

### 4. 缺少速率限制
**位置**：src/auth/login.ts
**问题**：无登录失败限制
**影响**：暴力破解
**修复**：添加 rate limiting（5 次/分钟）

### 5. 缺少审计日志
**位置**：全局
**问题**：认证失败无日志
**影响**：无法检测攻击
**修复**：添加详细日志

## 低危问题

### 6-10. 其他改进点
- Token 签名算法可升级为 ES256
- 密码策略可加强（特殊字符要求）
- 缺少双因素认证支持
- 等等...

## 修复优先级

### P0（立即修复）
1. 密码哈希升级
2. Token 过期时间调整
3. Token 存储方式

### P1（本周修复）
4. 速率限制
5. 审计日志

### P2（下迭代）
6-10. 其他改进

## 结论

🔴 不建议上线，需修复 P0 问题
```

---

### 步骤 3：代码质量审查（$quality-reviewer）

**指令**：
```
$quality-reviewer "审查代码质量，关注可维护性和最佳实践"
```

**质量报告**：
```markdown
# 代码质量报告

## 代码指标

| 指标 | 值 | 目标 | 状态 |
|------|-----|------|------|
| 行数 | 1200 | <1000 | ⚠️ |
| 函数平均行数 | 25 | <20 | ⚠️ |
| 圈复杂度 | 8 | <10 | ✅ |
| 重复率 | 5% | <5% | ⚠️ |
| 测试覆盖率 | 85% | >90% | ⚠️ |

## 代码异味

### 1. 过长函数
```typescript
// ❌ 80 行
async function validateUser(email, password) {
  // ... 80 行代码
}

// ✅ 建议拆分
async function validateUser(email, password) {
  await validateEmailFormat(email);
  await validatePasswordStrength(password);
  const user = await findUserByEmail(email);
  await verifyPassword(password, user.password);
  checkAccountStatus(user);
  return generateTokens(user);
}
```

### 2. 重复代码
```typescript
// login.ts 和 register.ts 都有
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

// ✅ 建议提取
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
```

### 3. 过深的嵌套
```typescript
// ❌ 5 层嵌套
if (user) {
  if (user.active) {
    if (passwordMatch) {
      if (emailVerified) {
        // ...
      }
    }
  }
}

// ✅ 提前返回
if (!user) throw new Error('User not found');
if (!user.active) throw new Error('Account inactive');
if (!passwordMatch) throw new Error('Password mismatch');
if (!emailVerified) throw new Error('Email not verified');
// ...
```

## 最佳实践

### 遵循的
- ✅ TypeScript 严格模式
- ✅ ESLint 规则
- ✅ 异步/等待（不用回调）
- ✅ 错误继承自定义 Error

### 违反的
- ❌ 单一职责原则（大函数）
- ❌ DRY 原则（重复代码）
- ❌ 早返回原则（深嵌套）

## 改进建议

### 重构优先级
1. 拆分大函数（P0）
2. 提取重复代码（P0）
3. 减少嵌套（P1）
4. 改进命名（P2）

### 测试改进
- 增加边界情况测试
- 增加错误处理测试
- 目标覆盖率：90%+
```

---

### 步骤 4：性能审查（$performance-reviewer）

**指令**：
```
$performance-reviewer "审查性能，找出瓶颈和优化机会"
```

**性能报告**：
```markdown
# 性能审查报告

## 性能指标

| 端点 | p50 | p95 | p99 | 目标 p95 |
|------|-----|-----|-----|---------|
| POST /login | 50ms | 120ms | 200ms | <100ms |
| POST /refresh | 30ms | 80ms | 150ms | <80ms |
| GET /me | 20ms | 50ms | 100ms | <50ms |

## 性能瓶颈

### 1. N+1 查询 🔴
**位置**：src/auth/middleware.ts
**问题**：每个请求单独查询用户
```typescript
// ❌ 每次请求都查询
const user = await prisma.user.findUnique({
  where: { id: token.userId },
});
```

**优化**：
```typescript
// ✅ Redis 缓存
const cached = await redis.get(`user:${token.userId}`);
if (cached) return JSON.parse(cached);

const user = await prisma.user.findUnique({
  where: { id: token.userId },
});
await redis.setex(`user:${token.userId}`, 300, JSON.stringify(user));
return user;
```

**预期提升**：p95 从 120ms → 50ms

### 2. 同步哈希 🟡
**位置**：src/auth/password.ts
**问题**：bcrypt 是同步的，阻塞事件循环
```typescript
// ❌ 同步
const match = bcrypt.compareSync(password, hash);
```

**优化**：
```typescript
// ✅ 异步
const match = await bcrypt.compare(password, hash);
```

**预期提升**：减少事件循环阻塞

### 3. 缓存穿透风险 🟡
**位置**：src/auth/jwt.ts
**问题**：无效 token 也查询数据库
```typescript
// ❌ 无效 token 也查询
const user = await prisma.user.findUnique(...);
if (!user) throw new Error('Invalid token');
```

**优化**：
```typescript
// ✅ 先验证 token 格式
if (!isValidTokenFormat(token)) {
  throw new Error('Invalid token');
}
// 缓存无效 token
const cached = await redis.get(`invalid:${token}`);
if (cached) throw new Error('Invalid token');
// 查询数据库
const user = await prisma.user.findUnique(...);
```

**预期提升**：减少无效查询 90%

## 优化建议

### P0（立即优化）
1. N+1 查询 → Redis 缓存
2. 同步哈希 → 异步

### P1（本周优化）
3. 缓存穿透保护
4. 批量查询优化

### P2（下迭代）
5. 数据库索引优化
6. 连接池调优
```

---

### 步骤 5：修复和重新验证

**指令**：
```
$ralph "根据审查报告修复所有 P0 问题"
```

**修复过程**：

```
迭代 1/5:
- 修复：密码哈希升级（MD5 → bcrypt）
- 修复：Token 过期时间调整（30 天 → 1 小时/7 天）
- 测试：28/30 通过（2 个失败）
- 失败：refresh token 逻辑未实现
- 修复：实现 refresh token 端点
- 重新测试：30/30 通过 ✅

迭代 2/5:
- 修复：Token 存储（localStorage → HttpOnly cookie）
- 修复：速率限制（express-rate-limit）
- 测试：35/35 通过 ✅

迭代 3/5:
- 重构：拆分大函数（80 行 → 5 个函数）
- 重构：提取重复代码
- 测试：40/40 通过 ✅

迭代 4/5:
- 优化：N+1 查询 → Redis 缓存
- 优化：同步哈希 → 异步
- 性能测试：p95 从 120ms → 50ms ✅

迭代 5/5:
- 补充：审计日志
- 补充：注释
- 架构师验证：APPROVED ✅

## 完成
- 安全 P0 问题：全部修复 ✅
- 质量改进：全部完成 ✅
- 性能优化：p95 达标 ✅
- 测试覆盖率：92% ✅
```

---

### 步骤 6：最终验证（$verifier）

**指令**：
```
$verifier "验证所有审查问题已修复"
```

**验证报告**：
```markdown
## 验证结果

### 安全性
- [x] 密码哈希升级（bcrypt）
- [x] Token 过期时间调整
- [x] Token 存储安全（HttpOnly cookie）
- [x] 速率限制添加
- [x] 审计日志完善

### 代码质量
- [x] 大函数拆分
- [x] 重复代码提取
- [x] 嵌套减少
- [x] 命名改进

### 性能
- [x] N+1 查询优化（Redis 缓存）
- [x] 同步哈希改为异步
- [x] 缓存穿透保护
- [x] p95 < 100ms（实际 50ms）

### 测试
- [x] 单元测试：45/45 通过
- [x] 集成测试：15/15 通过
- [x] 覆盖率：92%（目标 90%）

### 文档
- [x] 代码注释更新
- [x] API 文档更新
- [x] 运行手册更新

## 结论
✅ 所有审查问题已修复，可以上线
```

---

## 最终交付

### 审查报告汇总

```markdown
# 代码审查汇总报告

## 原始审查
- 严重问题：3 个
- 中等问题：5 个
- 低危问题：8 个

## 修复状态
- 严重问题：✅ 全部修复
- 中等问题：✅ 全部修复
- 低危问题：✅ 修复 6/8（2 个延期）

## 质量改进
- 函数平均行数：25 → 15
- 重复率：5% → 2%
- 测试覆盖率：85% → 92%

## 性能改进
- p50: 50ms → 30ms
- p95: 120ms → 50ms
- p99: 200ms → 100ms

## 上线决定
✅ 批准上线
```

---

## 经验总结

### ✅ 做得好的

1. **多层次审查**：安全、质量、性能全覆盖
2. **优先级清晰**：P0/P1/P2 分类
3. **持久修复**：$ralph 确保所有 P0 修复
4. **验证完整**：$verifier 确认修复效果

### ⚠️ 可以改进的

1. **早期审查**：应该在开发过程中就审查
2. **自动化**：可以添加自动化审查规则
3. **持续监控**：上线后应持续监控性能

### 📝 关键学习

1. **多角色审查**：不同角度发现不同问题
2. **优先级重要**：先修复严重问题
3. **验证必须**：修复后必须重新验证

---

## 下一步

1. **添加自动化审查**：
   ```
   $executor "配置 ESLint 安全规则"
   ```

2. **持续监控**：
   ```
   $plan "添加性能监控和告警"
   ```

3. **定期审查**：
   ```
   $plan "建立月度代码审查流程"
   ```

---

## 总结

通过这个案例，你学习了：

- ✅ `$code-review` 全面审查
- ✅ `$security-reviewer` 安全审计
- ✅ `$quality-reviewer` 质量检查
- ✅ `$performance-reviewer` 性能优化
- ✅ `$ralph` 持久修复
- ✅ `$verifier` 验证完成

**下一步**：尝试 [最佳实践案例 05：团队协作](./05-team-collaboration.md)

[🔙 返回使用手册](../usage-guide.md)
