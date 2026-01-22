#!/bin/bash

echo "🚀 開始部署雙專案到 Render..."
echo "=================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數：顯示帶顏色的訊息
print_message() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

# 檢查 Git 狀態
check_git_status() {
    print_info "檢查 Git 狀態..."
    
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "發現未提交的更改"
        git status --short
        return 1
    else
        print_message "✅ Git 工作目錄乾淨"
        return 0
    fi
}

# 部署後端專案
deploy_backend() {
    print_info "📦 部署後端專案 (echochat-api)..."
    
    # 檢查是否在正確的目錄
    if [ ! -f "echochat-api/server.js" ]; then
        print_error "❌ 找不到後端專案目錄 echochat-api/"
        return 1
    fi
    
    cd echochat-api
    
    # 檢查 Git 狀態
    if ! check_git_status; then
        print_warning "⚠️ 後端專案有未提交的更改"
        read -p "是否繼續部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "❌ 部署已取消"
            cd ..
            return 1
        fi
    fi
    
    # 添加所有更改
    print_info "添加更改到 Git..."
    git add .
    
    # 提交更改
    print_info "提交更改..."
    git commit -m "更新後端 API：帳號管理功能和健康檢查端點"
    
    # 推送到遠程倉庫
    print_info "推送到遠程倉庫..."
    if git push origin main; then
        print_message "✅ 後端專案部署成功！"
        print_info "🌐 後端 URL: https://echochat-api.onrender.com"
        print_info "🔍 健康檢查: https://echochat-api.onrender.com/api/health"
    else
        print_error "❌ 後端專案部署失敗"
        cd ..
        return 1
    fi
    
    cd ..
}

# 部署前端專案
deploy_frontend() {
    print_info "📦 部署前端專案 (主目錄)..."
    
    # 檢查是否在正確的目錄
    if [ ! -f "server.js" ] || [ ! -d "public" ]; then
        print_error "❌ 找不到前端專案文件"
        return 1
    fi
    
    # 檢查 Git 狀態
    if ! check_git_status; then
        print_warning "⚠️ 前端專案有未提交的更改"
        read -p "是否繼續部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "❌ 部署已取消"
            return 1
        fi
    fi
    
    # 添加所有更改
    print_info "添加更改到 Git..."
    git add .
    
    # 提交更改
    print_info "提交更改..."
    git commit -m "更新前端配置：修復 API 連接和帳號管理功能"
    
    # 推送到遠程倉庫
    print_info "推送到遠程倉庫..."
    if git push origin main; then
        print_message "✅ 前端專案部署成功！"
        print_info "🌐 前端 URL: https://echochat-backend.onrender.com"
    else
        print_error "❌ 前端專案部署失敗"
        return 1
    fi
}

# 測試部署
test_deployment() {
    print_info "🧪 測試部署..."
    
    # 等待部署完成
    print_info "等待部署完成 (30秒)..."
    sleep 30
    
    # 測試後端 API
    print_info "測試後端 API..."
    if curl -s https://echochat-api.onrender.com/api/health > /dev/null; then
        print_message "✅ 後端 API 正常"
    else
        print_warning "⚠️ 後端 API 可能還在部署中"
    fi
    
    # 測試前端
    print_info "測試前端..."
    if curl -s https://echochat-backend.onrender.com > /dev/null; then
        print_message "✅ 前端正常"
    else
        print_warning "⚠️ 前端可能還在部署中"
    fi
}

# 顯示部署資訊
show_deployment_info() {
    echo
    print_info "📋 部署資訊："
    echo "=================================="
    print_info "後端專案："
    echo "  - 目錄: echochat-api/"
    echo "  - Render 服務: echochat-api"
    echo "  - URL: https://echochat-api.onrender.com"
    echo "  - 健康檢查: https://echochat-api.onrender.com/api/health"
    echo
    print_info "前端專案："
    echo "  - 目錄: ./ (主目錄)"
    echo "  - Render 服務: echochat-backend"
    echo "  - URL: https://echochat-backend.onrender.com"
    echo
    print_info "測試帳號："
    echo "  - 管理員: admin / admin123"
    echo "  - 系統管理員: sunnyharry1 / sunnyharry1"
    echo "  - 一般用戶: user / user123"
    echo
}

# 主函數
main() {
    echo "🚀 EchoChat 雙專案部署工具"
    echo "=================================="
    
    # 顯示部署資訊
    show_deployment_info
    
    # 確認部署
    read -p "是否開始部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "❌ 部署已取消"
        exit 1
    fi
    
    # 部署後端
    if deploy_backend; then
        print_message "✅ 後端部署完成"
    else
        print_error "❌ 後端部署失敗"
        exit 1
    fi
    
    # 等待一下
    sleep 5
    
    # 部署前端
    if deploy_frontend; then
        print_message "✅ 前端部署完成"
    else
        print_error "❌ 前端部署失敗"
        exit 1
    fi
    
    # 測試部署
    test_deployment
    
    echo
    print_message "🎉 部署完成！"
    echo "=================================="
    print_info "請在 Render 控制台檢查部署狀態："
    echo "  - 後端: https://dashboard.render.com/web/echochat-api"
    echo "  - 前端: https://dashboard.render.com/web/echochat-backend"
    echo
    print_info "測試網站："
    echo "  - 前端: https://echochat-backend.onrender.com"
    echo "  - 後端 API: https://echochat-api.onrender.com/api/health"
}

# 執行主函數
main "$@" 