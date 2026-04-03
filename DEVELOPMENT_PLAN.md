# oh-my-qwencode 项目开发计划（文件级别）

## 项目概述

**目标**：将 oh-my-codex 项目的所有功能移植到 oh-my-qwencode，完成对 qwen code 的适配。

**源项目**：/home/admin/Workspace/oh-my-codex (707 个文件)
**目标项目**：/home/admin/Workspace/oh-my-qwencode

**核心要求**：
1. 所有内容只能出现 oh-my-qwencode，不能有 oh-my-codex 痕迹
2. 适配 qwen code 而非 codex
3. 所有功能需通过单元测试 + 手动功能清单验证
4. 如发现技术不可行功能，需记录并告知用户

---

## 验证机制

本项目采用**三层验证体系**确保移植完整性和正确性：

### 验证脚本说明

| 脚本 | 用途 | 用法 |
|------|------|------|
| `scripts/verify-file.sh` | 文件级验证 | `./scripts/verify-file.sh <源文件> <目标文件>` |
| `scripts/verify-stage.sh` | 模块级验证 | `./scripts/verify-stage.sh <阶段号> <目录> <预期文件数>` |
| `scripts/verify-full.sh` | 项目级验证 | `./scripts/verify-full.sh` |

### 验证层级

```
第一层：文件级验证（每文件执行）
├── 存在性检查
├── 内容完整性检查 (diff)
└── 残留检查 (grep)

第二层：模块级验证（每阶段执行）
├── 文件数量验证
├── oh-my-codex 残留检查
└── 构建验证 (cargo build / npm run build)

第三层：项目级验证（最终执行）
├── 完整构建 (npm run build:full)
├── 全量测试
├── 功能清单验证
└── 人工审计抽样
```

### 检查点格式说明

每个检查点包含以下验证项：
- [ ] **文件存在性**：所有文件已创建
- [ ] **内容完整性**：源文件与目标文件内容一致
- [ ] **无残留**：grep -r "oh-my-codex" 无匹配
- [ ] **构建验证**：cargo build / npm run build 通过
- [ ] **测试验证**：cargo test / npm test 通过

---

## 阶段 1：项目基础架构搭建

### 任务 1.1：创建根目录配置文件 (27 个文件)

**源文件清单 → 目标文件**：

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 1.1.1 | `AGENTS.md` | `AGENTS.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.2 | `biome.json` | `biome.json` | 复制 |
| 1.1.3 | `Cargo.lock` | `Cargo.lock` | 复制（Rust 依赖锁定，后续构建时更新） |
| 1.1.4 | `Cargo.toml` | `Cargo.toml` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.5 | `CHANGELOG.md` | `CHANGELOG.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.6 | `CONTRIBUTING.md` | `CONTRIBUTING.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.7 | `COVERAGE.md` | `COVERAGE.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.8 | `DEMO.md` | `DEMO.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.9 | `dist-workspace.toml` | `dist-workspace.toml` | 复制 |
| 1.1.10 | `package.json` | `package.json` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.11 | `package-lock.json` | `package-lock.json` | 复制（npm install 后更新） |
| 1.1.12 | `README.de.md` | `README.de.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.13 | `README.es.md` | `README.es.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.14 | `README.fr.md` | `README.fr.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.15 | `README.it.md` | `README.it.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.16 | `README.ja.md` | `README.ja.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.17 | `README.ko.md` | `README.ko.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.18 | `README.md` | `README.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.19 | `README.pt.md` | `README.pt.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.20 | `README.ru.md` | `README.ru.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.21 | `README.tr.md` | `README.tr.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.22 | `README.vi.md` | `README.vi.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.23 | `README.zh.md` | `README.zh.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.24 | `README.zh-TW.md` | `README.zh-TW.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.25 | `RELEASE_BODY.md` | `RELEASE_BODY.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.1.26 | `tsconfig.json` | `tsconfig.json` | 复制 |
| 1.1.27 | `tsconfig.no-unused.json` | `tsconfig.no-unused.json` | 复制 |
| 1.1.28 | `.gitignore` | `.gitignore` | 复制 |

**检查点 1.1**：
执行验证命令：
```bash
# 文件级验证（抽样）
./scripts/verify-file.sh /home/admin/Workspace/oh-my-codex/package.json ./package.json
./scripts/verify-file.sh /home/admin/Workspace/oh-my-codex/Cargo.toml ./Cargo.toml

# 模块级验证
./scripts/verify-stage.sh 1.1 "." 28

# 手动验证
# - 确认 package.json 中 name 字段为 "oh-my-qwencode"
# - 确认 CHANGELOG.md 中的历史引用可以保留
```
- [ ] 文件存在性验证：所有 28 个文件已创建
- [ ] 内容完整性验证：抽样文件 diff 一致
- [ ] 无残留验证：grep -r "oh-my-codex" . 无匹配（CHANGELOG.md 除外）
- [ ] package.json name 字段为 "oh-my-qwencode"

---

### 任务 1.2：创建 .github/ 目录 (7 个文件)

**子任务 1.2.1**：创建 `.github/ISSUE_TEMPLATE/` (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 1.2.1.1 | `.github/ISSUE_TEMPLATE/bug_report.md` | `.github/ISSUE_TEMPLATE/bug_report.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.2.1.2 | `.github/ISSUE_TEMPLATE/config.yml` | `.github/ISSUE_TEMPLATE/config.yml` | 复制 |
| 1.2.1.3 | `.github/ISSUE_TEMPLATE/feature_request.md` | `.github/ISSUE_TEMPLATE/feature_request.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

**子任务 1.2.2**：创建 `.github/workflows/` (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 1.2.2.1 | `.github/workflows/ci.yml` | `.github/workflows/ci.yml` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.2.2.2 | `.github/workflows/pr-check.yml` | `.github/workflows/pr-check.yml` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 1.2.2.3 | `.github/workflows/release.yml` | `.github/workflows/release.yml` | 复制，替换 oh-my-codex → oh-my-qwencode |

**子任务 1.2.3**：创建其他 .github 文件 (1 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 1.2.3.1 | `.github/dependabot.yml` | `.github/dependabot.yml` | 复制 |
| 1.2.3.2 | `.github/PULL_REQUEST_TEMPLATE.md` | `.github/PULL_REQUEST_TEMPLATE.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

**检查点 1.2**：
执行验证命令：
```bash
# 文件级验证（抽样）
./scripts/verify-file.sh /home/admin/Workspace/oh-my-codex/.github/workflows/ci.yml ./.github/workflows/ci.yml

# 模块级验证
./scripts/verify-stage.sh 1.2 ".github" 7
```
- [ ] 文件存在性验证：所有 7 个文件已创建
- [ ] 内容完整性验证：抽样文件 diff 一致
- [ ] 无残留验证：grep -r "oh-my-codex" .github/ 无匹配
- [ ] CI/CD 配置中无 oh-my-codex 引用

---

**阶段 1 检查点**：
执行验证命令：
```bash
# 阶段级验证
./scripts/verify-stage.sh 1 "." 35 yes
```
- [ ] 所有 35 个基础架构文件已创建
- [ ] 无 oh-my-codex 痕迹

---

## 阶段 2：Rust Crates 移植 (36 个文件)

### 任务 2.1：移植 crates/omx-explore/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.1.1 | `crates/omx-explore/Cargo.toml` | `crates/omx-explore/Cargo.toml` | 复制 |
| 2.1.2 | `crates/omx-explore/src/main.rs` | `crates/omx-explore/src/main.rs` | 复制 |

**检查点 2.1**：
执行验证命令：
```bash
./scripts/verify-file.sh /home/admin/Workspace/oh-my-codex/crates/omx-explore/Cargo.toml crates/omx-explore/Cargo.toml
./scripts/verify-stage.sh 2.1 "crates/omx-explore" 2
cargo build -p omx-explore-harness
```
- [ ] 2 个文件已复制
- [ ] `cargo build -p omx-explore-harness` 通过

---

