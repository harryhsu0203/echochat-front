# API 端點列表

## 基礎網址
```
https://your-render-app.onrender.com
```

## 忘記密碼 API

### 1. 發送驗證碼
```
POST /api/forgot-password
```

**請求格式**:
```json
{
  "email": "user@example.com"
}
```

**回應格式**:
```json
{
  "success": true,
  "message": "驗證碼已發送到您的電子郵件"
}
```

### 2. 重設密碼
```
POST /api/reset-password
```

**請求格式**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

**回應格式**:
```json
{
  "success": true,
  "message": "密碼重設成功"
}
```

## 使用範例

### JavaScript / React Native
```javascript
const API_BASE = 'https://your-render-app.onrender.com';

// 發送驗證碼
fetch(`${API_BASE}/api/forgot-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// 重設密碼
fetch(`${API_BASE}/api/reset-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456',
    newPassword: 'newpassword123'
  })
});
```

## 重要參數

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| email | string | ✅ | 電子郵件地址 |
| code | string | ✅ | 6位數驗證碼 |
| newPassword | string | ✅ | 新密碼（至少6字符） |

## 錯誤處理

所有 API 都返回統一格式：
```json
{
  "success": false,
  "error": "錯誤訊息"
}
```

## 注意事項

- 驗證碼有效期：10分鐘
- 密碼最小長度：6個字符
- 請求標頭：`Content-Type: application/json`
- CORS：已啟用跨域支援 