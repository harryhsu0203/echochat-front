# 🔧 AI 聊天 API 修復指南

## 📋 問題描述

您遇到的 500 錯誤是因為 Render 部署上缺少 OpenAI API Key 環境變數。當聊天端點嘗試調用 OpenAI API 時，由於沒有配置 API Key，導致請求失敗。

### 錯誤訊息：
```
Failed to load resource: the server responded with a status of 500 ()
echochat-api.onrender.com/api/chat:1
```

## 🛠️ 已實施的修復

### 1. **改進錯誤處理** (`echochat-api/server.js`)
   - ✅ 添加了 OpenAI API Key 檢查
   - ✅ 提供更詳細的錯誤訊息
   - ✅ 包含解決方案建議
   - ✅ 記錄詳細的錯誤日誌

### 2. **創建環境變數更新工具** (`update-render-env-openai.js`)
   - ✅ 安全地更新 Render 環境變數
   - ✅ 驗證 API Key 格式
   - ✅ 提供清晰的操作指引

### 3. **創建部署腳本** (`deploy-chat-fix-to-render.js`)
   - ✅ 自動提交和推送更改
   - ✅ 觸發 Render 重新部署

## 🚀 解決步驟

### 步驟 1：部署修復代碼
```bash
# 運行部署腳本
node deploy-chat-fix-to-render.js
```

### 步驟 2：獲取 Render API Key
1. 登入 [Render Dashboard](https://render.com)
2. 點擊右上角頭像 → **Account Settings**
3. 點擊 **API Keys**
4. 創建新的 API Key 或複製現有的

### 步驟 3：獲取 OpenAI API Key
1. 登入 [OpenAI Platform](https://platform.openai.com)
2. 前往 **API Keys** 頁面
3. 創建新的 API Key（以 `sk-` 開頭）

### 步驟 4：設置環境變數
```bash
# 設置 Render API Key
export RENDER_API_KEY="your-render-api-key"

# 運行更新腳本
node update-render-env-openai.js

# 腳本會提示您輸入 OpenAI API Key
```

### 步驟 5：驗證修復
等待 Render 重新部署完成（約 2-3 分鐘），然後：

1. **檢查健康狀態**
   ```
   https://echochat-api.onrender.com/api/health
   ```

2. **測試聊天功能**
   - 訪問您的前端應用
   - 嘗試發送聊天訊息
   - 應該能收到 AI 回應

## 📊 錯誤訊息說明

### 未設置 API Key 時：
```json
{
  "success": false,
  "error": "AI 服務尚未配置，請聯繫管理員設置 OpenAI API Key",
  "details": "OPENAI_API_KEY 環境變數未設置"
}
```

### API Key 無效時：
```json
{
  "success": false,
  "error": "OpenAI API 金鑰無效或已過期",
  "details": "請檢查 OPENAI_API_KEY 環境變數是否正確",
  "solution": "請運行 node update-render-env-openai.js 更新 API Key"
}
```

### API 使用限制：
```json
{
  "success": false,
  "error": "OpenAI API 請求頻率過高",
  "details": "已達到 API 使用限制",
  "solution": "請稍後再試或升級 OpenAI 計劃"
}
```

## 🔍 故障排除

### 問題 1：部署腳本執行失敗
**解決方案**：手動執行 Git 命令
```bash
git add .
git commit -m "Fix: AI chat error handling"
git push origin main
```

### 問題 2：環境變數更新失敗
**可能原因**：
- Render API Key 無效
- 網路連接問題
- 服務 ID 不正確

**解決方案**：
1. 確認 Render API Key 正確
2. 檢查網路連接
3. 在 Render Dashboard 手動設置環境變數

### 問題 3：設置後仍然失敗
**檢查清單**：
- [ ] OpenAI API Key 是否以 `sk-` 開頭？
- [ ] OpenAI 帳戶是否有餘額？
- [ ] API Key 是否有正確的權限？
- [ ] Render 是否已完成重新部署？

## 📝 環境變數列表

| 變數名稱 | 說明 | 必需 | 範例值 |
|---------|------|------|-------|
| `OPENAI_API_KEY` | OpenAI API 金鑰 | ✅ | `sk-...` |
| `JWT_SECRET` | JWT 簽名密鑰 | ✅ | 隨機字串 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE 機器人令牌 | ❌ | LINE 提供 |
| `LINE_CHANNEL_SECRET` | LINE 機器人密鑰 | ❌ | LINE 提供 |
| `EMAIL_USER` | 郵件發送帳號 | ❌ | email@gmail.com |
| `EMAIL_PASS` | 郵件應用密碼 | ❌ | 應用程式密碼 |

## 🎯 預期結果

成功設置後，您應該能夠：
1. ✅ 在前端應用中使用 AI 聊天功能
2. ✅ 收到來自配置的 AI 模型的回應
3. ✅ 查看對話歷史記錄
4. ✅ 使用知識庫功能

## 💡 其他建議

1. **安全性**：
   - 定期更換 API Keys
   - 使用環境變數而非硬編碼
   - 限制 API Key 的權限範圍

2. **監控**：
   - 定期檢查 API 使用量
   - 設置使用量警報
   - 監控錯誤日誌

3. **優化**：
   - 考慮實施快取機制
   - 使用更經濟的模型（如 gpt-3.5-turbo）
   - 實施請求限流

## 📞 需要幫助？

如果問題持續存在，請：
1. 檢查 Render 的部署日誌
2. 查看伺服器錯誤日誌
3. 確認所有環境變數正確設置
4. 聯繫技術支援

---

*最後更新：2024年*