### 任务 2.2：移植 crates/omx-mux/ (4 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.2.1 | `crates/omx-mux/Cargo.toml` | `crates/omx-mux/Cargo.toml` | 复制 |
| 2.2.2 | `crates/omx-mux/src/lib.rs` | `crates/omx-mux/src/lib.rs` | 复制 |
| 2.2.3 | `crates/omx-mux/src/tmux.rs` | `crates/omx-mux/src/tmux.rs` | 复制 |
| 2.2.4 | `crates/omx-mux/src/types.rs` | `crates/omx-mux/src/types.rs` | 复制 |

**检查点 2.2**：
执行验证命令：
```bash
./scripts/verify-stage.sh 2.2 "crates/omx-mux" 4
cargo build -p omx-mux
```
- [ ] 4 个文件已复制
- [ ] `cargo build -p omx-mux` 通过

---

### 任务 2.3：移植 crates/omx-runtime-core/ (7 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.3.1 | `crates/omx-runtime-core/Cargo.toml` | `crates/omx-runtime-core/Cargo.toml` | 复制 |
| 2.3.2 | `crates/omx-runtime-core/src/authority.rs` | `crates/omx-runtime-core/src/authority.rs` | 复制 |
| 2.3.3 | `crates/omx-runtime-core/src/dispatch.rs` | `crates/omx-runtime-core/src/dispatch.rs` | 复制 |
| 2.3.4 | `crates/omx-runtime-core/src/engine.rs` | `crates/omx-runtime-core/src/engine.rs` | 复制 |
| 2.3.5 | `crates/omx-runtime-core/src/lib.rs` | `crates/omx-runtime-core/src/lib.rs` | 复制 |
| 2.3.6 | `crates/omx-runtime-core/src/mailbox.rs` | `crates/omx-runtime-core/src/mailbox.rs` | 复制 |
| 2.3.7 | `crates/omx-runtime-core/src/replay.rs` | `crates/omx-runtime-core/src/replay.rs` | 复制 |

**检查点 2.3**：
- [ ] 7 个文件已复制
- [ ] `cargo build -p omx-runtime-core` 通过

---

### 任务 2.4：移植 crates/omx-runtime/ (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.4.1 | `crates/omx-runtime/Cargo.toml` | `crates/omx-runtime/Cargo.toml` | 复制 |
| 2.4.2 | `crates/omx-runtime/src/main.rs` | `crates/omx-runtime/src/main.rs` | 复制 |
| 2.4.3 | `crates/omx-runtime/tests/execution.rs` | `crates/omx-runtime/tests/execution.rs` | 复制 |

**检查点 2.4**：
- [ ] 3 个文件已复制
- [ ] `cargo build -p omx-runtime` 通过

---

### 任务 2.5：移植 crates/omx-sparkshell/ (20 个文件)

**子任务 2.5.1**：根目录文件 (2 个)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.5.1.1 | `crates/omx-sparkshell/Cargo.lock` | `crates/omx-sparkshell/Cargo.lock` | 复制 |
| 2.5.1.2 | `crates/omx-sparkshell/Cargo.toml` | `crates/omx-sparkshell/Cargo.toml` | 复制 |

**子任务 2.5.2**：src 主文件 (6 个)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.5.2.1 | `crates/omx-sparkshell/src/codex_bridge.rs` | `crates/omx-sparkshell/src/codex_bridge.rs` | 复制，**适配 qwen code** |
| 2.5.2.2 | `crates/omx-sparkshell/src/error.rs` | `crates/omx-sparkshell/src/error.rs` | 复制 |
| 2.5.2.3 | `crates/omx-sparkshell/src/exec.rs` | `crates/omx-sparkshell/src/exec.rs` | 复制 |
| 2.5.2.4 | `crates/omx-sparkshell/src/main.rs` | `crates/omx-sparkshell/src/main.rs` | 复制，**适配 qwen code** |
| 2.5.2.5 | `crates/omx-sparkshell/src/prompt.rs` | `crates/omx-sparkshell/src/prompt.rs` | 复制 |
| 2.5.2.6 | `crates/omx-sparkshell/src/test_support.rs` | `crates/omx-sparkshell/src/test_support.rs` | 复制 |
| 2.5.2.7 | `crates/omx-sparkshell/src/threshold.rs` | `crates/omx-sparkshell/src/threshold.rs` | 复制 |

**子任务 2.5.3**：registry 子模块 (10 个)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.5.3.1 | `crates/omx-sparkshell/src/registry/c_cpp.rs` | `crates/omx-sparkshell/src/registry/c_cpp.rs` | 复制 |
| 2.5.3.2 | `crates/omx-sparkshell/src/registry/csharp.rs` | `crates/omx-sparkshell/src/registry/csharp.rs` | 复制 |
| 2.5.3.3 | `crates/omx-sparkshell/src/registry/generic_shell.rs` | `crates/omx-sparkshell/src/registry/generic_shell.rs` | 复制 |
| 2.5.3.4 | `crates/omx-sparkshell/src/registry/git.rs` | `crates/omx-sparkshell/src/registry/git.rs` | 复制 |
| 2.5.3.5 | `crates/omx-sparkshell/src/registry/go.rs` | `crates/omx-sparkshell/src/registry/go.rs` | 复制 |
| 2.5.3.6 | `crates/omx-sparkshell/src/registry/java_kotlin.rs` | `crates/omx-sparkshell/src/registry/java_kotlin.rs` | 复制 |
| 2.5.3.7 | `crates/omx-sparkshell/src/registry/mod.rs` | `crates/omx-sparkshell/src/registry/mod.rs` | 复制 |
| 2.5.3.8 | `crates/omx-sparkshell/src/registry/node_js.rs` | `crates/omx-sparkshell/src/registry/node_js.rs` | 复制 |
| 2.5.3.9 | `crates/omx-sparkshell/src/registry/python.rs` | `crates/omx-sparkshell/src/registry/python.rs` | 复制 |
| 2.5.3.10 | `crates/omx-sparkshell/src/registry/ruby.rs` | `crates/omx-sparkshell/src/registry/ruby.rs` | 复制 |
| 2.5.3.11 | `crates/omx-sparkshell/src/registry/rust.rs` | `crates/omx-sparkshell/src/registry/rust.rs` | 复制 |
| 2.5.3.12 | `crates/omx-sparkshell/src/registry/swift.rs` | `crates/omx-sparkshell/src/registry/swift.rs` | 复制 |

**子任务 2.5.4**：测试文件 (2 个)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 2.5.4.1 | `crates/omx-sparkshell/tests/execution.rs` | `crates/omx-sparkshell/tests/execution.rs` | 复制 |
| 2.5.4.2 | `crates/omx-sparkshell/tests/registry.rs` | `crates/omx-sparkshell/tests/registry.rs` | 复制 |

**检查点 2.5**：
执行验证命令：
```bash
./scripts/verify-stage.sh 2.5 "crates/omx-sparkshell" 20
cargo build -p omx-sparkshell
# 检查 codex_bridge.rs 适配
grep -n "qwen\|Qwen" crates/omx-sparkshell/src/codex_bridge.rs
```
- [ ] 20 个文件已复制
- [ ] `cargo build -p omx-sparkshell` 通过
- [ ] codex_bridge.rs 已适配 qwen code

---

