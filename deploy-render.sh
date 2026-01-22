#!/bin/bash

echo "🚀 部署到 Render..."

# 確保在正確的目錄
cd /opt/render/project/src

# 安裝依賴
npm install

# 創建必要的目錄
mkdir -p data
mkdir -p uploads

# 設置權限
chmod 755 data
chmod 755 uploads

# 啟動應用
npm start

echo "✅ 部署完成！"