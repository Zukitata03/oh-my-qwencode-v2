# $team 团队协作模式指南

> N 个协调智能体的 tmux 编排引擎

<!-- omq:generated:skill-doc -->

## 概述

`$team` 是 OMQ 中的**团队协作**工作流。它启动真实的 Qwen Code/Claude CLI 会话（在 tmux 窗格中），协调多个智能体并行工作。

核心特性：
- **tmux 窗格编排**：每个 worker 是独立的 CLI 会话
- **共享状态**：通过 `.omq/state/team/` 文件协调
- **邮箱机制**：worker 与 leader 通过 mailbox 通信
- **生命周期管理**：启动 → 监控 → 关闭
- **混合 CLI**：支持 Qwen Code 和 Claude 混合团队

---

## 核心能力

### 1. tmux 窗格编排

```
Leader 窗格（你）
├── Worker-1 窗格（Qwen Code）
├── Worker-2 窗格（Qwen Code）
└── Worker-3 窗格（Claude）
```

每个 worker 是完整的 CLI 会话，独立执行任务。

### 2. 共享状态管理

```
.omq/state/team/<team-name>/
├── config.json           # 团队配置
├── manifest.v2.json      # 团队清单
├── tasks/
│   └── task-1.json       # 任务定义
├── workers/
│   ├── worker-1/
│   │   ├── identity.json
│   │   ├── inbox.md
│   │   └── status.json
│   └── worker-2/
└── mailbox/
    ├── leader-fixed.json
    └── worker-1.json
```

### 3. 邮箱通信

**Leader → Worker**：
1. 写入 worker `inbox.md`
2. 发送短触发（<200 字符）

**Worker → Leader**：
1. 发送 ACK 到 `leader-fixed` mailbox
2. 通过 `omq team api` 声明/转换任务状态

### 4. 混合 CLI 支持

```bash
# 全部使用 Claude
OMQ_TEAM_WORKER_CLI=claude omq team 2:executor "任务"

# 混合团队（Qwen + Claude）
OMQ_TEAM_WORKER_CLI_MAP=qwen,claude omq team 2:executor "任务"

# 自动模式（根据模型选择）
OMQ_TEAM_WORKER_CLI=auto omq team 2:executor "任务"
```

### 5. Git Worktree 支持

```bash
# 每个 worker 独立 worktree
omq team --worktree 2:executor "任务"
```

---

## 使用场景

### ✅ 适合使用 $team 的场景

| 场景 | 示例指令 |
|------|---------|
| 大型协作任务 | `$team "端到端修复，包含验证"` |
| 需要 tmux 编排 | `omq team 3:executor "修复测试"` |
| 混合 CLI 团队 | `OMQ_TEAM_WORKER_CLI_MAP=qwen,claude omq team ...` |
| 独立工作树 | `omq team --worktree 2:executor "并行开发"` |
| 长运行会话 | `omq team "多阶段任务"` |

### ❌ 不适合使用 $team 的场景

| 场景 | 推荐替代 |
|------|---------|
| 简单并行任务 | Qwen Code 原生子智能体 |
| 单次执行 | `$ultrawork` |
| 持久循环 | `$ralph` |
| 端到端自主 | `$autopilot` |

---

## 工作流程

### 前置检查

**目标**：确认环境就绪

**检查清单**：
```
1. tmux 已安装：tmux -V
2. 当前在 tmux 内：$TMUX 已设置
3. omq 命令可用：which omq
4. HUD 窗格检查：避免重复 omq hud --watch
```

**预检命令**：
```bash
tmux list-panes -F '#{pane_id}\t#{pane_start_command}' | rg 'hud --watch' || true
```

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

4. 记录上下文路径到团队状态
```

### Step 1: 启动团队

**目标**：创建团队并启动 workers

**命令**：
```bash
omq team N:agent-type "任务描述"
```

**流程**：
```
1. 解析参数（N, agent-type, 任务）
2. 从任务文本清理团队名称
3. 初始化团队状态：
   - .omq/state/team/<team>/config.json
   - .omq/state/team/<team>/manifest.v2.json
   - .omq/state/team/<team>/tasks/task-<id>.json

4. 创建 worker 指导文件：
   - .omq/state/team/<team>/worker-agents.md

5. 分割 tmux 窗格（创建 N 个 worker 窗格）

6. 启动 workers，设置环境变量：
   - OMQ_TEAM_WORKER=<team>/worker-<n>
   - OMQ_TEAM_STATE_ROOT=<cwd>/.omq/state
   - OMQ_TEAM_LEADER_CWD=<cwd>

7. 等待 worker 就绪（capture-pane 轮询）

8. 写入 per-worker inbox.md 并触发

9. 返回控制权给 leader
```

### Step 2: 监控进度

**目标**：跟踪团队状态

**命令**：
```bash
omq team status <team-name>
```

**输出**：
```json
{
  "team_name": "fix-tests",
  "workers": 3,
  "tasks": {
    "pending": 0,
    "in_progress": 1,
    "completed": 5,
    "failed": 0
  },
  "status": "running"
}
```

**主动监控规则**：
```
团队活跃时，leader 必须保持监控：