**阶段 2 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 2 "crates" 36
cargo build --workspace
cargo test --workspace
```
- [ ] 所有 36 个 Rust 文件已复制
- [ ] `cargo build --workspace` 通过
- [ ] `cargo test --workspace` 通过
- [ ] 无 oh-my-codex 痕迹

---

## 阶段 3：prompts/ 提示词模板移植 (33 个文件)

### 任务 3.1：移植所有提示词文件

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 3.1.1 | `prompts/analyst.md` | `prompts/analyst.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.2 | `prompts/api-reviewer.md` | `prompts/api-reviewer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.3 | `prompts/architect.md` | `prompts/architect.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.4 | `prompts/build-fixer.md` | `prompts/build-fixer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.5 | `prompts/code-reviewer.md` | `prompts/code-reviewer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.6 | `prompts/code-simplifier.md` | `prompts/code-simplifier.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.7 | `prompts/critic.md` | `prompts/critic.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.8 | `prompts/debugger.md` | `prompts/debugger.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.9 | `prompts/dependency-expert.md` | `prompts/dependency-expert.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.10 | `prompts/designer.md` | `prompts/designer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.11 | `prompts/executor.md` | `prompts/executor.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.12 | `prompts/explore-harness.md` | `prompts/explore-harness.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.13 | `prompts/explore.md` | `prompts/explore.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.14 | `prompts/git-master.md` | `prompts/git-master.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.15 | `prompts/information-architect.md` | `prompts/information-architect.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.16 | `prompts/performance-reviewer.md` | `prompts/performance-reviewer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.17 | `prompts/planner.md` | `prompts/planner.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.18 | `prompts/product-analyst.md` | `prompts/product-analyst.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.19 | `prompts/product-manager.md` | `prompts/product-manager.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.20 | `prompts/qa-tester.md` | `prompts/qa-tester.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.21 | `prompts/quality-reviewer.md` | `prompts/quality-reviewer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.22 | `prompts/quality-strategist.md` | `prompts/quality-strategist.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.23 | `prompts/researcher.md` | `prompts/researcher.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.24 | `prompts/security-reviewer.md` | `prompts/security-reviewer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.25 | `prompts/sisyphus-lite.md` | `prompts/sisyphus-lite.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.26 | `prompts/style-reviewer.md` | `prompts/style-reviewer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.27 | `prompts/team-executor.md` | `prompts/team-executor.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.28 | `prompts/team-orchestrator.md` | `prompts/team-orchestrator.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.29 | `prompts/test-engineer.md` | `prompts/test-engineer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.30 | `prompts/ux-researcher.md` | `prompts/ux-researcher.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.31 | `prompts/verifier.md` | `prompts/verifier.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.32 | `prompts/vision.md` | `prompts/vision.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 3.1.33 | `prompts/writer.md` | `prompts/writer.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

**检查点 3.1**：
执行验证命令：
```bash
./scripts/verify-stage.sh 3 "prompts" 33 yes
```
- [ ] 所有 33 个提示词文件已复制
- [ ] grep -r "oh-my-codex" prompts/ 无匹配结果

---

**阶段 3 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 3 "prompts" 33 yes
```
- [ ] 所有 33 个提示词模板移植完成

---

## 阶段 4：skills/ 技能工作流移植 (36 个文件)

### 任务 4.1：移植所有技能文件

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 4.1.1 | `skills/ai-slop-cleaner/SKILL.md` | `skills/ai-slop-cleaner/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.2 | `skills/analyze/SKILL.md` | `skills/analyze/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.3 | `skills/ask-claude/SKILL.md` | `skills/ask-claude/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode，**适配 qwen code** |
| 4.1.4 | `skills/ask-gemini/SKILL.md` | `skills/ask-gemini/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.5 | `skills/autopilot/SKILL.md` | `skills/autopilot/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.6 | `skills/build-fix/SKILL.md` | `skills/build-fix/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.7 | `skills/cancel/SKILL.md` | `skills/cancel/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.8 | `skills/code-review/SKILL.md` | `skills/code-review/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.9 | `skills/configure-notifications/SKILL.md` | `skills/configure-notifications/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.10 | `skills/deep-interview/SKILL.md` | `skills/deep-interview/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.11 | `skills/deepsearch/SKILL.md` | `skills/deepsearch/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.12 | `skills/doctor/SKILL.md` | `skills/doctor/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.13 | `skills/ecomode/SKILL.md` | `skills/ecomode/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.14 | `skills/frontend-ui-ux/SKILL.md` | `skills/frontend-ui-ux/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.15 | `skills/git-master/SKILL.md` | `skills/git-master/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.16 | `skills/help/SKILL.md` | `skills/help/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.17 | `skills/hud/SKILL.md` | `skills/hud/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.18 | `skills/note/SKILL.md` | `skills/note/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.19 | `skills/omx-setup/SKILL.md` | `skills/omx-setup/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.20 | `skills/pipeline/SKILL.md` | `skills/pipeline/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.21 | `skills/plan/SKILL.md` | `skills/plan/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.22 | `skills/ralph-init/SKILL.md` | `skills/ralph-init/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.23 | `skills/ralph/SKILL.md` | `skills/ralph/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.24 | `skills/ralplan/SKILL.md` | `skills/ralplan/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.25 | `skills/review/SKILL.md` | `skills/review/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.26 | `skills/security-review/SKILL.md` | `skills/security-review/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.27 | `skills/skill/SKILL.md` | `skills/skill/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.28 | `skills/swarm/SKILL.md` | `skills/swarm/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.29 | `skills/tdd/SKILL.md` | `skills/tdd/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.30 | `skills/team/SKILL.md` | `skills/team/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.31 | `skills/trace/SKILL.md` | `skills/trace/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.32 | `skills/ultraqa/SKILL.md` | `skills/ultraqa/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.33 | `skills/ultrawork/SKILL.md` | `skills/ultrawork/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.34 | `skills/visual-verdict/SKILL.md` | `skills/visual-verdict/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.35 | `skills/web-clone/SKILL.md` | `skills/web-clone/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 4.1.36 | `skills/worker/SKILL.md` | `skills/worker/SKILL.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

**检查点 4.1**：
执行验证命令：
```bash
./scripts/verify-stage.sh 4 "skills" 36 yes
# 检查 ask-claude 技能适配
grep -n "qwen\|Qwen" skills/ask-claude/SKILL.md
```
- [ ] 所有 36 个技能文件已复制
- [ ] grep -r "oh-my-codex" skills/ 无匹配结果
- [ ] ask-claude 技能已适配 qwen code

---

**阶段 4 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 4 "skills" 36 yes
```
- [ ] 所有 36 个技能工作流移植完成

---

## 阶段 5：docs/ 文档移植 (75 个文件)

### 任务 5.1：移植 docs/ 根目录文档 (28 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.1.1 | `docs/agents.html` | `docs/agents.html` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.2 | `docs/benchmarks/tetris-benchmark-comparison-20260306.png` | `docs/benchmarks/tetris-benchmark-comparison-20260306.png` | 复制（二进制文件） |
| 5.1.3 | `docs/clawhip-event-contract.md` | `docs/clawhip-event-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.4 | `docs/_config.yml` | `docs/_config.yml` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.5 | `docs/getting-started.html` | `docs/getting-started.html` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.6 | `docs/guidance-schema.md` | `docs/guidance-schema.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.7 | `docs/hooks-extension.md` | `docs/hooks-extension.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.8 | `docs/index.html` | `docs/index.html` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.9 | `docs/integrations.html` | `docs/integrations.html` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.10 | `docs/interop-team-mutation-contract.md` | `docs/interop-team-mutation-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.11 | `docs/migration-mainline-post-v0.4.4.md` | `docs/migration-mainline-post-v0.4.4.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.12 | `docs/openclaw-integration.de.md` | `docs/openclaw-integration.de.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.13 | `docs/openclaw-integration.es.md` | `docs/openclaw-integration.es.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.14 | `docs/openclaw-integration.fr.md` | `docs/openclaw-integration.fr.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.15 | `docs/openclaw-integration.it.md` | `docs/openclaw-integration.it.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.16 | `docs/openclaw-integration.ja.md` | `docs/openclaw-integration.ja.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.17 | `docs/openclaw-integration.ko.md` | `docs/openclaw-integration.ko.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.18 | `docs/openclaw-integration.md` | `docs/openclaw-integration.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.19 | `docs/openclaw-integration.pt.md` | `docs/openclaw-integration.pt.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.20 | `docs/openclaw-integration.ru.md` | `docs/openclaw-integration.ru.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.21 | `docs/openclaw-integration.tr.md` | `docs/openclaw-integration.tr.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.22 | `docs/openclaw-integration.vi.md` | `docs/openclaw-integration.vi.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.23 | `docs/openclaw-integration.zh.md` | `docs/openclaw-integration.zh.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.24 | `docs/openclaw-integration.zh-TW.md` | `docs/openclaw-integration.zh-TW.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.25 | `docs/prompt-guidance-contract.md` | `docs/prompt-guidance-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.26 | `docs/prompt-migration-changelog.md` | `docs/prompt-migration-changelog.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.27 | `docs/skills.html` | `docs/skills.html` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.1.28 | `docs/style.css` | `docs/style.css` | 复制 |

