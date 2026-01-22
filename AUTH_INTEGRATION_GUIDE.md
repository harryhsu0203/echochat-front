# EchoChat 帳號驗證系統整合指南

## 📋 系統概述

### 已部署的驗證系統
- **部署平台**: Render
- **資料庫**: JSON 檔案系統
- **認證方式**: JWT Token
- **密碼加密**: bcryptjs
- **電子郵件驗證**: Nodemailer + Gmail

## 🔧 API 端點

### 1. 用戶註冊
```javascript
POST /api/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}

// 回應
{
  "success": true,
  "message": "註冊成功，請檢查電子郵件驗證碼"
}
```

### 2. 發送驗證碼
```javascript
POST /api/send-verification-code
Content-Type: application/json

{
  "email": "user@example.com"
}

// 回應
{
  "success": true,
  "message": "驗證碼已發送到您的電子郵件",
  "code": "123456" // 開發模式會直接返回
}
```

### 3. 驗證碼驗證
```javascript
POST /api/verify-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

// 回應
{
  "success": true,
  "message": "驗證成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. 用戶登入
```javascript
POST /api/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}

// 回應
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "user123",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 5. 獲取用戶資料
```javascript
GET /api/me
Authorization: Bearer <token>

// 回應
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "user123",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 6. 更新用戶資料
```javascript
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新名稱",
  "email": "newemail@example.com"
}

// 回應
{
  "success": true,
  "message": "資料更新成功"
}
```

### 7. 修改密碼
```javascript
POST /api/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "舊密碼",
  "newPassword": "新密碼"
}

// 回應
{
  "success": true,
  "message": "密碼修改成功"
}
```

### 8. 刪除帳號
```javascript
POST /api/delete-account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "當前密碼"
}

// 回應
{
  "success": true,
  "message": "帳號已成功刪除"
}
```

## 🚀 前端整合範例

### 1. 登入功能
```javascript
async function login(username, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: '登入失敗' };
  }
}
```

### 2. 註冊功能
```javascript
async function register(username, email, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: '註冊失敗' };
  }
}
```

### 3. 發送驗證碼
```javascript
async function sendVerificationCode(email) {
  try {
    const response = await fetch('/api/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: '發送驗證碼失敗' };
  }
}
```

### 4. 驗證碼驗證
```javascript
async function verifyCode(email, code) {
  try {
    const response = await fetch('/api/verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      return { success: true, token: data.token };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: '驗證失敗' };
  }
}
```

### 5. 檢查認證狀態
```javascript
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { authenticated: false };
  }
  
  try {
    const response = await fetch('/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { authenticated: true, user: data.user };
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { authenticated: false };
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { authenticated: false };
  }
}
```

### 6. 登出功能
```javascript
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}
```

## 🔒 安全設定

### 1. JWT 設定
```javascript
// 在 server.js 中
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
```

### 2. 環境變數
```bash
# .env 檔案
JWT_SECRET=your-secret-key
EMAIL_USER=echochatsup@gmail.com
EMAIL_PASS=your-app-password
DB_PATH=./database.json
```

## 📱 使用範例

### 完整的登入流程
```javascript
// 1. 用戶輸入資料
const username = 'user123';
const password = 'password123';

// 2. 發送登入請求
const loginResult = await login(username, password);

if (loginResult.success) {
  console.log('登入成功:', loginResult.user);
  // 跳轉到儀表板
  window.location.href = '/dashboard.html';
} else {
  console.error('登入失敗:', loginResult.error);
}
```

### 完整的註冊流程
```javascript
// 1. 用戶註冊
const registerResult = await register('user123', 'user@example.com', 'password123');

if (registerResult.success) {
  // 2. 發送驗證碼
  const codeResult = await sendVerificationCode('user@example.com');
  
  if (codeResult.success) {
    // 3. 用戶輸入驗證碼
    const code = '123456'; // 用戶輸入的驗證碼
    
    // 4. 驗證碼驗證
    const verifyResult = await verifyCode('user@example.com', code);
    
    if (verifyResult.success) {
      console.log('註冊成功');
      window.location.href = '/dashboard.html';
    }
  }
}
```

## 🔧 部署注意事項

### 1. Render 部署
- 確保環境變數已設定
- 檢查端口設定
- 確認靜態檔案路徑

### 2. 域名設定
- 如果使用自定義域名，需要更新 CORS 設定
- 確保 HTTPS 憑證正確

### 3. 資料庫備份
- JSON 檔案會自動保存在 Render 的檔案系統中
- 建議定期備份 database.json

## 📞 技術支援

如果遇到整合問題，請檢查：
1. 網路連接是否正常
2. API 端點是否正確
3. JWT Token 是否有效
4. 環境變數是否設定正確 