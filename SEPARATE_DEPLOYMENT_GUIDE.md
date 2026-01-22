# EchoChat 分離部署指南

## 問題描述
您遇到的身份驗證問題是因為前端和後端部署在同一個服務上，導致API調用路徑不正確。我們需要將前端和後端分別部署到不同的Render服務。

## 修復內容

### 1. API 配置修復
- ✅ 更新 `public/js/api-config.js` 中的後端URL
- ✅ 修復 token 存儲邏輯，確保兼容性
- ✅ 改善錯誤處理機制

### 2. 後端 CORS 設定修復
- ✅ 更新 `server.js` 中的 CORS 配置
- ✅ 添加前端域名到允許列表

### 3. 前端驗證邏輯修復
- ✅ 修復 `public/dashboard.html` 中的身份驗證檢查
- ✅ 使用正確的API URL進行驗證
- ✅ 改善錯誤處理和離線模式

### 4. 登入流程優化
- ✅ 延長登入成功後的跳轉時間
- ✅ 改善用戶資訊存儲邏輯

## 部署步驟

### 第一步：創建 Render 服務

#### 後端服務 (echochat-backend)
1. 登入 Render 控制台
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub 倉庫
4. 服務名稱：`echochat-backend`
5. 環境：`Node`
6. 構建命令：`npm install`
7. 啟動命令：`npm start`
8. 點擊 "Create Web Service"

#### 前端服務 (echochat-frontend)
1. 在 Render 控制台點擊 "New +" → "Static Site"
2. 連接您的 GitHub 倉庫
3. 服務名稱：`echochat-frontend`
4. 構建命令：`echo "Frontend build completed"`
5. 發布目錄：`public`
6. 點擊 "Create Static Site"

### 第二步：配置環境變數

#### 後端環境變數
在 `echochat-backend` 服務的 "Environment" 標籤中添加：

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

#### 前端環境變數
前端服務不需要額外的環境變數。

### 第三步：配置部署檔案

#### 後端配置 (render.yaml)
```yaml
services:
  - type: web
    name: echochat-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000
      - key: DATA_DIR
        value: /opt/render/project/src/data
      - key: LINE_CHANNEL_ACCESS_TOKEN
        sync: false
      - key: LINE_CHANNEL_SECRET
        sync: false
      - key: OPENAI_API_KEY
        sync: false
    healthCheckPath: /
    autoDeploy: true
    disk:
      name: data
      mountPath: /opt/render/project/src/data
      sizeGB: 1
```

#### 前端配置 (render-frontend.yaml)
```yaml
services:
  - type: web
    name: echochat-frontend
    env: static
    plan: free
    buildCommand: echo "Frontend build completed"
    startCommand: echo "Frontend started"
    staticPublishPath: ./public
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /
    autoDeploy: true
    routes:
      - type: rewrite
        source: /(.*)
        destination: /index.html
```

### 第四步：部署

#### 後端部署
1. 確保 `render.yaml` 在倉庫根目錄
2. 在 Render 控制台連接到 GitHub 倉庫
3. 選擇 `render.yaml` 作為部署配置
4. 點擊 "Create New Instance"

#### 前端部署
1. 確保 `render-frontend.yaml` 在倉庫根目錄
2. 在 Render 控制台連接到 GitHub 倉庫
3. 選擇 `render-frontend.yaml` 作為部署配置
4. 點擊 "Create New Instance"

## 驗證部署

### 1. 檢查服務狀態
- 後端：https://echochat-backend.onrender.com
- 前端：https://echochat-frontend.onrender.com

### 2. 測試 API 連接
```bash
curl https://echochat-backend.onrender.com/api/health
```

### 3. 測試登入流程
1. 訪問：https://echochat-frontend.onrender.com/login.html
2. 使用管理員帳號登入
3. 確認成功跳轉到儀表板

### 4. 運行測試腳本
```bash
node test-auth-fix.js
```

## 常見問題解決

### 問題 1：CORS 錯誤
**解決方案：**
- 確認後端 CORS 設定包含前端域名
- 檢查環境變數是否正確設置

### 問題 2：API 連接失敗
**解決方案：**
- 確認後端服務正在運行
- 檢查 API URL 配置是否正確
- 驗證網路連接

### 問題 3：Token 驗證失敗
**解決方案：**
- 確認 JWT_SECRET 環境變數設置正確
- 檢查 token 存儲邏輯
- 驗證時間同步

### 問題 4：登入後立即跳轉回登入頁
**解決方案：**
- 確認 API URL 配置正確
- 檢查身份驗證檢查邏輯
- 驗證 CORS 設定

## 監控和維護

### 1. 日誌監控
- 在 Render 控制台查看服務日誌
- 監控錯誤率和響應時間

### 2. 性能優化
- 定期檢查服務性能
- 優化資料庫查詢
- 實施快取策略

### 3. 安全維護
- 定期更新依賴套件
- 監控安全漏洞
- 備份重要資料

## 聯繫支援

如果遇到部署問題，請：
1. 檢查 Render 服務狀態
2. 查看服務日誌
3. 運行測試腳本
4. 聯繫技術支援

---

**部署完成後，您的 EchoChat 系統將具有：**
- ✅ 穩定的身份驗證系統
- ✅ 分離的前後端架構
- ✅ 更好的可擴展性
- ✅ 更強的可靠性 