最小循环：
```bash
sleep 30 && omq team status <team-name>
```

重复检查直到终端状态。
```

### Step 3: 等待终端状态

**目标**：确认所有任务完成

**终端状态**：
```
pending = 0
in_progress = 0
failed = 0（或明确接受的失败）
```

**等待命令**：
```bash
omq team await <team-name> --timeout-ms 30000 --json
```

### Step 4: 关闭团队

**目标**：优雅关闭

**命令**：
```bash
omq team shutdown <team-name>
```

**流程**：
```
1. 发送关闭信号
2. 等待 workers 确认
3. 删除团队状态：`.omq/state/team/<team>/`
4. 验证关闭证据
```

**重要**：
- 不要在 workers 仍在写入时关闭（除非明确中止）
- 等待终端状态再关闭

### Step 5: 清理残留

**目标**：清理残留窗格

**手动清理**：
```bash
# 查看窗格
tmux list-panes -F '#{pane_id}\t#{pane_current_command}'

# 杀死残留 worker 窗格
tmux kill-pane -t %450
tmux kill-pane -t %451

# 删除残留状态
rm -rf .omq/state/team/<team-name>
```

---

## 输出结构

### 启动报告

```markdown
## 团队启动

团队名称：fix-tests
Worker 数量：3
Agent 类型：executor
tmux 目标：%12

Worker 窗格：
- Worker-1: %13 (Qwen Code)
- Worker-2: %14 (Qwen Code)
- Worker-3: %15 (Claude)

状态：运行中
```

### 状态报告

```markdown
## 团队状态

团队：fix-tests
状态：运行中

任务进度：
- 待处理：0
- 进行中：1
- 已完成：5
- 失败：0

Worker 状态：
- Worker-1: 空闲
- Worker-2: 处理任务 task-3
- Worker-3: 空闲
```

### 关闭报告

```markdown
## 团队关闭

团队：fix-tests
关闭时间：2026-04-03T10:30:00Z

最终状态：
- 待处理：0
- 进行中：0
- 已完成：8
- 失败：0

状态清理：完成
窗格清理：完成
```

---

## 最佳实践

### 1. 启动前验证环境

```bash
# 检查 tmux
tmux -V

# 检查是否在 tmux 内
echo $TMUX

# 检查 HUD 窗格
tmux list-panes -F '#{pane_id}\t#{pane_start_command}' | rg 'hud --watch' || true
```

### 2. 使用 runtime/state 工具监控

❌ **手动干预**：
```
直接在 worker 窗格打字
```

✅ **使用工具**：
```bash
omq team status <team-name>
omq team api send-message --json
```

### 3. 等待终端状态再关闭

❌ **过早关闭**：
```
还有 in_progress 任务就关闭
```

✅ **等待完成**：
```
pending=0, in_progress=0 再关闭
```

### 4. 混合 CLI 团队

```bash
# Worker 1-2: Qwen, Worker 3: Claude
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude omq team 3:executor "任务"
```

### 5. 使用 worktree 隔离

```bash
# 每个 worker 独立 git worktree
omq team --worktree=feature-branch 3:executor "任务"
```

---

## 配置选项

### 环境变量

| 变量 | 默认值 | 用途 |
|------|-------|------|
| `OMQ_TEAM_WORKER_CLI` | `auto` | Worker CLI 选择器 |
| `OMQ_TEAM_WORKER_CLI_MAP` | - | Per-worker CLI 映射 |
| `OMQ_TEAM_WORKER_LAUNCH_ARGS` | - | Worker 启动参数 |
| `OMQ_TEAM_READY_TIMEOUT_MS` | 45000 | Worker 就绪超时 |
| `OMQ_TEAM_SKIP_READY_WAIT` | 0 | 跳过就绪等待 |
| `OMQ_TEAM_AUTO_TRUST` | 1 | 自动信任提示 |
| `OMQ_TEAM_AUTO_ACCEPT_BYPASS` | 1 | Claude 权限提示自动接受 |
| `OMQ_TEAM_LEADER_NUDGE_MS` | 120000 | Leader 提醒间隔 |
| `OMQ_TEAM_STRICT_SUBMIT` | 0 | 强制严格提交 |

### 模型解析

**优先级**（高→低）：
1. `OMQ_TEAM_WORKER_LAUNCH_ARGS` 中的显式模型
2. Leader 继承的 `--model` 标志
3. `OMQ_DEFAULT_SPARK_MODEL`（低复杂度默认）

**推理努力**：
- 团队运行时不根据模型名称启发式映射
- 根据 worker 角色动态分配（low/medium/high）
- 显式启动参数优先

### 配置文件示例

```toml
[omq.team]
defaultWorkerCount = 2
defaultAgentType = "executor"
readyTimeoutMs = 45000
leaderNudgeMs = 120000
```

---

## 实际案例

### 案例 1：修复失败测试

**指令**：
```bash
omq team 3:executor "修复所有失败的集成测试"
```

**执行摘要**：
```markdown
## 启动

团队：fix-tests
Workers: 3 (Qwen Code)
tmux: %12

