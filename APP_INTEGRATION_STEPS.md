# 🚀 應用程式整合步驟

## 📋 快速整合指南

### 1. **設定 API 端點**
```javascript
// 在您的應用程式中設定 API URL
const API_BASE_URL = 'https://your-render-app.onrender.com';
```

### 2. **加入登入功能**
```javascript
// 登入函數
async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
}
```

### 3. **加入認證檢查**
```javascript
// 檢查用戶是否已登入
async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { authenticated: true, user: data.user };
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            return false;
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        return false;
    }
}
```

### 4. **加入登出功能**
```javascript
// 登出函數
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
```

## 🔧 整合範例

### 在您的 HTML 頁面中加入：
```html
<!DOCTYPE html>
<html>
<head>
    <title>您的應用程式</title>
</head>
<body>
    <div id="app">
        <div id="login-form" style="display: none;">
            <h2>登入</h2>
            <input type="text" id="username" placeholder="用戶名">
            <input type="password" id="password" placeholder="密碼">
            <button onclick="handleLogin()">登入</button>
        </div>
        
        <div id="app-content" style="display: none;">
            <h2>歡迎回來，<span id="user-name"></span>！</h2>
            <button onclick="logout()">登出</button>
        </div>
    </div>

    <script>
        const API_BASE_URL = 'https://your-render-app.onrender.com';
        
        // 頁面載入時檢查認證
        document.addEventListener('DOMContentLoaded', async function() {
            const authStatus = await checkAuth();
            
            if (authStatus.authenticated) {
                showAppContent(authStatus.user);
            } else {
                showLoginForm();
            }
        });
        
        // 顯示應用程式內容
        function showAppContent(user) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('app-content').style.display = 'block';
            document.getElementById('user-name').textContent = user.username;
        }
        
        // 顯示登入表單
        function showLoginForm() {
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('app-content').style.display = 'none';
        }
        
        // 處理登入
        async function handleLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = await login(username, password);
            
            if (result.success) {
                showAppContent(result.user);
            } else {
                alert('登入失敗：' + result.error);
            }
        }
        
        // 登入函數
        async function login(username, password) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                return { success: false, error: '網路錯誤' };
            }
        }
        
        // 檢查認證
        async function checkAuth() {
            const token = localStorage.getItem('token');
            
            if (!token) {
                return { authenticated: false };
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
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
        
        // 登出
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }
    </script>
</body>
</html>
```

## 🎯 關鍵步驟

### 1. **替換 API URL**
將 `https://your-render-app.onrender.com` 替換為您的實際 Render 應用程式 URL。

### 2. **加入認證檢查**
在每個需要保護的頁面加入認證檢查。

### 3. **處理登入狀態**
根據登入狀態顯示不同的內容。

### 4. **測試整合**
確保所有功能正常運作。

## 📞 常見問題

### Q: 如何獲取我的 Render 應用程式 URL？
A: 在 Render 控制台中查看您的應用程式，URL 格式為：`https://your-app-name.onrender.com`

### Q: 如何測試整合？
A: 1. 部署您的應用程式到 Render
2. 確保 API 端點可以正常訪問
3. 測試登入、註冊、登出功能

### Q: 如何處理 CORS 問題？
A: 確保您的 Render 應用程式已正確設定 CORS，允許您的域名訪問。

## ✅ 完成檢查清單

- [ ] 設定正確的 API URL
- [ ] 加入登入功能
- [ ] 加入認證檢查
- [ ] 加入登出功能
- [ ] 測試所有功能
- [ ] 部署到生產環境 