### 任务 5.2：移植 docs/contracts/ (9 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.2.1 | `docs/contracts/autoresearch-command-contract.md` | `docs/contracts/autoresearch-command-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.2 | `docs/contracts/autoresearch-command-review.md` | `docs/contracts/autoresearch-command-review.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.3 | `docs/contracts/autoresearch-ux-deep-interview-review.md` | `docs/contracts/autoresearch-ux-deep-interview-review.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.4 | `docs/contracts/mux-operation-space.md` | `docs/contracts/mux-operation-space.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.5 | `docs/contracts/ralph-cancel-contract.md` | `docs/contracts/ralph-cancel-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.6 | `docs/contracts/ralph-state-contract.md` | `docs/contracts/ralph-state-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.7 | `docs/contracts/runtime-authority-backlog-replay-readiness.md` | `docs/contracts/runtime-authority-backlog-replay-readiness.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.8 | `docs/contracts/runtime-command-event-snapshot-schema.md` | `docs/contracts/runtime-command-event-snapshot-schema.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.2.9 | `docs/contracts/rust-runtime-thin-adapter-contract.md` | `docs/contracts/rust-runtime-thin-adapter-contract.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.3：移植 docs/issues/ (1 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.3.1 | `docs/issues/team-ralph-followup-team.md` | `docs/issues/team-ralph-followup-team.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.4：移植 docs/prs/ (4 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.4.1 | `docs/prs/dev-deprecate-team-ralph.md` | `docs/prs/dev-deprecate-team-ralph.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.4.2 | `docs/prs/dev-issue-715-team-brain-role-split.md` | `docs/prs/dev-issue-715-team-brain-role-split.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.4.3 | `docs/prs/dev-team-ralph-workflow-positioning.md` | `docs/prs/dev-team-ralph-workflow-positioning.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.4.4 | `docs/prs/experimental-dev-omx-sparkshell.md` | `docs/prs/experimental-dev-omx-sparkshell.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.5：移植 docs/prompt-guidance-fragments/ (12 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.5.1 | `docs/prompt-guidance-fragments/core-operating-principles.md` | `docs/prompt-guidance-fragments/core-operating-principles.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.2 | `docs/prompt-guidance-fragments/core-verification-and-sequencing.md` | `docs/prompt-guidance-fragments/core-verification-and-sequencing.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.3 | `docs/prompt-guidance-fragments/executor-constraints.md` | `docs/prompt-guidance-fragments/executor-constraints.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.4 | `docs/prompt-guidance-fragments/executor-output.md` | `docs/prompt-guidance-fragments/executor-output.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.5 | `docs/prompt-guidance-fragments/executor-shared.md` | `docs/prompt-guidance-fragments/executor-shared.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.6 | `docs/prompt-guidance-fragments/planner-constraints.md` | `docs/prompt-guidance-fragments/planner-constraints.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.7 | `docs/prompt-guidance-fragments/planner-investigation.md` | `docs/prompt-guidance-fragments/planner-investigation.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.8 | `docs/prompt-guidance-fragments/planner-output.md` | `docs/prompt-guidance-fragments/planner-output.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.9 | `docs/prompt-guidance-fragments/planner-shared.md` | `docs/prompt-guidance-fragments/planner-shared.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.10 | `docs/prompt-guidance-fragments/verifier-constraints.md` | `docs/prompt-guidance-fragments/verifier-constraints.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.11 | `docs/prompt-guidance-fragments/verifier-investigation.md` | `docs/prompt-guidance-fragments/verifier-investigation.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.5.12 | `docs/prompt-guidance-fragments/verifier-shared.md` | `docs/prompt-guidance-fragments/verifier-shared.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.6：移植 docs/qa/ (14 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.6.1 | `docs/qa/deep-interview-phase-1-validation.md` | `docs/qa/deep-interview-phase-1-validation.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.2 | `docs/qa/explore-sparkshell-heavy-manual-stress.md` | `docs/qa/explore-sparkshell-heavy-manual-stress.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.3 | `docs/qa/plan-0.4.2.md` | `docs/qa/plan-0.4.2.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.4 | `docs/qa/ralph-persistence-gate.md` | `docs/qa/ralph-persistence-gate.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.5 | `docs/qa/release-readiness-0.8.1.md` | `docs/qa/release-readiness-0.8.1.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.6 | `docs/qa/release-readiness-0.8.2.md` | `docs/qa/release-readiness-0.8.2.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.7 | `docs/qa/release-readiness-0.8.3.md` | `docs/qa/release-readiness-0.8.3.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.8 | `docs/qa/release-readiness-0.8.4.md` | `docs/qa/release-readiness-0.8.4.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.9 | `docs/qa/release-readiness-0.9.0.md` | `docs/qa/release-readiness-0.9.0.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.10 | `docs/qa/release-readiness-0.9.1.md` | `docs/qa/release-readiness-0.9.1.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.11 | `docs/qa/release-readiness-follow-up.md` | `docs/qa/release-readiness-follow-up.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.12 | `docs/qa/remaining-suite-drift-2026-03-19.md` | `docs/qa/remaining-suite-drift-2026-03-19.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.13 | `docs/qa-report-0.4.2.md` | `docs/qa-report-0.4.2.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.6.14 | `docs/qa/rust-runtime-thin-adapter-gate.md` | `docs/qa/rust-runtime-thin-adapter-gate.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.7：移植 docs/reference/ (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.7.1 | `docs/reference/ralph-parity-matrix.md` | `docs/reference/ralph-parity-matrix.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.7.2 | `docs/reference/ralph-upstream-baseline.md` | `docs/reference/ralph-upstream-baseline.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.7.3 | `docs/reference/team-allocation-rebalance-policy.md` | `docs/reference/team-allocation-rebalance-policy.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.8：移植 docs/release-notes/ (17 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.8.1 | `docs/release-body-0.9.0.md` | `docs/release-body-0.9.0.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.2 | `docs/release-body-0.9.1.md` | `docs/release-body-0.9.1.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.3 | `docs/release-notes-0.11.10.md` | `docs/release-notes-0.11.10.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.4 | `docs/release-notes-0.11.8.md` | `docs/release-notes-0.11.8.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.5 | `docs/release-notes-0.11.9.md` | `docs/release-notes-0.11.9.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.6 | `docs/release-notes-0.7.6.md` | `docs/release-notes-0.7.6.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.7 | `docs/release-notes-0.8.1.md` | `docs/release-notes-0.8.1.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.8 | `docs/release-notes-0.8.2.md` | `docs/release-notes-0.8.2.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.9 | `docs/release-notes-0.8.3.md` | `docs/release-notes-0.8.3.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.10 | `docs/release-notes-0.8.4.md` | `docs/release-notes-0.8.4.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.11 | `docs/release-notes-0.8.5.md` | `docs/release-notes-0.8.5.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.12 | `docs/release-notes-0.8.6.md` | `docs/release-notes-0.8.6.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.13 | `docs/release-notes-0.8.7.md` | `docs/release-notes-0.8.7.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.14 | `docs/release-notes-0.8.8.md` | `docs/release-notes-0.8.8.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.15 | `docs/release-notes-0.8.9.md` | `docs/release-notes-0.8.9.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.16 | `docs/release-notes-0.9.0.md` | `docs/release-notes-0.9.0.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.8.17 | `docs/release-notes-0.9.1.md` | `docs/release-notes-0.9.1.md` | 复制，替换 oh-my-codex → oh-my-qwencode |

### 任务 5.9：移植 docs/shared/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 5.9.1 | `docs/shared/agent-tiers.md` | `docs/shared/agent-tiers.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 5.9.2 | `docs/shared/omx-character-spark-initiative.jpg` | `docs/shared/omx-character-spark-initiative.jpg` | 复制（二进制文件） |

**检查点 5.1-5.9**：
- [ ] 所有 75 个文档文件已复制
- [ ] grep -r "oh-my-codex" docs/ 无匹配结果

---

