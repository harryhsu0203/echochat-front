# LINE Token 管理功能使用指南

## 功能概述

EchoChat 現在支援個人化的 LINE Channel Token 管理功能，讓每個使用者可以：
- 設定自己的 LINE Channel Token
- 管理個人的 LINE 機器人
- 確保 Token 安全性，其他使用者無法看到您的設定

## 功能特點

### 🔒 安全性
- 每個使用者的 Token 都獨立儲存
- 其他使用者無法看到您的 LINE Token 設定
- Token 以加密方式儲存在個人帳號中

### 🎯 個人化
- 每個使用者可以設定自己的 LINE Channel
- 獨立的 Webhook URL 端點
- 個人化的 LINE 機器人回應

### 🔧 易於管理
- 直觀的網頁介面
- 即時狀態顯示
- 一鍵複製 Webhook URL

## 使用步驟

### 1. 獲取 LINE Channel Token

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 登入您的 LINE 帳號
3. 建立新的 Provider 或選擇現有的 Provider
4. 建立新的 Channel (Messaging API)
5. 在 Channel 設定中複製以下資訊：
   - Channel Access Token
   - Channel Secret

### 2. 設定 LINE Token

1. 登入 EchoChat 系統
2. 前往儀表板 (Dashboard)
3. 點擊「頻道」標籤
4. 找到 LINE 卡片，點擊「管理 Token」
5. 在 LINE Token 管理頁面中：
   - 輸入您的 Channel Access Token
   - 輸入您的 Channel Secret
   - 勾選「啟用 LINE 機器人」
   - 點擊「儲存設定」

### 3. 設定 Webhook URL

1. 在 LINE Token 管理頁面中，複製顯示的 Webhook URL
2. 前往 LINE Developers Console
3. 在您的 Channel 設定中找到 Webhook URL 欄位
4. 貼上複製的 Webhook URL
5. 儲存設定

### 4. 測試功能

1. 在 LINE 中搜尋您的機器人
2. 發送測試訊息
3. 確認機器人能夠正常回應

## API 端點

### 獲取 LINE Token 配置
```
GET /api/line-token
```
需要認證，返回當前使用者的 LINE Token 配置

### 更新 LINE Token 配置
```
POST /api/line-token
```
需要認證，更新使用者的 LINE Token 配置

**請求體：**
```json
{
  "channel_access_token": "your_channel_access_token",
  "channel_secret": "your_channel_secret",
  "enabled": true
}
```

### LINE Webhook 端點
```
POST /api/webhook/line/:userId
```
處理來自 LINE 的 Webhook 事件

## 資料庫結構

每個使用者的 LINE Token 配置儲存在 `staff_accounts` 陣列中：

```json
{
  "id": 1,
  "username": "user1",
  "line_token": {
    "channel_access_token": "your_token",
    "channel_secret": "your_secret",
    "enabled": true,
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 安全注意事項

1. **Token 保護**：您的 Channel Access Token 和 Channel Secret 只會儲存在您的個人帳號中
2. **存取控制**：只有您自己可以查看和修改您的 LINE Token 設定
3. **Webhook 安全**：每個使用者都有獨立的 Webhook URL，確保事件只會路由到正確的機器人

## 故障排除

### 常見問題

**Q: 機器人沒有回應**
A: 檢查以下項目：
- LINE Token 是否正確設定
- Webhook URL 是否正確設定在 LINE Developers Console
- 機器人是否已啟用

**Q: Webhook URL 無法存取**
A: 確認：
- 後端 API 服務是否正常運行
- 網路連線是否正常
- URL 格式是否正確

**Q: Token 設定失敗**
A: 檢查：
- Token 格式是否正確
- 是否包含多餘的空格
- 網路連線是否正常

### 錯誤代碼

- `401 Unauthorized`：需要登入
- `404 Not Found`：用戶不存在或配置未找到
- `400 Bad Request`：Token 格式錯誤
- `500 Internal Server Error`：伺服器內部錯誤

## 技術支援

如果您遇到任何問題，請：
1. 檢查瀏覽器控制台的錯誤訊息
2. 確認網路連線正常
3. 重新整理頁面
4. 聯絡技術支援團隊

## 更新日誌

- **v1.0.0** (2024-01-01)
  - 新增個人化 LINE Token 管理功能
  - 支援獨立的 Webhook 端點
  - 新增安全性保護機制 