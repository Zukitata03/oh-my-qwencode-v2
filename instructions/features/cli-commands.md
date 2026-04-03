# CLI 命令完整参考

> Oh-My-QwenCode 命令行工具指南

<!-- omq:generated:cli-doc -->

## 概述

OMQ 提供丰富的命令行工具，支持：
- 启动和配置
- 团队编排
- 探索和验证
- 状态管理
- 安装和维护

---

## 核心命令

### `omq`

**用途**：启动 Qwen Code（带 OMQ 配置）

**语法**：
```bash
omq [选项]
```

**常用选项**：
| 选项 | 用途 | 示例 |
|------|------|------|
| `--madmax` | 最大性能模式 | `omq --madmax` |
| `--high` | 高推理能力模型 | `omq --high` |
| `--model <model>` | 指定模型 | `omq --model=qwen3.6-plus` |

**示例**：
```bash
# 推荐启动方式
omq --madmax --high

# 指定模型
omq --model=qwen3.6-plus
```

---

### `omq setup`

**用途**：安装 OMQ 组件

**语法**：
```bash
omq setup [选项]
```

**选项**：
| 选项 | 用途 | 默认值 |
|------|------|-------|
| `--force` | 强制重新安装 | false |
| `--path <path>` | 安装路径 | 当前项目 |

**安装内容**：
- 33 个角色提示文件
- 36 个 Skills 工作流
- MCP 服务器配置
- AGENTS.md 脚手架

**示例**：
```bash
# 标准安装
omq setup

# 强制重新安装
omq setup --force

# 指定路径
omq setup --path=/path/to/project
```

---

### `omq doctor`

**用途**：验证安装状态

**语法**：
```bash
omq doctor
```

**检查项**：
- Node.js 版本
- Qwen Code 安装
- tmux 安装
- MCP 服务器配置
- Skills 安装
- Prompts 安装

**输出示例**：
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

### `omq version`

**用途**：显示版本信息

**语法**：
```bash
omq version
```

**输出**：
```
oh-my-qwencode v0.11.11
Node.js v20.10.0
Platform: linux x64
```

---

### `omq status`

**用途**：检查活跃模式

**语法**：
```bash
omq status
```

**输出**：
```json
{
  "active_modes": [
    {
      "mode": "autopilot",
      "phase": "execution",
      "iteration": 3,
      "started_at": "2026-04-03T10:00:00Z"
    }
  ]
}
```

---

### `omq cancel`

**用途**：取消活跃模式

**语法**：
```bash
omq cancel [模式]
```

**示例**：
```bash
# 取消所有模式
omq cancel

# 取消特定模式
omq cancel ralph
```

---

## 团队编排命令

### `omq team`

**用途**：启动协调团队

**语法**：
```bash
omq team [N:agent-type] "<任务描述>"
```

**参数**：
- `N`：worker 数量
- `agent-type`：worker 角色（executor, verifier, etc.）
- `任务描述`：团队任务

**示例**：
```bash
# 启动 3 个 executor
omq team 3:executor "修复所有失败测试"

# 启动默认团队
omq team "端到端修复"

# 混合 CLI 团队
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude omq team 3:executor "任务"
```

---

### `omq team status`

**用途**：查看团队状态

**语法**：
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

---

### `omq team resume`

**用途**：恢复团队会话

**语法**：
```bash
omq team resume <team-name>
```

**示例**：
```bash
omq team resume fix-tests
```

---

### `omq team shutdown`

**用途**：关闭团队

**语法**：
```bash
omq team shutdown <team-name>
```

**流程**：
1. 发送关闭信号
2. 等待 workers 确认
3. 删除团队状态
4. 验证关闭证据

**示例**：
```bash
omq team shutdown fix-tests
```

---

### `omq team api`

**用途**：团队 API 互操作

**语法**：
```bash
omq team api <operation> --input '<JSON>' --json
```

**操作**：
| 操作 | 用途 |
|------|------|
| `send-message` | 发送邮箱消息 |
| `claim-task` | 声明任务 |
| `transition-task-status` | 转换任务状态 |

**示例**：
```bash
# 发送消息
omq team api send-message \
  --input '{"team_name":"my-team","from_worker":"worker-1","to_worker":"leader-fixed","body":"ACK"}' \
  --json

# 声明任务
omq team api claim-task \
  --input '{"team_name":"my-team","task_id":"1","worker":"worker-1"}' \
  --json

# 转换任务状态
omq team api transition-task-status \
  --input '{"team_name":"my-team","task_id":"1","from":"in_progress","to":"completed"}' \
  --json
```

---

## 探索与 Sparkshell

### `omq explore`

**用途**：只读仓库查找

**语法**：
```bash
omq explore --prompt "<查找目标>"
omq explore --prompt-file <文件路径>
```

**示例**：
```bash
# 快速查找
omq explore --prompt "find TeamPolicy"

# 使用提示文件
omq explore --prompt-file .omq/explore-prompt.md
```

**限制**：
- 只读操作
- 不允许编辑
- 不允许运行测试
- Shell-only，allowlisted 路径

---

### `omq sparkshell`

**用途**：Shell 原生检查和验证

**语法**：
```bash
omq sparkshell <command>
omq sparkshell --tmux-pane <pane-id> [选项]
```