## 任务分配

Task-1: Worker-1 → 修复 auth 测试
Task-2: Worker-2 → 修复 user 测试
Task-3: Worker-3 → 修复 payment 测试

## 进度监控

T+30s:
- Task-1: 进行中
- Task-2: 进行中
- Task-3: 进行中

T+60s:
- Task-1: 完成 ✅
- Task-2: 进行中
- Task-3: 完成 ✅

T+90s:
- Task-1: 完成 ✅
- Task-2: 完成 ✅
- Task-3: 完成 ✅

## 验证

运行：npm test
输出：50/50 通过 ✅

## 关闭

团队：fix-tests
状态：完成
```

### 案例 2：混合 CLI 团队

**指令**：
```bash
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude omq team 3:executor "运行验证"
```

**执行摘要**：
```markdown
## 启动

团队：run-validation
Workers:
- Worker-1: Qwen Code
- Worker-2: Qwen Code
- Worker-3: Claude

## 任务分配

Task-1: Worker-1 (Qwen) → 构建验证
Task-2: Worker-2 (Qwen) → 测试运行
Task-3: Worker-3 (Claude) → Lint 检查

## 进度

T+30s:
- Worker-1: npm run build → 成功 ✅
- Worker-2: npm test → 运行中
- Worker-3: npm run lint → 成功 ✅

T+60s:
- Worker-1: 完成 ✅
- Worker-2: 完成 ✅（45/45 通过）
- Worker-3: 完成 ✅

## 关闭

所有验证通过，团队关闭。
```

### 案例 3：Worktree 隔离

**指令**：
```bash
omq team --worktree=feature-auth 2:executor "实现 OAuth 登录"
```

**执行摘要**：
```markdown
## 启动

团队：oauth-login
Worktree: feature-auth
Workers: 2

## Worktree 设置

Worker-1: worktree-1 (独立分支)
Worker-2: worktree-2 (独立分支)

## 任务分配

Worker-1: 实现 OAuth 回调
Worker-2: 实现用户会话管理

## 进度

T+5m:
- Worker-1: OAuth 回调完成 ✅
- Worker-2: 会话管理完成 ✅

## 集成

合并 worktree 到主分支：
```bash
git worktree remove worktree-1
git worktree remove worktree-2
git merge feature-auth
```

## 验证

手动测试 OAuth 流程 → 成功 ✅

## 关闭

团队关闭，worktree 清理完成。
```

---

## 与其他 Skills 协作

### $plan + $team

```
$plan --consensus --interactive "..."
# 用户选择"批准并团队执行" → 自动调用 $team
```

### $deep-interview + $team

```
$deep-interview "模糊想法"
# 输出：.omq/specs/deep-interview-*.md

$team .omq/specs/deep-interview-*.md
# 使用规格作为输入
```

### $ralph + $team

```
# Team 执行后，Ralph 用于后续验证/修复
$team "协调实现"
$ralph "验证并修复剩余问题"
```

---

## 常见问题

### Q: 团队启动但 Leader 未收到 ACK？

**A**: 检查：
1. Worker 窗格显示 inbox 处理
2. `.omq/state/team/<team>/mailbox/leader-fixed.json` 存在
3. Worker 技能已加载

### Q: Worker 日志 `omq team api ... ENOENT`？

**A**: 含义：团队状态路径不存在

**原因**：Leader 在 Worker 完成前运行了 `shutdown`

**检查**：
```bash
omq team status <team>
ls .omq/state/team/<team>/
```

### Q: 关闭后残留 Worker 窗格？

**A**: 手动清理：
```bash
tmux list-panes -F '#{pane_id}\t#{pane_current_command}'
tmux kill-pane -t %450
rm -rf .omq/state/team/<team-name>
```

### Q: 如何混合使用 Qwen 和 Claude？

**A**: 使用 `OMQ_TEAM_WORKER_CLI_MAP`：
```bash
OMQ_TEAM_WORKER_CLI_MAP=qwen,claude omq team 2:executor "任务"
```

### Q: Worktree 失败怎么办？

**A**: 检查：
1. Git 仓库存在
2. 分支名称不冲突
3. 手动清理 worktree：
```bash
git worktree remove <path>
```

---

## 性能调优

### 加快启动速度

```bash
OMQ_TEAM_READY_TIMEOUT_MS=30000 omq team 2:executor "任务"
```

### 提高执行质量

```bash
omq team 3:executor --tier=THOROUGH "关键任务"
```

### 限制执行范围

```bash
omq team 2:executor "只实现核心功能"
```

---

## 总结

`$team` 是你的**团队协作引擎**，适合：

- ✅ 需要 tmux 编排的大型协作
- ✅ 多个智能体并行工作
- ✅ 混合 CLI 团队（Qwen + Claude）
- ✅ 独立工作树隔离

记住：
- 启动前验证环境
- 使用 runtime/state 工具监控
- 等待终端状态再关闭
- 混合 CLI 使用 `OMQ_TEAM_WORKER_CLI_MAP`
- Worktree 提供隔离

[🔙 返回使用手册](../usage-guide.md)
