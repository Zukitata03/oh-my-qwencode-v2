# $executor 角色完整指南

> 功能实现和重构的专家

<!-- omq:generated:agent-doc -->

## 概述

`$executor` 是 OMQ 中的**执行专家**角色，专注于实现功能、重构代码和修复问题。

当你需要将需求转化为代码、改进现有代码质量或完成具体开发任务时，`$executor` 是你的主力角色。

---

## 核心能力

### 1. 功能实现

- 从零实现新功能
- 扩展现有功能
- 集成第三方库
- 编写 API 端点

### 2. 代码重构

- 提高代码可读性
- 消除重复代码
- 改进命名和结构
- 提取函数/类/模块

### 3. Bug 修复

- 定位问题根因
- 实现修复方案
- 添加回归测试
- 验证修复效果

### 4. 性能优化

- 识别性能瓶颈
- 优化算法复杂度
- 减少内存占用
- 改进数据库查询

---

## 使用场景

### ✅ 适合使用 $executor 的场景

| 场景 | 示例指令 |
|------|---------|
| 实现新功能 | `$executor "实现用户注册功能"` |
| 重构代码 | `$executor "重构这个函数提高可读性"` |
| 修复 bug | `$executor "修复登录失败的问题"` |
| 添加测试 | `$executor "为这个模块添加单元测试"` |
| 优化性能 | `$executor "优化这个慢查询"` |
| 集成库 | `$executor "集成 Stripe 支付"` |
| 代码审查修复 | `$executor "根据审查意见修复代码"` |

### ❌ 不适合使用 $executor 的场景

| 场景 | 推荐角色 |
|------|---------|
| 架构分析 | `$architect` |
| 需求不明确 | `$deep-interview` + `$plan` |
| 快速探索 | `$explore` |
| 根因分析 | `$debugger` |
| 安全审计 | `$security-reviewer` |

---

## 使用方法

### 基本语法

```
$executor "<实现任务描述>"
```

### 高级用法

```
$executor --tier=STANDARD "实现用户管理模块"
$executor --with-tests "添加功能并编写测试"
$executor --refactor "重构这段代码"
```

### 组合使用

```
# 先分析后实现
$architect "分析认证架构"
$executor "根据分析实现改进"

# 先规划后实现
$plan "规划实现路径"
$executor "按照计划实现"

# 先调试后修复
$debugger "找出 bug 根因"
$executor "修复这个问题"
```

---

## 输出结构

`$executor` 的典型输出包含：

### 1. 实现摘要

```markdown
## 实现摘要

完成了以下功能：
- ✅ 用户注册 API 端点
- ✅ 密码哈希和验证
- ✅ 邮箱验证流程
- ✅ 单元测试（覆盖率 95%）
```

### 2. 修改的文件

```markdown
## 修改的文件

新增：
- src/auth/register.ts
- src/auth/register.test.ts
- src/emails/verification.ts

修改：
- src/routes/index.ts（添加注册路由）
- src/models/User.ts（添加 emailVerified 字段）
```

### 3. 代码变更

```typescript
// src/auth/register.ts
export async function register(email: string, password: string) {
  // 验证邮箱格式
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email');
  }
  
  // 哈希密码
  const hashedPassword = await hashPassword(password);
  
  // 创建用户
  const user = await User.create({
    email,
    password: hashedPassword,
    emailVerified: false,
  });
  
  // 发送验证邮件
  await sendVerificationEmail(user);
  
  return user;
}
```

### 4. 测试用例

```typescript
// src/auth/register.test.ts
describe('register', () => {
  it('应该成功创建用户', async () => {
    const user = await register('test@example.com', 'password123');
    expect(user.email).toBe('test@example.com');
    expect(user.emailVerified).toBe(false);
  });
  
  it('应该拒绝无效邮箱', async () => {
    await expect(register('invalid', 'password'))
      .rejects.toThrow(ValidationError);
  });
});
```

### 5. 验证结果

```markdown
## 验证结果

✅ 所有测试通过（12/12）
✅ TypeScript 编译通过
✅ ESLint 无警告
✅ 手动测试通过
```

---

## 最佳实践

### 1. 给出清晰的实现需求

❌ **模糊**：
```
$executor "实现用户功能"
```

✅ **清晰**：
```
$executor "实现用户注册功能，包含邮箱验证和密码哈希"
```

### 2. 指定技术约束

❌ **开放**：
```
$executor "添加数据库查询"
```

✅ **具体**：
```
$executor "使用 Mongoose 添加用户查询，支持分页和过滤"
```

### 3. 要求包含测试

```
$executor "实现这个功能，并添加完整的单元测试"
```

### 4. 指定代码风格

```
$executor "按照项目现有风格实现，使用 TypeScript 和 async/await"
```

### 5. 提供上下文

```
$executor "在 src/auth/register.ts 中实现注册逻辑，参考现有的 login.ts 风格"
```

---

## 配置选项

### 模型层级

| 层级 | 模型 | 用途 |
|------|------|------|
| LOW | qwen3.5-plus | 简单任务 |
| STANDARD | qwen3.6-flash | 标准任务 |
| THOROUGH | qwen3.6-plus | 复杂任务 |

### 推理努力

| 级别 | 用途 |
|------|------|
| low | 直接实现 |
| medium | 考虑边界情况 |
| high | 深度思考和优化 |

### 配置文件示例

```toml
[omq.roles.executor]
defaultTier = "STANDARD"
defaultModel = "qwen3.6-plus"
defaultReasoningEffort = "medium"
```

---

## 实际案例

### 案例 1：实现用户注册

**指令**：
```
$executor "实现用户注册功能，要求：
1. 邮箱格式验证
2. 密码强度检查（至少 8 位，包含大小写和数字）
3. 密码 bcrypt 哈希
4. 发送验证邮件
5. 完整的单元测试"
```

