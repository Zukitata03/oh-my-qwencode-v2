#!/bin/bash
# verify-file.sh - 验证单个文件的移植完整性
# 用法：./scripts/verify-file.sh <源文件> <目标文件> [是否二进制]

set -e

SRC_FILE="$1"
DST_FILE="$2"
IS_BINARY="${3:-auto}"

if [ -z "$SRC_FILE" ] || [ -z "$DST_FILE" ]; then
  echo "用法：$0 <源文件> <目标文件> [是否二进制]"
  exit 1
fi

if [ ! -f "$SRC_FILE" ]; then
  echo "✗ 源文件不存在：$SRC_FILE"
  exit 1
fi

if [ ! -f "$DST_FILE" ]; then
  echo "✗ 目标文件不存在：$DST_FILE"
  exit 1
fi

# 自动检测二进制文件
if [ "$IS_BINARY" = "auto" ]; then
  if file "$SRC_FILE" | grep -qE "binary|image|data|executable"; then
    IS_BINARY="yes"
  else
    IS_BINARY="no"
  fi
fi

# 二进制文件检查（直接比较）
if [ "$IS_BINARY" = "yes" ]; then
  if cmp -s "$SRC_FILE" "$DST_FILE"; then
    echo "✓ $DST_FILE (二进制文件一致)"
    exit 0
  else
    echo "✗ $DST_FILE (二进制文件不一致)"
    exit 1
  fi
fi

# 文本文件：检查 oh-my-codex 残留（排除预期内容）
RESIDUE=$(grep -n "oh-my-codex" "$DST_FILE" 2>/dev/null | grep -v "CHANGELOG" | grep -v "DEVELOPMENT_PLAN" | grep -v "verify-file.sh" | wc -l)
if [ "$RESIDUE" -gt 0 ]; then
  echo "✗ $DST_FILE (发现 oh-my-codex 残留)"
  grep -n "oh-my-codex" "$DST_FILE" 2>/dev/null | grep -v "CHANGELOG" | grep -v "DEVELOPMENT_PLAN" | grep -v "verify-file.sh" | head -5
  exit 1
fi

# 文本文件：检查 codex 命令残留（排除 oh-my-codex）
CODEX_REFS=$(grep -n "codex " "$DST_FILE" 2>/dev/null | grep -v "oh-my-codex" | wc -l)
if [ "$CODEX_REFS" -gt 0 ]; then
  echo "⚠ $DST_FILE (发现 codex 命令引用，可能需要适配 qwen code)"
  grep -n "codex " "$DST_FILE" 2>/dev/null | grep -v "oh-my-codex" | head -5
fi

# 内容完整性：生成内容哈希（忽略项目名称差异）
# 将源文件中的 oh-my-codex 替换为 oh-my-qwencode 后比较
if command -v md5sum &> /dev/null; then
  src_hash=$(cat "$SRC_FILE" | sed 's/oh-my-codex/oh-my-qwencode/g' | md5sum | cut -d' ' -f1)
  dst_hash=$(cat "$DST_FILE" | md5sum | cut -d' ' -f1)
elif command -v md5 &> /dev/null; then
  src_hash=$(cat "$SRC_FILE" | sed 's/oh-my-codex/oh-my-qwencode/g' | md5 | cut -d' ' -f1)
  dst_hash=$(cat "$DST_FILE" | md5 | cut -d' ' -f1)
else
  echo "⚠ $DST_FILE (无法计算哈希，跳过内容完整性检查)"
  exit 0
fi

if [ "$src_hash" = "$dst_hash" ]; then
  echo "✓ $DST_FILE (内容完整)"
else
  echo "⚠ $DST_FILE (内容可能存在差异)"
  echo "  源文件哈希 (处理后): $src_hash"
  echo "  目标文件哈希：$dst_hash"
  echo "  差异预览:"
  diff -u "$SRC_FILE" "$DST_FILE" 2>/dev/null | head -30 || true
fi

exit 0
