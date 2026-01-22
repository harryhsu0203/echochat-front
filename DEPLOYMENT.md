# EchoChat 部署到 Render

## 部署步驟

### 1. 準備工作
- 確保您的代碼已經推送到 GitHub
- 確保所有依賴都在 `package.json` 中

### 2. 在 Render 上部署

1. **登入 Render**
   - 前往 https://render.com
   - 使用 GitHub 帳號登入

2. **創建新服務**
   - 點擊 "New +"
   - 選擇 "Web Service"
   - 連接您的 GitHub 倉庫

3. **配置服務**
   - **Name**: `echochat-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **環境變數設置**
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (讓 Render 自動生成)
   - `PORT`: `10000`

5. **部署**
   - 點擊 "Create Web Service"
   - 等待部署完成

### 3. 部署後配置

1. **獲取您的應用 URL**
   - 部署完成後，Render 會提供一個 URL
   - 格式類似：`https://your-app-name.onrender.com`

2. **測試應用**
   - 訪問您的應用 URL
   - 測試登入功能 (admin/admin123)

### 4. 重要注意事項

- **資料庫**: SQLite 資料庫會在每次重啟時重置，因為 Render 的免費計劃不提供持久化存儲
- **檔案上傳**: 上傳的檔案不會持久保存
- **HTTPS**: Render 自動提供 HTTPS
- **域名**: 可以配置自定義域名
- **LINE Token**: 每個使用者的 LINE Token 會安全地儲存在個人帳號中

### 5. LINE Token 管理功能

新增的 LINE Token 管理功能包括：
- 個人化的 LINE Channel Token 設定
- 獨立的 Webhook URL 端點
- 安全的 Token 儲存機制
- 即時狀態顯示

使用步驟：
1. 在 LINE Developers Console 建立 Channel
2. 獲取 Channel Access Token 和 Channel Secret
3. 在 EchoChat 儀表板中設定 Token
4. 設定 Webhook URL
5. 測試機器人功能

### 5. 故障排除

如果部署失敗，請檢查：
- 所有依賴是否正確安裝
- 環境變數是否正確設置
- 端口是否正確配置
- 日誌中是否有錯誤信息

### 6. 本地測試

在部署前，可以在本地測試：
```bash
npm install
npm start
```

然後訪問 `http://localhost:3000` 