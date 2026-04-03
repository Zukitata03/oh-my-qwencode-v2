## 项目目标和要求
- 这是一个库移植项目，目的是将 oh-my-codex 项目（基于 codex 构建）的所有功能移植到 oh-my-qwencode 项目（本项目，基于 qwen code 构建）。
- 项目实现要求：
   1. 将 oh-my-codex 的所有功能复制到本项目，并完成对 qwen code 的适配。
   2. 所有的文档和代码不能有 oh-my-codex 的痕迹（包括但不限于：import 路径、项目名称、注释、配置文件、依赖声明等），只能出现 oh-my-qwencode。
- 项目验收标准：
   1. oh-my-qwencode 是构建在 qwen code 之上的项目（适配 qwen code）。
   2. oh-my-codex 里的所有内容（源代码、文档、配置文件、测试用例、CI/CD 脚本等）都移植到 oh-my-qwencode 并做好了对 qwen code 的适配。
   3. oh-my-qwencode 可以正常 build 和启动，所有功能验证正常（通过单元测试 + 手动功能清单验证）。
- 补充说明：
   1. 源项目地址：/home/admin/Workspace/oh-my-codex 。目标项目：oh-my-qwencode 当前工作目录。
   2. 如发现某些功能在 qwen code 上技术不可行，需记录并告知用户，不得擅自跳过。