**选项**：
| 选项 | 用途 |
|------|------|
| `--tmux-pane` | tmux 窗格摘要 |
| `--tail-lines` | 读取行数 |

**示例**：
```bash
# 运行命令
omq sparkshell -- npm test

# 代码搜索
omq sparkshell -- rg -n "pattern" src

# tmux 窗格摘要
omq sparkshell --tmux-pane %12 --tail-lines 400
```

---

## 其他命令

### `omq agents-init`

**用途**：初始化 AGENTS.md

**语法**：
```bash
omq agents-init [path]
```

**别名**：`deepinit`

**示例**：
```bash
omq agents-init
omq agents-init /path/to/project
```

---

### `omq hud`

**用途**：HUD 状态监控

**语法**：
```bash
omq hud --watch
```

**输出**：
- 活跃模式
- 迭代计数
- 当前阶段
- 资源使用

---

### `omq tmux-hook`

**用途**：tmux 钩子配置

**语法**：
```bash
omq tmux-hook
```

**配置内容**：
- tmux 钩子脚本
- 通知集成
- 自动保存

---

### `omq update`

**用途**：更新 OMQ 安装

**语法**：
```bash
omq update
```

**流程**：
1. 检查新版本
2. 下载更新
3. 重新安装组件
4. 验证更新

---

### `omq uninstall`

**用途**：卸载 OMQ

**语法**：
```bash
omq uninstall
```

**清理内容**：
- 安装的 prompts
- 安装的 skills
- MCP 服务器配置
- AGENTS.md

**保留内容**：
- `.omq/` 目录（项目状态）
- 用户配置

---

## 环境变量

### 模型配置

| 变量 | 默认值 | 用途 |
|------|-------|------|
| `OMQ_DEFAULT_FRONTIER_MODEL` | `qwen3.6-plus` | 前端默认模型 |
| `OMQ_DEFAULT_SPARK_MODEL` | `qwen3.5-plus` | 快速默认模型 |

### 团队配置

| 变量 | 默认值 | 用途 |
|------|-------|------|
| `OMQ_TEAM_WORKER_CLI` | `auto` | Worker CLI 选择器 |
| `OMQ_TEAM_WORKER_CLI_MAP` | - | Per-worker CLI 映射 |
| `OMQ_TEAM_WORKER_LAUNCH_ARGS` | - | Worker 启动参数 |
| `OMQ_TEAM_READY_TIMEOUT_MS` | 45000 | Worker 就绪超时 |
| `OMQ_TEAM_LEADER_NUDGE_MS` | 120000 | Leader 提醒间隔 |

### 使用示例

```bash
# 覆盖默认模型
export OMQ_DEFAULT_FRONTIER_MODEL=qwen3.6-plus

# 混合 CLI 团队
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude omq team 3:executor "任务"

# 自定义超时
OMQ_TEAM_READY_TIMEOUT_MS=60000 omq team 2:executor "任务"
```

---

## 配置文件

### 主配置：`~/.qwen/config.toml`

```toml
[mcp_servers.omq_state]
command = "node"
args = ["path/to/omq", "mcp", "state"]

[mcp_servers.omq_memory]
command = "node"
args = ["path/to/omq", "mcp", "memory"]

[mcp_servers.omq_code_intel]
command = "node"
args = ["path/to/omq", "mcp", "code-intel"]

[mcp_servers.omq_trace]
command = "node"
args = ["path/to/omq", "mcp", "trace"]

[omq.autopilot]
maxIterations = 10
maxQaCycles = 5
```

### OMQ 配置：`~/.qwen/.omq-config.json`

```json
{
  "notifications": {
    "enabled": true,
    "openclaw": {
      "gateways": {
        "local": {
          "type": "http",
          "url": "http://127.0.0.1:18789/hooks/agent"
        }
      }
    }
  }
}
```

### 项目配置：`<project>/.qwen/config.toml`

```toml
[omq.roles.architect]
defaultTier = "STANDARD"
defaultModel = "qwen3.6-plus"
```

---

## 故障排除

### Q: `omq` 命令未找到

**解决**：
```bash
npm install -g oh-my-qwencode
```

### Q: `omq setup` 失败

**解决**：
```bash
# 检查 Node.js 版本
node --version  # 需要 >= 20

# 检查 Qwen Code 安装
qwen --version

# 强制重新安装
omq setup --force
```

### Q: MCP 服务器未连接

**解决**：
1. 检查 `~/.qwen/config.toml` 中 `[mcp_servers.omq_*]` 条目
2. 确认 OMQ 安装路径正确
3. 重启 Qwen Code

### Q: `omq team` 失败（tmux not found）

**解决**：
```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# Windows
winget install psmux
```

### Q: 团队状态文件残留

**解决**：
```bash
# 手动清理
rm -rf .omq/state/team/<team-name>
```

---

## 总结

OMQ CLI 提供：

**核心命令**：
- `omq` - 启动
- `omq setup` - 安装
- `omq doctor` - 验证
- `omq status` - 状态
- `omq cancel` - 取消

**团队编排**：
- `omq team` - 启动
- `omq team status` - 监控
- `omq team shutdown` - 关闭
- `omq team api` - API 互操作

**探索验证**：
- `omq explore` - 只读查找
- `omq sparkshell` - Shell 检查

**维护工具**：
- `omq update` - 更新
- `omq uninstall` - 卸载

[🔙 返回使用手册](../usage-guide.md)
