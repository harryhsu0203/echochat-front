#!/bin/bash

# EchoChat 前端部署腳本

echo "🚀 EchoChat 前端部署腳本"
echo "=========================="

# 檢查是否在正確的目錄
if [ ! -f "public/index.html" ]; then
    echo "❌ 錯誤：請在 EchoChat 專案根目錄中執行此腳本"
    exit 1
fi

# 檢查 Git 是否已初始化
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 倉庫..."
    git init
    git add .
    git commit -m "Initial commit: EchoChat Frontend"
    echo "✅ Git 倉庫已初始化"
else
    echo "📝 更新 Git 倉庫..."
    git add .
    git commit -m "Update: $(date)"
    echo "✅ Git 倉庫已更新"
fi

# 檢查是否有遠端倉庫
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 請設定 GitHub 遠端倉庫："
    echo "git remote add origin https://github.com/your-username/echochat-frontend.git"
    echo "git push -u origin main"
else
    echo "📤 推送到 GitHub..."
    git push origin main
    echo "✅ 已推送到 GitHub"
fi

echo ""
echo "🎯 下一步："
echo "1. 前往 https://vercel.com"
echo "2. 使用 GitHub 帳號登入"
echo "3. 點擊 'New Project'"
echo "4. 選擇您的 GitHub 倉庫"
echo "5. 設定專案名稱：echochat-frontend"
echo "6. 點擊 'Deploy'"
echo ""
echo "📋 部署完成後，您會得到一個 Vercel URL"
echo "例如：https://echochat-frontend.vercel.app" 