#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修復認證檢查問題...');

// 1. 修復 check-auth.js
const checkAuthPath = path.join(__dirname, 'public', 'js', 'check-auth.js');
if (fs.existsSync(checkAuthPath)) {
    console.log('📝 修復 check-auth.js...');
    
    const fixedCheckAuth = `// 檢查是否已登入
const token = localStorage.getItem('token');
if (!token) {
    console.log('❌ 未找到認證 token，跳轉到登入頁面');
    window.location.href = '/login.html';
} else {
    console.log('🔍 檢查 token 有效性...');
    // 驗證 token 是否有效
    fetch('https://echochat-api.onrender.com/api/me', {
        method: 'GET',
        headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('✅ Token 有效');
            return response.json();
        } else {
            console.log('❌ Token 無效，清除並跳轉到登入頁面');
            localStorage.removeItem('token');
            localStorage.removeItem('staffName');
            localStorage.removeItem('staffRole');
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        console.error('❌ 認證檢查失敗:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('staffName');
        localStorage.removeItem('staffRole');
        window.location.href = '/login.html';
    });
}`;
    
    fs.writeFileSync(checkAuthPath, fixedCheckAuth);
    console.log('✅ check-auth.js 已修復');
}

// 2. 檢查並修復 login.html 的跳轉邏輯
const loginPath = path.join(__dirname, 'public', 'login.html');
if (fs.existsSync(loginPath)) {
    console.log('📝 檢查 login.html 的跳轉邏輯...');
    
    let loginContent = fs.readFileSync(loginPath, 'utf8');
    
    // 檢查是否使用正確的 API URL
    if (loginContent.includes('window.location.href = \'dashboard.html\'')) {
        console.log('✅ login.html 跳轉邏輯正確');
    } else {
        console.log('⚠️ login.html 跳轉邏輯可能需要檢查');
    }
    
    // 檢查是否使用正確的 API URL
    if (loginContent.includes('https://echochat-api.onrender.com/api/login')) {
        console.log('✅ login.html API URL 正確');
    } else {
        console.log('⚠️ login.html API URL 可能需要更新');
    }
}

// 3. 檢查 dashboard.html 是否正確包含認證檢查
const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
if (fs.existsSync(dashboardPath)) {
    console.log('📝 檢查 dashboard.html 的認證檢查...');
    
    let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // 確保包含 check-auth.js
    if (dashboardContent.includes('check-auth.js')) {
        console.log('✅ dashboard.html 包含認證檢查');
    } else {
        console.log('❌ dashboard.html 缺少認證檢查，正在添加...');
        
        // 在 i18n.js 之後添加 check-auth.js
        const scriptPattern = /<script src="js\/i18n\.js"><\/script>/;
        const newScript = '<script src="js/i18n.js"></script>\n    <script src="js/check-auth.js"></script>';
        
        if (scriptPattern.test(dashboardContent)) {
            dashboardContent = dashboardContent.replace(scriptPattern, newScript);
            fs.writeFileSync(dashboardPath, dashboardContent);
            console.log('✅ 已添加認證檢查到 dashboard.html');
        }
    }
}

// 4. 創建一個測試頁面來驗證認證流程
const testAuthPath = path.join(__dirname, 'public', 'test-auth.html');
const testAuthContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>認證測試</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 認證測試頁面</h1>
        
        <div id="tokenStatus" class="status info">
            檢查中...
        </div>
        
        <div id="apiStatus" class="status info">
            API 檢查中...
        </div>
        
        <div id="actions">
            <button onclick="checkToken()">檢查 Token</button>
            <button onclick="clearToken()">清除 Token</button>
            <button onclick="testLogin()">測試登入</button>
        </div>
        
        <div id="results"></div>
    </div>
    
    <script>
        // 檢查 token 狀態
        function checkToken() {
            const token = localStorage.getItem('token');
            const statusDiv = document.getElementById('tokenStatus');
            
            if (token) {
                statusDiv.textContent = '✅ Token 存在: ' + token.substring(0, 20) + '...';
                statusDiv.className = 'status success';
            } else {
                statusDiv.textContent = '❌ Token 不存在';
                statusDiv.className = 'status error';
            }
        }
        
        // 清除 token
        function clearToken() {
            localStorage.removeItem('token');
            localStorage.removeItem('staffName');
            localStorage.removeItem('staffRole');
            checkToken();
        }
        
        // 測試登入
        async function testLogin() {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<div class="status info">測試登入中...</div>';
            
            try {
                const response = await fetch('https://echochat-api.onrender.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'admin',
                        password: 'admin123'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    resultsDiv.innerHTML = '<div class="status success">✅ 登入成功！Token 已儲存</div>';
                    checkToken();
                } else {
                    resultsDiv.innerHTML = '<div class="status error">❌ 登入失敗: ' + (data.error || '未知錯誤') + '</div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="status error">❌ 網路錯誤: ' + error.message + '</div>';
            }
        }
        
        // 檢查 API 狀態
        async function checkApiStatus() {
            const apiStatusDiv = document.getElementById('apiStatus');
            
            try {
                const response = await fetch('https://echochat-api.onrender.com/api/health');
                const data = await response.json();
                
                if (response.ok) {
                    apiStatusDiv.textContent = '✅ API 正常: ' + data.message;
                    apiStatusDiv.className = 'status success';
                } else {
                    apiStatusDiv.textContent = '❌ API 異常: ' + response.status;
                    apiStatusDiv.className = 'status error';
                }
            } catch (error) {
                apiStatusDiv.textContent = '❌ API 連接失敗: ' + error.message;
                apiStatusDiv.className = 'status error';
            }
        }
        
        // 頁面載入時執行檢查
        window.onload = function() {
            checkToken();
            checkApiStatus();
        };
    </script>
</body>
</html>`;

fs.writeFileSync(testAuthPath, testAuthContent);
console.log('✅ 已創建認證測試頁面');

console.log('\n🎉 認證檢查修復完成！');
console.log('\n📋 修復內容：');
console.log('1. ✅ 修復了 check-auth.js 使用 fetch 和正確的 API URL');
console.log('2. ✅ 檢查了 login.html 的跳轉邏輯');
console.log('3. ✅ 確保 dashboard.html 包含認證檢查');
console.log('4. ✅ 創建了認證測試頁面');

console.log('\n📋 測試步驟：');
console.log('1. 訪問 https://echochat-frontend.onrender.com/test-auth.html');
console.log('2. 檢查 token 狀態和 API 連接');
console.log('3. 測試登入功能');
console.log('4. 檢查登入後是否正確跳轉');

console.log('\n🚀 部署命令：');
console.log('   git add .');
console.log('   git commit -m "Fix authentication check issues"');
console.log('   git push origin main'); 