#!/usr/bin/env bash
# SOP-3E-02: Vercel CLI 部署脚本
#
# 依据 MASTER_SOP §五 Phase 3e + 附录 G.4。
#
# ⚠️ 已知偏离（已记录）：MASTER_SOP 原要求 `vercel build --prod` + `vercel deploy --prebuilt --prod`，
# 但 Next.js 16 的 ISR 动态路由（/templates/[slug]）与 `--prebuilt` 打包不兼容（实测报
# "Unable to find lambda for route"）。故本脚本采用云端构建模式 `vercel deploy --prod`，
# 功能等价，由 Vercel 云端完成 build + deploy。
#
# 🔒 安全铁律：
#   - Vercel token 从 action/func_api/vercel/vercel_test.txt 读取，设为 VERCEL_TOKEN 环境变量
#   - 禁止命令行明文传 --token（CVE-2026-44479，CLI 自动读 VERCEL_TOKEN）
#   - 所有交互命令带 --yes 防挂起
#
# 用法：在 workspace 根目录执行 `pnpm deploy`（即 bash scripts/deploy.sh）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
# vercel_test.txt 相对路径：workspace -> roblox_gui -> projsys -> ... -> action/func_api/vercel/
TOKEN_FILE="$WORKSPACE_DIR/../../../action/func_api/vercel/vercel_test.txt"

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "❌ 未找到 Vercel token 文件: $TOKEN_FILE"
  exit 1
fi

export VERCEL_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
if [[ -z "$VERCEL_TOKEN" ]]; then
  echo "❌ VERCEL_TOKEN 为空"
  exit 1
fi

echo "→ VERCEL_TOKEN 已从文件加载（未明文传入命令行）"

# 确认 CLI 已链接项目
if [[ ! -f "$WORKSPACE_DIR/.vercel/project.json" ]]; then
  echo "❌ 未链接 Vercel 项目（缺 .vercel/project.json），请先运行 vercel link --yes"
  exit 1
fi

echo "→ 拉取生产环境配置..."
vercel pull --yes --environment=production

echo "→ 云端构建 + 部署到生产（Next 16 ISR 模式）..."
DEPLOY_URL=$(vercel deploy --prod --yes 2>&1 | grep -oE 'https://[a-z0-9.-]+\.vercel\.app' | head -1)

if [[ -z "$DEPLOY_URL" ]]; then
  echo "⚠️  未能解析部署 URL，请查看上方输出"
  exit 0
fi

echo ""
echo "✅ 部署成功: $DEPLOY_URL"
echo "→ 自定义域名 roblox-gui-maker.online 将自动绑定（若已配置）"
