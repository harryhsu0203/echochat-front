# Render 環境變數設置指南

## 🔐 安全設置 API 金鑰

由於 API 金鑰包含敏感資訊，請按照以下步驟在 Render 上安全設置：

### 步驟 1：登入 Render Dashboard
1. 前往 https://dashboard.render.com
2. 登入您的帳戶

### 步驟 2：找到您的專案
1. 在 Dashboard 中找到 `echochat-backend` 專案
2. 點擊進入專案詳情頁面

### 步驟 3：設置環境變數
1. 在左側選單中點擊 **"Environment"**
2. 點擊 **"Add Environment Variable"** 按鈕
3. 逐一添加以下環境變數：

#### 必需的環境變數：

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Bot 頻道存取權杖 | `AbCdEfGhIjKlMnOpQrStUvWxYz1234567890` |
| `LINE_CHANNEL_SECRET` | LINE Bot 頻道密鑰 | `AbCdEfGhIjKlMnOpQrStUvWxYz` |
| `OPENAI_API_KEY` | OpenAI API 金鑰 | `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `JWT_SECRET` | JWT 簽名密鑰 | `your_jwt_secret_here` |

### 步驟 4：重新部署
1. 設置完環境變數後，點擊 **"Manual Deploy"**
2. 選擇 **"Deploy latest commit"**
3. 等待部署完成

### 步驟 5：驗證設置
1. 部署完成後，測試應用程式功能
2. 確認聊天功能正常運作
3. 檢查日誌是否有錯誤訊息

## ⚠️ 重要安全提醒

1. **永遠不要**將真實的 API 金鑰提交到 GitHub
2. **永遠不要**在程式碼中硬編碼 API 金鑰
3. 使用 `.env.example` 作為模板，實際值只在 Render 中設置
4. 定期更換 API 金鑰以確保安全

## 🔄 更新 API 金鑰

如果您的 API 金鑰被封鎖或需要更新：

1. 前往對應的服務商網站重新生成金鑰
2. 在 Render Dashboard 中更新環境變數
3. 重新部署應用程式

## 📞 技術支援

如果遇到問題，請檢查：
- Render 部署日誌
- 應用程式錯誤日誌
- 環境變數是否正確設置 