**阶段 5 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 5 "docs" 75 yes
```
- [ ] 所有 75 个文档文件移植完成

---

## 阶段 6：missions/ 和 playground/ 移植 (34 个文件)

### 任务 6.1：移植 missions/ (17 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 6.1.1 | `missions/README.md` | `missions/README.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 6.1.2 | `missions/adaptive-sort-optimization/mission.md` | `missions/adaptive-sort-optimization/mission.md` | 复制 |
| 6.1.3 | `missions/adaptive-sort-optimization/sandbox.md` | `missions/adaptive-sort-optimization/sandbox.md` | 复制 |
| 6.1.4 | `missions/candidate-handoff/mission.md` | `missions/candidate-handoff/mission.md` | 复制 |
| 6.1.5 | `missions/candidate-handoff/sandbox.md` | `missions/candidate-handoff/sandbox.md` | 复制 |
| 6.1.6 | `missions/cli-discoverability-pilot/mission.md` | `missions/cli-discoverability-pilot/mission.md` | 复制 |
| 6.1.7 | `missions/cli-discoverability-pilot/sandbox.md` | `missions/cli-discoverability-pilot/sandbox.md` | 复制 |
| 6.1.8 | `missions/fresh-run-tagging/mission.md` | `missions/fresh-run-tagging/mission.md` | 复制 |
| 6.1.9 | `missions/fresh-run-tagging/sandbox.md` | `missions/fresh-run-tagging/sandbox.md` | 复制 |
| 6.1.10 | `missions/help-consistency/mission.md` | `missions/help-consistency/mission.md` | 复制 |
| 6.1.11 | `missions/help-consistency/sandbox.md` | `missions/help-consistency/sandbox.md` | 复制 |
| 6.1.12 | `missions/in-action-cat-shellout-demo/mission.md` | `missions/in-action-cat-shellout-demo/mission.md` | 复制 |
| 6.1.13 | `missions/in-action-cat-shellout-demo/sandbox.md` | `missions/in-action-cat-shellout-demo/sandbox.md` | 复制 |
| 6.1.14 | `missions/ml-kaggle-model-optimization/mission.md` | `missions/ml-kaggle-model-optimization/mission.md` | 复制 |
| 6.1.15 | `missions/ml-kaggle-model-optimization/sandbox.md` | `missions/ml-kaggle-model-optimization/sandbox.md` | 复制 |
| 6.1.16 | `missions/noisy-bayesopt-highdim/mission.md` | `missions/noisy-bayesopt-highdim/mission.md` | 复制 |
| 6.1.17 | `missions/noisy-bayesopt-highdim/sandbox.md` | `missions/noisy-bayesopt-highdim/sandbox.md` | 复制 |
| 6.1.18 | `missions/noisy-latent-subspace-discovery/mission.md` | `missions/noisy-latent-subspace-discovery/mission.md` | 复制 |
| 6.1.19 | `missions/noisy-latent-subspace-discovery/sandbox.md` | `missions/noisy-latent-subspace-discovery/sandbox.md` | 复制 |
| 6.1.20 | `missions/parity-smoke/mission.md` | `missions/parity-smoke/mission.md` | 复制 |
| 6.1.21 | `missions/parity-smoke/sandbox.md` | `missions/parity-smoke/sandbox.md` | 复制 |
| 6.1.22 | `missions/parity-sweep/mission.md` | `missions/parity-sweep/mission.md` | 复制 |
| 6.1.23 | `missions/parity-sweep/sandbox.md` | `missions/parity-sweep/sandbox.md` | 复制 |
| 6.1.24 | `missions/resume-dirty-guard/mission.md` | `missions/resume-dirty-guard/mission.md` | 复制 |
| 6.1.25 | `missions/resume-dirty-guard/sandbox.md` | `missions/resume-dirty-guard/sandbox.md` | 复制 |
| 6.1.26 | `missions/security-path-traversal-pilot/mission.md` | `missions/security-path-traversal-pilot/mission.md` | 复制 |
| 6.1.27 | `missions/security-path-traversal-pilot/sandbox.md` | `missions/security-path-traversal-pilot/sandbox.md` | 复制 |

### 任务 6.2：移植 playground/ (17 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 6.2.1 | `playground/README.md` | `playground/README.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 6.2.2 | `playground/.gitignore` | `playground/.gitignore` | 复制 |
| 6.2.3 | `playground/adaptive_sort_demo/config.json` | `playground/adaptive_sort_demo/config.json` | 复制 |
| 6.2.4 | `playground/adaptive_sort_demo/.gitignore` | `playground/adaptive_sort_demo/.gitignore` | 复制 |
| 6.2.5 | `playground/adaptive_sort_demo/sort_benchmark.py` | `playground/adaptive_sort_demo/sort_benchmark.py` | 复制 |
| 6.2.6 | `playground/bayesopt_highdim_demo/config.json` | `playground/bayesopt_highdim_demo/config.json` | 复制 |
| 6.2.7 | `playground/bayesopt_highdim_demo/.gitignore` | `playground/bayesopt_highdim_demo/.gitignore` | 复制 |
| 6.2.8 | `playground/bayesopt_highdim_demo/optimizer.py` | `playground/bayesopt_highdim_demo/optimizer.py` | 复制 |
| 6.2.9 | `playground/bayesopt_highdim_demo/problem.py` | `playground/bayesopt_highdim_demo/problem.py` | 复制 |
| 6.2.10 | `playground/bayesopt_highdim_demo/run_search.py` | `playground/bayesopt_highdim_demo/run_search.py` | 复制 |
| 6.2.11 | `playground/bayesopt_latent_discovery_demo/config.json` | `playground/bayesopt_latent_discovery_demo/config.json` | 复制 |
| 6.2.12 | `playground/bayesopt_latent_discovery_demo/.gitignore` | `playground/bayesopt_latent_discovery_demo/.gitignore` | 复制 |
| 6.2.13 | `playground/bayesopt_latent_discovery_demo/optimizer.py` | `playground/bayesopt_latent_discovery_demo/optimizer.py` | 复制 |
| 6.2.14 | `playground/bayesopt_latent_discovery_demo/problem.py` | `playground/bayesopt_latent_discovery_demo/problem.py` | 复制 |
| 6.2.15 | `playground/bayesopt_latent_discovery_demo/run_search.py` | `playground/bayesopt_latent_discovery_demo/run_search.py` | 复制 |
| 6.2.16 | `playground/ml_kaggle_demo/config.json` | `playground/ml_kaggle_demo/config.json` | 复制 |
| 6.2.17 | `playground/ml_kaggle_demo/model_factory.py` | `playground/ml_kaggle_demo/model_factory.py` | 复制 |
| 6.2.18 | `playground/ml_kaggle_demo/train.py` | `playground/ml_kaggle_demo/train.py` | 复制 |

**检查点 6.1-6.2**：
执行验证命令：
```bash
./scripts/verify-stage.sh 6 "missions" 27 yes
./scripts/verify-stage.sh 6 "playground" 18 yes
```
- [ ] 所有 34 个 missions/playground 文件已复制
- [ ] grep -r "oh-my-codex" missions/ playground/ 无匹配结果

---

**阶段 6 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 6 "missions" 27 yes
./scripts/verify-stage.sh 6 "playground" 18 yes
```
- [ ] 所有 34 个 missions/playground 文件移植完成

---

## 阶段 7：templates/ 模板文件移植 (2 个文件)

### 任务 7.1：移植模板文件

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 7.1.1 | `templates/AGENTS.md` | `templates/AGENTS.md` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 7.1.2 | `templates/catalog-manifest.json` | `templates/catalog-manifest.json` | 复制 |

**检查点 7.1**：
执行验证命令：
```bash
./scripts/verify-stage.sh 7 "templates" 2 yes
```
- [ ] 所有 2 个模板文件已复制
- [ ] grep -r "oh-my-codex" templates/ 无匹配结果

---

**阶段 7 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 7 "templates" 2 yes
```
- [ ] 所有 2 个模板文件移植完成

---

## 阶段 8：src/ TypeScript 源代码移植 (~430 个文件)

由于 src/ 目录文件数量较多，按子模块划分：

