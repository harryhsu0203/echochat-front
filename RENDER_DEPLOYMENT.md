# EchoChat Render 部署完整指南

## 🚀 快速部署步驟

### 1. 準備工作

#### 1.1 確保程式碼已推送到 GitHub
```bash
# 檢查當前狀態
git status

# 添加所有變更
git add .

# 提交變更
git commit -m "Fix bcrypt for Render deployment"

# 推送到 GitHub
git push origin main
```

#### 1.2 修復 bcrypt 問題（重要！）
在部署到 Render 之前，需要修復 bcrypt 相容性問題：

```bash
# 安裝 bcryptjs 替代 bcrypt
npm uninstall bcrypt
npm install bcryptjs

# 更新 package.json
```

### 2. Render 部署步驟

#### 2.1 登入 Render
1. 前往 https://render.com
2. 使用 GitHub 帳號登入
3. 點擊 "New +" 按鈕

#### 2.2 創建 Web Service
1. 選擇 "Web Service"
2. 連接您的 GitHub 倉庫
3. 選擇 `kaichuan_line_bot_2` 倉庫

#### 2.3 配置服務設定

**基本設定：**
- **Name**: `echochat-backend`
- **Environment**: `Node`
- **Region**: 選擇離您最近的區域（如 Singapore）
- **Branch**: `main`

**構建設定：**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**計劃選擇：**
- **Free Plan** (適合測試)
- **Starter Plan** (適合生產環境)

#### 2.4 環境變數設定

在 "Environment" 標籤頁添加以下變數：

| 變數名稱 | 值 | 說明 |
|---------|----|------|
| `NODE_ENV` | `production` | 生產環境 |
| `JWT_SECRET` | `your-super-secret-jwt-key-here` | JWT 密鑰 |
| `PORT` | `10000` | 應用端口 |
| `GOOGLE_APPLICATION_CREDENTIALS` | `./credentials/google-vision-credentials.json` | Google Vision API 憑證 |

#### 2.5 高級設定

**健康檢查：**
- **Health Check Path**: `/`
- **Health Check Timeout**: `180`

**自動部署：**
- 啟用 "Auto-Deploy"
- 選擇 "Deploy on Push"

### 3. 部署後配置

#### 3.1 獲取應用 URL
部署完成後，您會得到類似這樣的 URL：
```
https://echochat-backend.onrender.com
```

#### 3.2 測試應用
1. 訪問您的應用 URL
2. 測試管理員登入：
   - 帳號：`admin`
   - 密碼：`admin123`

#### 3.3 設定自定義域名（可選）
1. 在 Render 控制台選擇您的服務
2. 點擊 "Settings" 標籤
3. 在 "Custom Domains" 部分添加您的域名

### 4. 解決 bcrypt 問題

#### 4.1 問題說明
Render 使用 Linux 環境，但您的專案可能包含 Windows 編譯的 bcrypt 模組，會導致 ELF header 錯誤。

#### 4.2 解決方案
在部署前執行以下步驟：

```bash
# 1. 移除 bcrypt
npm uninstall bcrypt

# 2. 安裝 bcryptjs
npm install bcryptjs

# 3. 更新所有檔案中的引用
```

#### 4.3 自動修復腳本
執行我提供的修復腳本：
```bash
node fix-bcrypt-imports.js
```

### 5. 監控和維護

#### 5.1 查看日誌
在 Render 控制台：
1. 選擇您的服務
2. 點擊 "Logs" 標籤
3. 查看實時日誌

#### 5.2 性能監控
- 在 "Metrics" 標籤查看性能指標
- 監控記憶體和 CPU 使用率
- 檢查請求響應時間

#### 5.3 自動重啟
Render 會自動處理：
- 服務崩潰重啟
- 健康檢查失敗重啟
- 記憶體超限重啟

### 6. 故障排除

#### 6.1 常見問題

**問題 1: Build 失敗**
```
Error: bcrypt_lib.node: invalid ELF header
```
**解決方案：**
```bash
# 在本地執行
npm uninstall bcrypt
npm install bcryptjs
git add .
git commit -m "Fix bcrypt for Render"
git push origin main
```

**問題 2: 端口錯誤**
```
Error: listen EADDRINUSE
```
**解決方案：**
確保使用 `process.env.PORT`：
```javascript
const port = process.env.PORT || 3000;
app.listen(port);
```

**問題 3: 環境變數未設定**
```
Error: JWT_SECRET is not defined
```
**解決方案：**
在 Render 控制台正確設定所有環境變數。

#### 6.2 日誌分析
```bash
# 在 Render 控制台查看日誌
# 常見錯誤模式：
# - "bcrypt" 相關錯誤 → 需要修復 bcrypt
# - "EADDRINUSE" → 端口衝突
# - "ENOENT" → 檔案不存在
# - "ECONNREFUSED" → 資料庫連線問題
```

### 7. 最佳實踐

#### 7.1 安全性
- 使用強密碼的 JWT_SECRET
- 定期更新依賴
- 啟用 HTTPS（Render 自動提供）

#### 7.2 性能優化
- 使用 PM2 進行進程管理
- 設定適當的記憶體限制
- 啟用快取機制

#### 7.3 備份策略
- 定期備份資料庫
- 使用 Git 版本控制
- 設定自動備份

### 8. 升級到付費計劃

當您的應用需要更多資源時：

#### 8.1 Starter Plan ($7/月)
- 512MB RAM
- 共享 CPU
- 持久化存儲
- 自定義域名

#### 8.2 Pro Plan ($25/月)
- 1GB RAM
- 專用 CPU
- 更多存儲空間
- 優先支援

### 9. 本地測試

部署前在本地測試：
```bash
# 安裝依賴
npm install

# 設定環境變數
export NODE_ENV=production
export JWT_SECRET=test-secret
export PORT=3000

# 啟動應用
npm start

# 測試訪問
curl http://localhost:3000
```

### 10. 部署檢查清單

- [ ] 程式碼已推送到 GitHub
- [ ] bcrypt 已替換為 bcryptjs
- [ ] 所有檔案引用已更新
- [ ] 環境變數已設定
- [ ] 本地測試通過
- [ ] Render 服務已創建
- [ ] 部署成功
- [ ] 應用可以正常訪問
- [ ] 登入功能正常
- [ ] 檔案上傳功能正常

---

**注意**: Render 免費計劃有休眠機制，首次訪問可能需要 30 秒啟動時間。 