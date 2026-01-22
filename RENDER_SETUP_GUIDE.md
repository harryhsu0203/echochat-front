# Render 部署設定指南

## 🔧 後端API專案設定

### 1. 環境變數設定

在您的 Render 後端專案 (`echochat-api`) 中，請設定以下環境變數：

```
NODE_ENV=production
JWT_SECRET=your-secret-key-here (或讓Render自動生成)
PORT=10000
DATA_DIR=/opt/render/project/src/data
```

### 2. 重新部署

1. 在 Render 控制台中，進入您的 `echochat-api` 專案
2. 點擊 "Manual Deploy" → "Deploy latest commit"
3. 等待部署完成

### 3. 驗證部署

部署完成後，訪問以下URL確認：
- 健康檢查: https://echochat-api.onrender.com/api/health
- 根路徑: https://echochat-api.onrender.com/

## 🔧 前端專案設定

### 1. 確認API URL

確保您的前端專案正確指向後端API：
- 開發環境: `http://localhost:3000/api`
- 生產環境: `https://echochat-api.onrender.com/api`

### 2. 測試登入

使用以下帳號測試：
- 用戶名: `sunnyharry1`
- 密碼: `gele1227`

## 🚨 常見問題

### 問題1：登入失敗
**解決方案：**
1. 確認後端API已重新部署
2. 檢查環境變數設定
3. 等待幾分鐘讓資料庫初始化完成

### 問題2：CORS錯誤
**解決方案：**
1. 確認前端URL已添加到CORS允許清單
2. 檢查瀏覽器控制台錯誤訊息

### 問題3：API連接失敗
**解決方案：**
1. 確認API URL正確
2. 檢查網路連接
3. 確認Render專案正在運行

## 📞 支援

如果問題持續存在，請：
1. 檢查 Render 部署日誌
2. 確認所有環境變數已設定
3. 重新部署專案 