### 任务 8.1：移植 src/agents/ (4 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.1.1 | `src/agents/definitions.ts` | `src/agents/definitions.ts` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 8.1.2 | `src/agents/native-config.ts` | `src/agents/native-config.ts` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 8.1.3 | `src/agents/__tests__/definitions.test.ts` | `src/agents/__tests__/definitions.test.ts` | 复制 |
| 8.1.4 | `src/agents/__tests__/native-config.test.ts` | `src/agents/__tests__/native-config.test.ts` | 复制 |

**检查点 8.1**：[ ] 4 个文件已复制

---

### 任务 8.2：移植 src/autoresearch/ (5 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.2.1 | `src/autoresearch/contracts.ts` | `src/autoresearch/contracts.ts` | 复制 |
| 8.2.2 | `src/autoresearch/runtime.ts` | `src/autoresearch/runtime.ts` | 复制 |
| 8.2.3 | `src/autoresearch/__tests__/contracts.test.ts` | `src/autoresearch/__tests__/contracts.test.ts` | 复制 |
| 8.2.4 | `src/autoresearch/__tests__/runtime-parity-extra.test.ts` | `src/autoresearch/__tests__/runtime-parity-extra.test.ts` | 复制 |
| 8.2.5 | `src/autoresearch/__tests__/runtime.test.ts` | `src/autoresearch/__tests__/runtime.test.ts` | 复制 |

**检查点 8.2**：[ ] 5 个文件已复制

---

### 任务 8.3：移植 src/catalog/ (6 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.3.1 | `src/catalog/generated/public-catalog.json` | `src/catalog/generated/public-catalog.json` | 复制，替换 oh-my-codex → oh-my-qwencode |
| 8.3.2 | `src/catalog/manifest.json` | `src/catalog/manifest.json` | 复制 |
| 8.3.3 | `src/catalog/reader.ts` | `src/catalog/reader.ts` | 复制 |
| 8.3.4 | `src/catalog/schema.ts` | `src/catalog/schema.ts` | 复制 |
| 8.3.5 | `src/catalog/__tests__/generator.test.ts` | `src/catalog/__tests__/generator.test.ts` | 复制 |
| 8.3.6 | `src/catalog/__tests__/schema.test.ts` | `src/catalog/__tests__/schema.test.ts` | 复制 |

**检查点 8.3**：[ ] 6 个文件已复制

---

### 任务 8.4：移植 src/cli/ (56 个文件)

**注意**：此模块需要适配 qwen code CLI API

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.4.1 | `src/cli/agents-init.ts` | `src/cli/agents-init.ts` | 复制 |
| 8.4.2 | `src/cli/agents.ts` | `src/cli/agents.ts` | 复制 |
| 8.4.3 | `src/cli/ask.ts` | `src/cli/ask.ts` | 复制，**适配 qwen code** |
| 8.4.4 | `src/cli/autoresearch-guided.ts` | `src/cli/autoresearch-guided.ts` | 复制 |
| 8.4.5 | `src/cli/autoresearch-intake.ts` | `src/cli/autoresearch-intake.ts` | 复制 |
| 8.4.6 | `src/cli/autoresearch.ts` | `src/cli/autoresearch.ts` | 复制 |
| 8.4.7 | `src/cli/catalog-contract.ts` | `src/cli/catalog-contract.ts` | 复制 |
| 8.4.8 | `src/cli/cleanup.ts` | `src/cli/cleanup.ts` | 复制 |
| 8.4.9 | `src/cli/constants.ts` | `src/cli/constants.ts` | 复制 |
| 8.4.10 | `src/cli/doctor.ts` | `src/cli/doctor.ts` | 复制 |
| 8.4.11 | `src/cli/explore.ts` | `src/cli/explore.ts` | 复制，**适配 qwen code** |
| 8.4.12 | `src/cli/hooks.ts` | `src/cli/hooks.ts` | 复制 |
| 8.4.13 | `src/cli/index.ts` | `src/cli/index.ts` | 复制 |
| 8.4.14 | `src/cli/native-assets.ts` | `src/cli/native-assets.ts` | 复制 |
| 8.4.15 | `src/cli/omx.ts` | `src/cli/omx.ts` | 复制，**适配 qwen code** |
| 8.4.16 | `src/cli/ralph.ts` | `src/cli/ralph.ts` | 复制 |
| 8.4.17 | `src/cli/session-search.ts` | `src/cli/session-search.ts` | 复制 |
| 8.4.18 | `src/cli/setup.ts` | `src/cli/setup.ts` | 复制 |
| 8.4.19 | `src/cli/sparkshell.ts` | `src/cli/sparkshell.ts` | 复制，**适配 qwen code** |
| 8.4.20 | `src/cli/star-prompt.ts` | `src/cli/star-prompt.ts` | 复制 |
| 8.4.21 | `src/cli/team.ts` | `src/cli/team.ts` | 复制，**适配 qwen code** |
| 8.4.22-8.4.56 | `src/cli/__tests__/*.test.ts` (35 个测试文件) | `src/cli/__tests__/*.test.ts` | 复制 |
| 8.4.57 | `src/cli/tmux-hook.ts` | `src/cli/tmux-hook.ts` | 复制 |
| 8.4.58 | `src/cli/uninstall.ts` | `src/cli/uninstall.ts` | 复制 |
| 8.4.59 | `src/cli/update.ts` | `src/cli/update.ts` | 复制 |
| 8.4.60 | `src/cli/version.ts` | `src/cli/version.ts` | 复制 |

**检查点 8.4**：
- [ ] 56 个文件已复制
- [ ] qwen code API 适配完成
- [ ] TypeScript 编译通过

---

### 任务 8.5：移植 src/compat/ (5 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.5.1-8.5.5 | `src/compat/fixtures/*` (5 个 fixture 文件) | `src/compat/fixtures/*` | 复制 |
| 8.5.6-8.5.7 | `src/compat/__tests__/*.test.ts` (2 个测试文件) | `src/compat/__tests__/*.test.ts` | 复制 |

**检查点 8.5**：[ ] 5 个文件已复制

---

### 任务 8.6：移植 src/config/ (8 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.6.1 | `src/config/generator.ts` | `src/config/generator.ts` | 复制 |
| 8.6.2 | `src/config/mcp-registry.ts` | `src/config/mcp-registry.ts` | 复制 |
| 8.6.3 | `src/config/models.ts` | `src/config/models.ts` | 复制，**适配 qwen code 模型** |
| 8.6.4 | `src/config/__tests__/generator-idempotent.test.ts` | `src/config/__tests__/generator-idempotent.test.ts` | 复制 |
| 8.6.5 | `src/config/__tests__/generator-notify.test.ts` | `src/config/__tests__/generator-notify.test.ts` | 复制 |
| 8.6.6 | `src/config/__tests__/mcp-registry.test.ts` | `src/config/__tests__/mcp-registry.test.ts` | 复制 |
| 8.6.7 | `src/config/__tests__/models.test.ts` | `src/config/__tests__/models.test.ts` | 复制 |

**检查点 8.6**：[ ] 8 个文件已复制

---

### 任务 8.7：移植 src/hooks/ (66 个文件)

**注意**：此模块是核心钩子系统，需要仔细适配

| # | 子目录 | 文件数 | 操作 |
|---|--------|--------|------|
| 8.7.1 | `src/hooks/` 根目录 | ~10 个 | 复制所有 .ts 文件 |
| 8.7.2 | `src/hooks/code-simplifier/` | 2 个 | 复制 |
| 8.7.3 | `src/hooks/extensibility/` | ~20 个 | 复制 |
| 8.7.4 | `src/hooks/extensibility/sdk/` | ~5 个 | 复制 |
| 8.7.5 | `src/hooks/extensibility/__tests__/` | ~10 个 | 复制 |
| 8.7.6 | `src/hooks/__tests__/` | ~30 个 | 复制 |

**检查点 8.7**：
- [ ] 66 个文件已复制
- [ ] TypeScript 编译通过

---

