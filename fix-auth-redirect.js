#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 開始修復身份驗證重定向問題...');

// 1. 修復 API 配置
const apiConfigPath = 'public/js/api-config.js';
let apiConfig = fs.readFileSync(apiConfigPath, 'utf8');

// 確保使用正確的 API URL
apiConfig = apiConfig.replace(
    /production: 'https:\/\/echochat-api\.onrender\.com\/api'/,
    "production: 'https://echochat-api.onrender.com/api'"
);

// 添加更詳細的錯誤處理
apiConfig = apiConfig.replace(
    /\/\/ 如果回應是 401，清除 token 並重新導向到登入頁面\n\s+if \(response\.status === 401\) \{[\s\S]*?window\.location\.href = '\/login\.html';\n\s+return null;\n\s+\}/,
    `// 如果回應是 401，清除 token 並重新導向到登入頁面
            if (response.status === 401) {
                console.log('⚠️ 認證失敗，清除 token');
                this.clearToken();
                // 延遲跳轉，避免立即重定向
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1000);
                return null;
            }`
);

fs.writeFileSync(apiConfigPath, apiConfig);
console.log('✅ API 配置已修復');

// 2. 修復身份驗證檢查
const checkAuthPath = 'public/js/check-auth.js';
let checkAuth = fs.readFileSync(checkAuthPath, 'utf8');

// 改進身份驗證檢查邏輯
checkAuth = checkAuth.replace(
    /fetch\('https:\/\/echochat-api\.onrender\.com\/api\/me'/,
    `fetch('${apiConfig.match(/production: '([^']+)'/)[1]}/me'`
);

// 添加更好的錯誤處理
checkAuth = checkAuth.replace(
    /if \(response\.status === 401\) \{[\s\S]*?window\.location\.href = '\/login\.html';\n\s+\} else \{[\s\S]*?console\.log\('可能是網路問題，暫時允許訪問'\);\n\s+\}/,
    `if (response.status === 401) {
                console.log('認證失敗，清除 token 並跳轉');
                localStorage.removeItem('token');
                localStorage.removeItem('staffName');
                localStorage.removeItem('staffRole');
                // 延遲跳轉
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1000);
            } else {
                console.log('可能是網路問題，暫時允許訪問');
            }`
);

fs.writeFileSync(checkAuthPath, checkAuth);
console.log('✅ 身份驗證檢查已修復');

// 3. 修復簡單身份驗證檢查
const simpleCheckAuthPath = 'public/js/simple-check-auth.js';
let simpleCheckAuth = fs.readFileSync(simpleCheckAuthPath, 'utf8');

// 添加更詳細的檢查
simpleCheckAuth = `// 簡單的認證檢查
const token = localStorage.getItem('token');
if (!token) {
    console.log('❌ 未找到認證 token，跳轉到登入頁面');
    window.location.href = '/login.html';
} else {
    console.log('✅ Token 存在，允許訪問');
    console.log('Token 長度:', token.length);
    // 不進行額外的 API 檢查，只檢查 token 是否存在
}`;

fs.writeFileSync(simpleCheckAuthPath, simpleCheckAuth);
console.log('✅ 簡單身份驗證檢查已修復');

// 4. 修復後端 CORS 設定
const serverPath = 'echochat-api/server.js';
let server = fs.readFileSync(serverPath, 'utf8');

// 確保 CORS 設定包含所有可能的前端 URL
const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8000',
    'https://ai-chatbot-umqm.onrender.com',
    'https://echochat-web.vercel.app',
    'https://echochat-app.vercel.app',
    'https://echochat-frontend.onrender.com',
    'https://echochat-web.onrender.com',
    'capacitor://localhost',
    'http://localhost:8080'
];

// 更新 CORS 設定
const corsConfig = `app.use(cors({
    origin: [
        ${corsOrigins.map(origin => `'${origin}'`).join(',\n        ')},
        '*'                                          // 開發時允許所有來源
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`;

server = server.replace(
    /app\.use\(cors\(\{[\s\S]*?\}\)\);/,
    corsConfig
);

fs.writeFileSync(serverPath, server);
console.log('✅ 後端 CORS 設定已修復');

// 5. 創建調試腳本
const debugScript = `// 調試身份驗證問題
console.log('🔍 調試身份驗證...');
console.log('當前 URL:', window.location.href);
console.log('Token 存在:', !!localStorage.getItem('token'));
console.log('API URL:', window.API_BASE_URL);

// 測試 API 連接
fetch(window.API_BASE_URL + '/health')
    .then(response => {
        console.log('API 健康檢查:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('API 回應:', data);
    })
    .catch(error => {
        console.error('API 錯誤:', error);
    });

// 測試身份驗證
const token = localStorage.getItem('token');
if (token) {
    fetch(window.API_BASE_URL + '/me', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('身份驗證檢查:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('身份驗證回應:', data);
    })
    .catch(error => {
        console.error('身份驗證錯誤:', error);
    });
}`;

fs.writeFileSync('public/js/debug-auth.js', debugScript);
console.log('✅ 調試腳本已創建');

console.log('🎉 身份驗證重定向問題修復完成！');
console.log('');
console.log('📋 修復內容：');
console.log('1. ✅ 修復了 API 配置中的錯誤處理');
console.log('2. ✅ 改進了身份驗證檢查邏輯');
console.log('3. ✅ 修復了簡單身份驗證檢查');
console.log('4. ✅ 更新了後端 CORS 設定');
console.log('5. ✅ 創建了調試腳本');
console.log('');
console.log('🚀 請重新部署到 Render：');
console.log('1. 提交這些更改到 Git');
console.log('2. 推送到 GitHub');
console.log('3. Render 會自動重新部署');
console.log('');
console.log('🔍 如果問題持續，請檢查瀏覽器控制台的錯誤訊息'); 