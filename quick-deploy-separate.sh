#!/bin/bash

echo "🚀 EchoChat 分離部署腳本"
echo "=========================="

# 檢查必要檔案
echo "📋 檢查必要檔案..."

required_files=(
    "server.js"
    "package.json"
    "public/index.html"
    "render.yaml"
    "render-frontend.yaml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ 缺少檔案: $file"
        exit 1
    fi
done

echo ""
echo "🔧 部署準備完成！"
echo ""
echo "📋 下一步操作："
echo "1. 登入 Render 控制台"
echo "2. 創建 echochat-backend 服務："
echo "   - 類型：Web Service"
echo "   - 環境：Node"
echo "   - 構建命令：npm install"
echo "   - 啟動命令：npm start"
echo ""
echo "3. 創建 echochat-frontend 服務："
echo "   - 類型：Static Site"
echo "   - 構建命令：echo 'Frontend build completed'"
echo "   - 發布目錄：public"
echo ""
echo "4. 設置環境變數："
echo "   NODE_ENV=production"
echo "   JWT_SECRET=your-secret-key"
echo "   PORT=10000"
echo "   DATA_DIR=/opt/render/project/src/data"
echo ""
echo "🌐 部署完成後的 URL："
echo "- 後端：https://echochat-backend.onrender.com"
echo "- 前端：https://echochat-frontend.onrender.com"
echo "- 登入頁面：https://echochat-frontend.onrender.com/login.html"
echo "- 儀表板：https://echochat-frontend.onrender.com/dashboard.html"
echo ""
echo "🧪 部署完成後運行測試："
echo "node test-auth-fix.js"
echo ""
echo "🎉 準備就緒！開始部署吧！" 