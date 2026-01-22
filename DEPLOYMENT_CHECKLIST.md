# EchoChat 部署檢查清單

## 🚀 部署狀態

### 後端 API (echochat-api)
- **GitHub 倉庫**: https://github.com/harryhsu0203/echochat_back.git
- **Render 服務**: echochat-api
- **URL**: https://echochat-api.onrender.com
- **狀態**: ✅ 正常運行

### 前端網站
- **GitHub 倉庫**: https://github.com/IAN1215/AI-CHATBOT.git
- **Render 服務**: ai-chatbot-umqm
- **URL**: https://ai-chatbot-umqm.onrender.com
- **狀態**: ✅ 正常運行

## 🔗 正確的 URL

### LINE Webhook URL
```
https://echochat-api.onrender.com/api/webhook/line-simple
```

### 測試端點
- **健康檢查**: https://echochat-api.onrender.com/api/health
- **Webhook 測試**: https://echochat-api.onrender.com/api/webhook/line-simple

## 📋 部署檢查步驟

### 1. 檢查 Render Dashboard
前往 https://dashboard.render.com 確認：

#### 後端 API 服務 (echochat-api)
- [ ] 服務狀態為 "Live"
- [ ] 最後部署時間是最新的
- [ ] 沒有錯誤日誌
- [ ] 健康檢查通過

#### 前端服務 (ai-chatbot-umqm)
- [ ] 服務狀態為 "Live"
- [ ] 最後部署時間是最新的
- [ ] 沒有錯誤日誌

### 2. 測試 API 端點
```bash
# 健康檢查
curl https://echochat-api.onrender.com/api/health

# Webhook 測試
curl -X POST https://echochat-api.onrender.com/api/webhook/line-simple \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"type":"text","text":"test"}}]}'
```

### 3. LINE Developers Console 設定
在 https://developers.line.biz/ 中：

#### Webhook URL 設定
- [ ] URL: `https://echochat-api.onrender.com/api/webhook/line-simple`
- [ ] 開啟 "Use webhook"
- [ ] 點擊 "Update"
- [ ] 點擊 "Verify" 測試

#### 預期結果
- [ ] Verify 按鈕顯示綠色勾號
- [ ] 沒有錯誤訊息
- [ ] Webhook 狀態為 "Enabled"

### 4. 測試 LINE 機器人
- [ ] 掃描 QR Code
- [ ] 發送測試訊息
- [ ] 確認機器人有回應

## 🛠️ 故障排除

### 如果 Webhook 驗證失敗
1. 檢查 URL 是否正確
2. 確認後端 API 正常運行
3. 檢查 Render 服務狀態
4. 查看 Render 日誌

### 如果機器人沒有回應
1. 確認 Webhook URL 設定正確
2. 檢查 LINE Channel 設定
3. 確認 Channel Access Token 正確
4. 查看後端 API 日誌

## 📞 支援資訊

- **GitHub 後端**: https://github.com/harryhsu0203/echochat_back.git
- **GitHub 前端**: https://github.com/IAN1215/AI-CHATBOT.git
- **Render Dashboard**: https://dashboard.render.com
- **LINE Developers**: https://developers.line.biz/

## ✅ 部署完成確認

- [ ] 後端 API 正常運行
- [ ] 前端網站正常運行
- [ ] LINE Webhook 設定正確
- [ ] 機器人測試成功
- [ ] 所有功能正常運作 