**输出摘要**：
```markdown
## 实现完成

### 新增文件
- src/auth/register.ts（注册逻辑）
- src/auth/register.test.ts（单元测试）
- src/validators/password.ts（密码验证）
- src/emails/verification.ts（验证邮件）

### 核心实现

密码强度检查：
```typescript
function validatePassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}
```

密码哈希：
```typescript
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 测试覆盖
- ✅ 有效注册
- ✅ 无效邮箱
- ✅ 密码太弱
- ✅ 重复邮箱
- ✅ 邮件发送

测试覆盖率：98%
```

### 案例 2：重构代码

**指令**：
```
$executor "重构这个函数，提高可读性和可维护性"
```

**输入代码**：
```typescript
function p(d: any) {
  let r = '';
  if (d.t === 'a') {
    r = d.v ? '是' : '否';
  } else if (d.t === 'n') {
    r = d.v === null ? '空' : d.v.toFixed(2);
  } else if (d.t === 's') {
    r = d.v?.toUpperCase() || '未知';
  }
  return d.p ? d.p + ': ' + r : r;
}
```

**输出摘要**：
```markdown
## 重构完成

### 改进点
1. 有意义的命名
2. 提取类型常量
3. 使用 switch 语句
4. 添加 JSDoc 注释
5. 处理边界情况

### 重构后代码
```typescript
/**
 * 格式化数据字段的显示值
 * @param field - 包含类型、值和前缀的字段对象
 * @returns 格式化后的字符串
 */
function formatField(field: Field): string {
  const { type, value, prefix } = field;
  
  let formattedValue: string;
  
  switch (type) {
    case FieldType.BOOLEAN:
      formattedValue = value ? '是' : '否';
      break;
      
    case FieldType.NUMBER:
      formattedValue = value === null 
        ? '空' 
        : value.toFixed(2);
      break;
      
    case FieldType.STRING:
      formattedValue = value?.toUpperCase() || '未知';
      break;
      
    default:
      formattedValue = '未知类型';
  }
  
  return prefix ? `${prefix}: ${formattedValue}` : formattedValue;
}
```

### 验证
✅ 所有现有测试通过
✅ 新增边界情况测试
```

### 案例 3：性能优化

**指令**：
```
$executor "优化这个慢查询，目前需要 5 秒才能返回结果"
```

**输入代码**：
```typescript
async function getUsersWithOrders() {
  const users = await User.find();
  return users.map(async (user) => {
    const orders = await Order.find({ userId: user.id });
    return { ...user, orders };
  });
}
```

**输出摘要**：
```markdown
## 优化完成

### 问题分析
1. N+1 查询问题：每个用户单独查询订单
2. 没有使用索引
3. 没有批量加载

### 优化方案

```typescript
async function getUsersWithOrders() {
  // 批量加载所有用户
  const users = await User.find();
  
  // 批量加载所有订单（一次查询）
  const userIds = users.map(u => u.id);
  const orders = await Order.find({ 
    userId: { $in: userIds } 
  });
  
  // 内存中组装
  const ordersByUserId = new Map(
    orders.reduce((acc, order) => {
      const userOrders = acc.get(order.userId) || [];
      userOrders.push(order);
      return acc.set(order.userId, userOrders);
    }, new Map())
  );
  
  return users.map(user => ({
    ...user,
    orders: ordersByUserId.get(user.id) || []
  }));
}
```

### 性能提升
- 优化前：5000ms
- 优化后：50ms
- 提升：100 倍

### 额外建议
1. 在 userId 字段添加索引
2. 考虑使用 Redis 缓存
3. 添加分页限制返回数量
```

---

## 与其他角色协作

### $executor + $architect

```
$architect "分析这个模块的架构问题"
$executor "根据架构师的建议重构"
```

### $executor + $planner

```
$plan "规划实现路径"
$executor "按照计划实现功能"
```

### $executor + $verifier

```
$executor "实现功能"
$verifier "验证完成度"
```

### $executor + $test-engineer

```
$executor "实现功能"
$test-engineer "补充测试用例"
```

---

## 常见问题

### Q: $executor 会运行测试吗？

**A**: 会。`$executor` 默认会运行相关测试验证实现。如需跳过：
```
$executor --skip-tests "实现功能"
```

### Q: 如何让 $executor 使用特定的库？

**A**: 明确指定：
```
$executor "使用 lodash 实现数组去重"
```

### Q: $executor 会修改配置文件吗？

**A**: 如果需要，会修改。但会明确告知：
```markdown
## 配置变更

修改了以下配置文件：
- package.json（添加新依赖）
- .env.example（添加新环境变量）
```

### Q: 实现失败怎么办？

**A**: `$executor` 会报告失败原因并提供替代方案：
```markdown
## 实现受阻

问题：第三方库 xyz 与当前 Node 版本不兼容

替代方案：
1. 使用 abc 库代替（功能相似）
2. 升级 Node 到 v18+
3. 手动实现核心功能

请选择方案或提供进一步指导。
```

---

## 性能调优

### 加快实现速度

```
$executor --tier=LOW "快速实现这个简单功能"
```

### 提高实现质量

```
$executor --tier=THOROUGH "完整实现这个复杂功能"
```

### 限制实现范围

```
$executor "只实现核心逻辑，UI 部分稍后处理"
```

---

## 总结

`$executor` 是你的**主力开发者**，适合：

- ✅ 实现新功能
- ✅ 重构代码
- ✅ 修复 bug
- ✅ 添加测试
- ✅ 性能优化

记住：
- 给出清晰的实现需求
- 指定技术约束
- 要求包含测试
- 提供足够的上下文

[🔙 返回使用手册](../usage-guide.md)
