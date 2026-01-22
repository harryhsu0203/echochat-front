# 環境變數設定指南

## 問題說明
您遇到的 "金鑰過期" 錯誤是因為缺少 `OPENAI_API_KEY` 環境變數設定。

## 解決步驟

### 1. 創建 .env 檔案
在專案根目錄創建一個名為 `.env` 的檔案，內容如下：

```env
# OpenAI API 配置
# 請從 https://platform.openai.com/api-keys 獲取您的 API 金鑰
OPENAI_API_KEY=your_openai_api_key_here

# JWT 密鑰
JWT_SECRET=your_jwt_secret_key_here

# 電子郵件配置
EMAIL_USER=echochatsup@gmail.com
EMAIL_PASS=skoh eqrm behq twmt

# 伺服器配置
PORT=3000
NODE_ENV=development
```

### 2. 獲取 OpenAI API 金鑰

1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登入您的 OpenAI 帳戶
3. 點擊 "Create new secret key"
4. 複製生成的金鑰
5. 將金鑰貼到 `.env` 檔案中的 `OPENAI_API_KEY=` 後面

### 3. 設定 JWT 密鑰
將 `your_jwt_secret_key_here` 替換為一個隨機的字串，例如：
```
JWT_SECRET=my_super_secret_jwt_key_2024
```

### 4. 重新啟動伺服器
設定完成後，重新啟動您的伺服器：
```bash
node server.js
```

## 注意事項

- `.env` 檔案包含敏感資訊，不會被提交到 Git
- 請確保您的 OpenAI 帳戶有足夠的餘額
- 如果使用免費帳戶，請注意 API 使用限制

## 測試
設定完成後，您可以：
1. 登入系統
2. 進入 AI 聊天功能
3. 發送測試訊息

如果仍然有問題，請檢查：
- API 金鑰是否正確
- 網路連接是否正常
- OpenAI 帳戶狀態 