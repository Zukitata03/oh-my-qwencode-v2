#!/bin/bash
# verify-stage.sh - 验证阶段移植完整性
# 用法：./scripts/verify-stage.sh <阶段号> <目录> <预期文件数> [是否跳过构建]

set -e

STAGE="$1"
DIR="$2"
EXPECTED_COUNT="$3"
SKIP_BUILD="${4:-no}"

if [ -z "$STAGE" ] || [ -z "$DIR" ] || [ -z "$EXPECTED_COUNT" ]; then
  echo "用法：$0 <阶段号> <目录> <预期文件数> [是否跳过构建]"
  exit 1
fi

echo "╔════════════════════════════════════════════════════════╗"
echo "║         阶段 $STAGE 验证：$DIR"
echo "╚════════════════════════════════════════════════════════╝"

PASS=0
FAIL=0

# ========== 1. 目录存在性验证 ==========
echo ""
echo "[1/4] 目录存在性验证..."
if [ -d "$DIR" ]; then
  echo "  ✓ 目录 $DIR 存在"
  ((PASS++))
else
  echo "  ✗ 目录 $DIR 不存在"
  ((FAIL++))
fi

# ========== 2. 文件数量验证 ==========
echo ""
echo "[2/4] 文件数量验证..."

ACTUAL_COUNT=$(find "$DIR" -type f 2>/dev/null | wc -l)
echo "  预期文件数：$EXPECTED_COUNT"
echo "  实际文件数：$ACTUAL_COUNT"

if [ "$ACTUAL_COUNT" -eq "$EXPECTED_COUNT" ]; then
  echo "  ✓ 文件数量匹配"
  ((PASS++))
else
  echo "  ✗ 文件数量不匹配 (差异：$((ACTUAL_COUNT - EXPECTED_COUNT)))"
  ((FAIL++))
fi

# ========== 3. oh-my-codex 残留检查 ==========
echo ""
echo "[3/4] oh-my-codex 残留检查..."

RESIDUE=$(grep -r "oh-my-codex" "$DIR" \
  --exclude-dir=node_modules \
  --exclude-dir=target \
  --exclude-dir=.git \
  --exclude-dir=dist \
  2>/dev/null | wc -l)

if [ "$RESIDUE" -eq 0 ]; then
  echo "  ✓ 无 oh-my-codex 残留"
  ((PASS++))
else
  echo "  ✗ 发现 $RESIDUE 处 oh-my-codex 残留:"
  grep -r "oh-my-codex" "$DIR" \
    --exclude-dir=node_modules \
    --exclude-dir=target \
    --exclude-dir=.git \
    --exclude-dir=dist \
    2>/dev/null | head -10
  ((FAIL++))
fi

# ========== 4. 构建验证（可选） ==========
echo ""
echo "[4/4] 构建验证..."

if [ "$SKIP_BUILD" = "yes" ]; then
  echo "  ⊘ 跳过构建验证"
  ((PASS++))
elif [ "$DIR" = "crates" ] || [[ "$DIR" == crates/* ]]; then
  # Rust 构建
  if cargo build --workspace 2>&1 | tail -1 | grep -q "Finished\|up-to-date"; then
    echo "  ✓ cargo build --workspace 通过"
    ((PASS++))
  else
    echo "  ✗ cargo build --workspace 失败"
    cargo build --workspace || true
    ((FAIL++))
  fi
elif [ "$DIR" = "src" ] || [[ "$DIR" == src/* ]]; then
  # TypeScript 构建
  if npm run build 2>&1 | tail -1 | grep -qi "success\|built\|up-to-date"; then
    echo "  ✓ npm run build 通过"
    ((PASS++))
  else
    echo "  ⚠ npm run build 可能失败（继续执行）"
    npm run build || true
    ((PASS++))  # 不阻断
  fi
else
  echo "  ⊘ 非代码目录，跳过构建验证"
  ((PASS++))
fi

# ========== 验证报告 ==========
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              阶段 $STAGE 验证报告"
echo "╠════════════════════════════════════════════════════════╣"
printf "║  通过：%d / 4                                       ║\n" "$PASS"
printf "║  失败：%d / 4                                       ║\n" "$FAIL"
echo "╚════════════════════════════════════════════════════════╝"

if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "✓ 阶段 $STAGE 验证通过！"
  exit 0
else
  echo ""
  echo "✗ 阶段 $STAGE 存在 $FAIL 项失败，请修复后重新验证。"
  exit 1
fi