### 任务 8.8：移植 src/hud/ (14 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.8.1-8.8.7 | `src/hud/*.ts` (7 个主文件) | `src/hud/*.ts` | 复制 |
| 8.8.8-8.8.14 | `src/hud/__tests__/*.test.ts` (7 个测试文件) | `src/hud/__tests__/*.test.ts` | 复制 |

**检查点 8.8**：[ ] 14 个文件已复制

---

### 任务 8.9：移植 src/mcp/ (20 个文件)

**注意**：MCP 服务器需要适配 qwen code MCP 协议

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.9.1 | `src/mcp/bootstrap.ts` | `src/mcp/bootstrap.ts` | 复制 |
| 8.9.2 | `src/mcp/code-intel-server.ts` | `src/mcp/code-intel-server.ts` | 复制 |
| 8.9.3 | `src/mcp/memory-server.ts` | `src/mcp/memory-server.ts` | 复制 |
| 8.9.4 | `src/mcp/memory-validation.ts` | `src/mcp/memory-validation.ts` | 复制 |
| 8.9.5 | `src/mcp/state-paths.ts` | `src/mcp/state-paths.ts` | 复制 |
| 8.9.6 | `src/mcp/state-server.ts` | `src/mcp/state-server.ts` | 复制 |
| 8.9.7 | `src/mcp/team-server.ts` | `src/mcp/team-server.ts` | 复制 |
| 8.9.8 | `src/mcp/trace-server.ts` | `src/mcp/trace-server.ts` | 复制 |
| 8.9.9-8.9.20 | `src/mcp/__tests__/*.test.ts` (12 个测试文件) | `src/mcp/__tests__/*.test.ts` | 复制 |

**检查点 8.9**：
- [ ] 20 个文件已复制
- [ ] MCP 协议适配完成

---

### 任务 8.10：移植 src/modes/ (5 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.10.1 | `src/modes/base.ts` | `src/modes/base.ts` | 复制 |
| 8.10.2-8.10.5 | `src/modes/__tests__/*.test.ts` (4 个测试文件) | `src/modes/__tests__/*.test.ts` | 复制 |

**检查点 8.10**：[ ] 5 个文件已复制

---

### 任务 8.11：移植 src/notifications/ (25 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.11.1-8.11.16 | `src/notifications/*.ts` (16 个主文件) | `src/notifications/*.ts` | 复制 |
| 8.11.17-8.11.25 | `src/notifications/__tests__/*.test.ts` (17 个测试文件) | `src/notifications/__tests__/*.test.ts` | 复制 |

**检查点 8.11**：[ ] 25 个文件已复制

---

### 任务 8.12：移植 src/openclaw/ (7 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.12.1-8.12.4 | `src/openclaw/*.ts` (4 个主文件) | `src/openclaw/*.ts` | 复制 |
| 8.12.5-8.12.7 | `src/openclaw/__tests__/*.test.ts` (3 个测试文件) | `src/openclaw/__tests__/*.test.ts` | 复制 |

**检查点 8.12**：[ ] 7 个文件已复制

---

### 任务 8.13：移植 src/pipeline/ (8 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.13.1-8.13.6 | `src/pipeline/*.ts` (6 个主文件) | `src/pipeline/*.ts` | 复制 |
| 8.13.7-8.13.8 | `src/pipeline/__tests__/*.test.ts` (2 个测试文件) | `src/pipeline/__tests__/*.test.ts` | 复制 |

**检查点 8.13**：[ ] 8 个文件已复制

---

### 任务 8.14：移植 src/planning/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.14.1 | `src/planning/artifacts.ts` | `src/planning/artifacts.ts` | 复制 |
| 8.14.2 | `src/planning/__tests__/artifacts.test.ts` | `src/planning/__tests__/artifacts.test.ts` | 复制 |

**检查点 8.14**：[ ] 2 个文件已复制

---

### 任务 8.15：移植 src/ralph/ (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.15.1 | `src/ralph/contract.ts` | `src/ralph/contract.ts` | 复制 |
| 8.15.2 | `src/ralph/persistence.ts` | `src/ralph/persistence.ts` | 复制 |
| 8.15.3 | `src/ralph/__tests__/persistence.test.ts` | `src/ralph/__tests__/persistence.test.ts` | 复制 |

**检查点 8.15**：[ ] 3 个文件已复制

---

### 任务 8.16：移植 src/ralplan/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.16.1 | `src/ralplan/runtime.ts` | `src/ralplan/runtime.ts` | 复制 |
| 8.16.2 | `src/ralplan/__tests__/runtime.test.ts` | `src/ralplan/__tests__/runtime.test.ts` | 复制 |

**检查点 8.16**：[ ] 2 个文件已复制

---

### 任务 8.17：移植 src/runtime/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.17.1 | `src/runtime/bridge.ts` | `src/runtime/bridge.ts` | 复制，**适配 qwen code** |
| 8.17.2 | `src/runtime/__tests__/bridge.test.ts` | `src/runtime/__tests__/bridge.test.ts` | 复制 |

**检查点 8.17**：
- [ ] 2 个文件已复制
- [ ] qwen code 适配完成

---

### 任务 8.18：移植 src/scripts/ (46 个文件)

**注意**：此模块包含构建脚本和辅助工具

| # | 子目录 | 文件数 | 操作 |
|---|--------|--------|------|
| 8.18.1 | `src/scripts/` 根目录 | ~20 个 | 复制所有 .ts/.sh 文件 |
| 8.18.2 | `src/scripts/eval/` | ~12 个 | 复制 |
| 8.18.3 | `src/scripts/fixtures/` | 1 个 | 复制 |
| 8.18.4 | `src/scripts/notify-hook/` | ~12 个 | 复制 |
| 8.18.5 | `src/scripts/__tests__/` | 2 个 | 复制 |

**检查点 8.18**：[ ] 46 个文件已复制

---

### 任务 8.19：移植 src/session-history/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.19.1 | `src/session-history/search.ts` | `src/session-history/search.ts` | 复制 |
| 8.19.2 | `src/session-history/__tests__/search.test.ts` | `src/session-history/__tests__/search.test.ts` | 复制 |

**检查点 8.19**：[ ] 2 个文件已复制

---

### 任务 8.20：移植 src/state/ (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.20.1 | `src/state/mode-state-context.ts` | `src/state/mode-state-context.ts` | 复制 |
| 8.20.2 | `src/state/paths.ts` | `src/state/paths.ts` | 复制 |
| 8.20.3 | `src/state/__tests__/mode-state-context.test.ts` | `src/state/__tests__/mode-state-context.test.ts` | 复制 |

**检查点 8.20**：[ ] 3 个文件已复制

---

### 任务 8.21：移植 src/subagents/ (2 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.21.1 | `src/subagents/tracker.ts` | `src/subagents/tracker.ts` | 复制 |
| 8.21.2 | `src/subagents/__tests__/tracker.test.ts` | `src/subagents/__tests__/tracker.test.ts` | 复制 |

**检查点 8.21**：[ ] 2 个文件已复制

---

### 任务 8.22：移植 src/team/ (47 个文件)

**注意**：此模块是核心编排系统，需要仔细适配 qwen code

| # | 子目录 | 文件数 | 操作 |
|---|--------|--------|------|
| 8.22.1 | `src/team/` 根目录 | ~15 个 | 复制所有 .ts 文件 |
| 8.22.2 | `src/team/state/` | ~15 个 | 复制 |
| 8.22.3 | `src/team/__tests__/` | ~25 个 | 复制 |

**检查点 8.22**：
- [ ] 47 个文件已复制
- [ ] qwen code API 适配完成
- [ ] TypeScript 编译通过

---

### 任务 8.23：移植 src/types/ (1 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.23.1 | `src/types/tmux-hook-engine.d.ts` | `src/types/tmux-hook-engine.d.ts` | 复制 |

**检查点 8.23**：[ ] 1 个文件已复制

---

### 任务 8.24：移植 src/utils/ (13 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.24.1-8.24.7 | `src/utils/*.ts` (7 个主文件) | `src/utils/*.ts` | 复制 |
| 8.24.8-8.24.13 | `src/utils/__tests__/*.test.ts` (6 个测试文件) | `src/utils/__tests__/*.test.ts` | 复制 |

