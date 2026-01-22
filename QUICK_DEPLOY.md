# 🚀 EchoChat 快速部署指南

## 當前狀態
✅ 代碼已推送到 GitHub  
✅ 身份驗證問題已修復  
✅ 分離部署配置已準備完成  

## 立即部署步驟

### 第一步：登入 Render
1. 前往 https://dashboard.render.com
2. 使用您的 GitHub 帳號登入

### 第二步：創建後端服務
1. 點擊 "New +" → "Web Service"
2. 連接您的 GitHub 倉庫：`IAN1215/AI-CHATBOT`
3. 設定服務：
   - **Name**: `echochat-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. 點擊 "Create Web Service"

### 第三步：設置後端環境變數
在後端服務的 "Environment" 標籤中添加：
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
PORT=10000
DATA_DIR=/opt/render/project/src/data
LINE_CHANNEL_ACCESS_TOKEN=your-line-token
LINE_CHANNEL_SECRET=your-line-secret
OPENAI_API_KEY=your-openai-key
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
```

### 第四步：創建前端服務
1. 點擊 "New +" → "Static Site"
2. 連接您的 GitHub 倉庫：`IAN1215/AI-CHATBOT`
3. 設定服務：
   - **Name**: `echochat-frontend`
   - **Build Command**: `echo "Frontend build completed"`
   - **Publish Directory**: `public`
   - **Plan**: `Free`
4. 點擊 "Create Static Site"

### 第五步：等待部署完成
- 後端部署時間：約 5-10 分鐘
- 前端部署時間：約 2-3 分鐘

## 部署完成後的 URL

### 後端服務
- **URL**: https://echochat-api.onrender.com
- **健康檢查**: https://echochat-api.onrender.com/api/health

### 前端服務
- **首頁**: https://echochat-frontend.onrender.com
- **登入頁面**: https://echochat-frontend.onrender.com/login.html
- **儀表板**: https://echochat-frontend.onrender.com/dashboard.html

## 測試部署

### 1. 測試後端連接
```bash
curl https://echochat-api.onrender.com/api/health
```

### 2. 測試登入功能
1. 訪問：https://echochat-frontend.onrender.com/login.html
2. 使用管理員帳號登入：
   - 用戶名：`admin`
   - 密碼：`admin123`

### 3. 運行本地測試
```bash
node test-auth-fix.js
```

## 常見問題解決

### 問題 1：後端部署失敗
**解決方案：**
- 檢查環境變數是否正確設置
- 確認 JWT_SECRET 已設置
- 查看 Render 日誌

### 問題 2：前端無法連接後端
**解決方案：**
- 確認後端服務正在運行
- 檢查 API URL 配置
- 驗證 CORS 設定

### 問題 3：登入後立即跳轉回登入頁
**解決方案：**
- 確認 API URL 配置正確
- 檢查身份驗證檢查邏輯
- 驗證 CORS 設定

## 監控和維護

### 1. 查看服務狀態
- 在 Render 控制台查看服務狀態
- 監控錯誤率和響應時間

### 2. 查看日誌
- 在 Render 控制台查看服務日誌
- 監控應用程式錯誤

### 3. 更新部署
- 推送新代碼到 GitHub
- Render 會自動重新部署

## 聯繫支援

如果遇到部署問題：
1. 檢查 Render 服務狀態
2. 查看服務日誌
3. 運行測試腳本
4. 聯繫技術支援

---

**🎉 部署完成後，您的 EchoChat 系統將具有：**
- ✅ 穩定的身份驗證系統
- ✅ 分離的前後端架構
- ✅ 更好的可擴展性
- ✅ 更強的可靠性 