**检查点 8.24**：[ ] 13 个文件已复制

---

### 任务 8.25：移植 src/verification/ (7 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.25.1 | `src/verification/verifier.ts` | `src/verification/verifier.ts` | 复制 |
| 8.25.2-8.25.7 | `src/verification/__tests__/*.test.ts` (6 个测试文件) | `src/verification/__tests__/*.test.ts` | 复制 |

**检查点 8.25**：[ ] 7 个文件已复制

---

### 任务 8.26：移植 src/visual/ (3 个文件)

| # | 源文件 | 目标文件 | 操作 |
|---|--------|----------|------|
| 8.26.1 | `src/visual/constants.ts` | `src/visual/constants.ts` | 复制 |
| 8.26.2 | `src/visual/verdict.ts` | `src/visual/verdict.ts` | 复制 |
| 8.26.3 | `src/visual/__tests__/verdict.test.ts` | `src/visual/__tests__/verdict.test.ts` | 复制 |

**检查点 8.26**：[ ] 3 个文件已复制

---

**阶段 8 总检查点**：
执行验证命令：
```bash
./scripts/verify-stage.sh 8 "src" 430
npm run build
npm run typecheck
npm test
```
- [ ] 所有 ~430 个 TypeScript 文件已复制
- [ ] `npm run build` 通过
- [ ] `npm run typecheck` 通过
- [ ] `npm test` 通过
- [ ] 无 oh-my-codex 痕迹

---

## 阶段 9：qwen code 适配

### 任务 9.1：识别并适配 codex 特定 API

**需要适配的关键文件**：

| 文件 | 适配内容 |
|------|----------|
| `src/cli/omx.ts` | CLI 启动逻辑，适配 qwen code 启动方式 |
| `src/cli/ask.ts` | ask-claude/ask-gemini 适配 qwen code |
| `src/cli/explore.ts` | 代码探索适配 qwen code |
| `src/cli/sparkshell.ts` | sparkshell 适配 qwen code |
| `src/cli/team.ts` | 团队编排适配 qwen code |
| `src/runtime/bridge.ts` | 运行时桥接适配 qwen code |
| `src/config/models.ts` | 模型配置适配 qwen code |
| `crates/omx-sparkshell/src/codex_bridge.rs` | Rust 桥接适配 qwen code |
| `crates/omx-sparkshell/src/main.rs` | Rust 主程序适配 qwen code |

**子任务 9.1.1**：调研 qwen code CLI API
- 检查点：[ ] 记录 qwen code 与 codex 的 API 差异

**子任务 9.1.2**：修改上述文件适配 qwen code
- 检查点：[ ] 所有 codex API 调用已替换为 qwen code API

**子任务 9.1.3**：技术可行性评估
- 检查点：[ ] 记录技术不可行功能（如有）

---

**阶段 9 总检查点**：
执行验证命令：
```bash
# 检查 qwen code 适配
grep -r "qwen\|Qwen" src/cli/ --include="*.ts" | head -20
grep -r "qwen\|Qwen" crates/ --include="*.rs" | head -10
# 检查 codex 残留
grep -r " codex " src/cli/ --include="*.ts" | grep -v "oh-my-codex" || echo "✓ 无 codex 命令残留"
```
- [ ] qwen code 适配完成
- [ ] 技术不可行功能已记录

---

## 阶段 10：构建和测试验证

### 任务 10.1：Rust 构建验证

**子任务 10.1.1**：执行 `cargo build --workspace`
- 检查点：[ ] 构建成功，无编译错误

**子任务 10.1.2**：执行 `cargo test --workspace`
- 检查点：[ ] 所有测试通过

**检查点 10.1**：
执行验证命令：
```bash
cargo build --workspace
cargo test --workspace
```
- [ ] Rust 构建和测试通过

---

### 任务 10.2：TypeScript 构建验证

**子任务 10.2.1**：执行 `npm install`
- 检查点：[ ] 依赖安装成功

**子任务 10.2.2**：执行 `npm run build`
- 检查点：[ ] 构建成功，无编译错误

**子任务 10.2.3**：执行 `npm run typecheck`
- 检查点：[ ] 类型检查通过

**检查点 10.2**：
执行验证命令：
```bash
npm install
npm run build
npm run typecheck
```
- [ ] TypeScript 构建和类型检查通过

---

### 任务 10.3：TypeScript 测试验证

**子任务 10.3.1**：执行 `npm test`
- 检查点：[ ] 所有测试通过

**检查点 10.3**：
执行验证命令：
```bash
npm test
```
- [ ] TypeScript 测试通过

---

### 任务 10.4：完整构建验证

**子任务 10.4.1**：执行 `npm run build:full`
- 检查点：[ ] 完整构建成功

**检查点 10.4**：
执行验证命令：
```bash
npm run build:full
```
- [ ] 完整构建通过

---

**阶段 10 总检查点**：
执行验证命令：
```bash
./scripts/verify-full.sh
```
- [ ] 所有构建和测试验证通过

---

## 阶段 11：最终检查

### 任务 11.1：oh-my-codex 痕迹检查

**子任务 11.1.1**：使用 grep 扫描整个项目
```bash
grep -r "oh-my-codex" . --exclude-dir=node_modules --exclude-dir=target --exclude-dir=dist --exclude-dir=.git
```
- 检查点：[ ] 确认无任何 oh-my-codex 引用（除 CHANGELOG.md 历史记录外）

**子任务 11.1.2**：检查 import 路径
- 检查点：[ ] 确认无 oh-my-codex 路径

**子任务 11.1.3**：检查注释
- 检查点：[ ] 确认注释中无 oh-my-codex 引用

**子任务 11.1.4**：检查配置文件
- 检查点：[ ] 确认配置文件中无 oh-my-codex 引用

**子任务 11.1.5**：检查依赖声明
- 检查点：[ ] 确认依赖声明中无 oh-my-codex 引用

**检查点 11.1**：
执行验证命令：
```bash
grep -r "oh-my-codex" . --exclude-dir=node_modules --exclude-dir=target --exclude-dir=dist --exclude-dir=.git --exclude="CHANGELOG.md" --exclude="DEVELOPMENT_PLAN.md" --exclude="verify-*.sh"
```
- [ ] 无 oh-my-codex 痕迹

---

### 任务 11.2：文件完整性检查

**子任务 11.2.1**：对比源项目文件清单
- 检查点：[ ] 确认 707 个文件已全部移植

**检查点 11.2**：
执行验证命令：
```bash
./scripts/verify-full.sh
```
- [ ] 文件完整性验证通过

---

**阶段 11 总检查点**：
执行验证命令：
```bash
./scripts/verify-full.sh
```
- [ ] 所有最终检查通过

---

## 项目完成检查点

**最终验收标准检查**：
执行验证命令：
```bash
./scripts/verify-full.sh
```

1. [ ] oh-my-qwencode 是构建在 qwen code 之上的项目（适配 qwen code）
2. [ ] oh-my-codex 里的所有内容已移植到 oh-my-qwencode 并做好了对 qwen code 的适配
3. [ ] oh-my-qwencode 可以正常 build 和启动
4. [ ] 所有功能验证正常（通过单元测试 + 手动功能清单验证）
5. [ ] 所有文档和代码无 oh-my-codex 痕迹

---

## 技术不可行功能记录

（在开发过程中发现的技术不可行功能将记录在此处）

| # | 功能 | 原因 | 替代方案 | 状态 |
|---|------|------|----------|------|
| TBD | TBD | TBD | TBD | TBD |

---

## 文件统计汇总

| 阶段 | 目录 | 文件数量 |
|------|------|---------|
| 阶段 1 | 根目录 + .github/ | 35 |
| 阶段 2 | crates/ | 36 |
| 阶段 3 | prompts/ | 33 |
| 阶段 4 | skills/ | 36 |
| 阶段 5 | docs/ | 75 |
| 阶段 6 | missions/ + playground/ | 34 |
| 阶段 7 | templates/ | 2 |
| 阶段 8 | src/ | ~430 |
| **总计** | | **~707** |

---

**文档版本**：1.0
**创建日期**：2026-04-02
**最后更新**：2026-04-02
