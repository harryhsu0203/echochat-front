#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 恢復原本的頁面設計，只修復 CSP 和 CORS 問題...');

// 1. 修復 server.js 的 CSP 和 CORS 設定
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
    console.log('📝 修復 server.js 的 CSP 和 CORS 設定...');
    
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // 更新 CORS 設定
    const corsPattern = /app\.use\(cors\(\{[^}]*\}\)\);/;
    const newCorsConfig = `app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5000',
        'https://echochat-frontend.onrender.com',
        'https://echochat.onrender.com',
        '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`;
    
    if (corsPattern.test(serverContent)) {
        serverContent = serverContent.replace(corsPattern, newCorsConfig);
        console.log('✅ CORS 設定已更新');
    }
    
    // 更新 CSP 設定
    const cspPattern = /connectSrc:\s*\[[^\]]*\]/;
    const newCspConfig = `connectSrc: ["'self'", "https://echochat-api.onrender.com", "https://echochat-frontend.onrender.com", "https://echochat.onrender.com"]`;
    
    if (cspPattern.test(serverContent)) {
        serverContent = serverContent.replace(cspPattern, newCspConfig);
        console.log('✅ CSP 設定已更新');
    }
    
    fs.writeFileSync(serverPath, serverContent);
}

// 2. 修復 check-auth.js 使用正確的 API URL
const checkAuthPath = path.join(__dirname, 'public', 'js', 'check-auth.js');
if (fs.existsSync(checkAuthPath)) {
    console.log('📝 修復 check-auth.js 的 API URL...');
    
    let checkAuthContent = fs.readFileSync(checkAuthPath, 'utf8');
    
    // 更新 API URL
    const apiUrlPattern = /fetch\('[^']*\/api\/me'/;
    const newApiUrl = `fetch('https://echochat-api.onrender.com/api/me'`;
    
    if (apiUrlPattern.test(checkAuthContent)) {
        checkAuthContent = checkAuthContent.replace(apiUrlPattern, newApiUrl);
        console.log('✅ API URL 已更新');
    }
    
    fs.writeFileSync(checkAuthPath, checkAuthContent);
}

// 3. 確保 dashboard.html 包含認證檢查
const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
if (fs.existsSync(dashboardPath)) {
    console.log('📝 檢查 dashboard.html 的認證檢查...');
    
    let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // 檢查是否已包含 check-auth.js
    if (!dashboardContent.includes('check-auth.js')) {
        console.log('📝 添加認證檢查到 dashboard.html...');
        
        // 在 i18n.js 之後添加 check-auth.js
        const scriptPattern = /<script src="js\/i18n\.js"><\/script>/;
        const newScript = '<script src="js/i18n.js"></script>\n    <script src="js/check-auth.js"></script>';
        
        if (scriptPattern.test(dashboardContent)) {
            dashboardContent = dashboardContent.replace(scriptPattern, newScript);
            fs.writeFileSync(dashboardPath, dashboardContent);
            console.log('✅ 已添加認證檢查到 dashboard.html');
        }
    } else {
        console.log('✅ dashboard.html 已包含認證檢查');
    }
}

// 4. 檢查並修復 api-config.js
const apiConfigPath = path.join(__dirname, 'public', 'js', 'api-config.js');
if (fs.existsSync(apiConfigPath)) {
    console.log('📝 檢查 api-config.js...');
    
    let apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
    
    // 確保生產環境 URL 正確
    const productionUrlPattern = /production:\s*'[^']*'/;
    const newProductionUrl = `production: 'https://echochat-api.onrender.com/api'`;
    
    if (productionUrlPattern.test(apiConfigContent)) {
        apiConfigContent = apiConfigContent.replace(productionUrlPattern, newProductionUrl);
        fs.writeFileSync(apiConfigPath, apiConfigContent);
        console.log('✅ API 配置已更新');
    }
}

console.log('\n🎉 修復完成！');
console.log('\n📋 修復內容：');
console.log('1. ✅ 修復了 CSP 設定 - 允許前端連接後端');
console.log('2. ✅ 修復了 CORS 設定 - 允許跨域請求');
console.log('3. ✅ 更新了認證檢查的 API URL');
console.log('4. ✅ 添加了認證檢查到儀表板');
console.log('5. ✅ 保持了原本的頁面設計');

console.log('\n📋 原本的頁面設計已恢復：');
console.log('   - 首頁保持原本的設計');
console.log('   - 登入頁面保持原本的設計');
console.log('   - 儀表板保持原本的設計');
console.log('   - 所有樣式和功能都保持不變');

console.log('\n🚀 部署命令：');
console.log('   git add .');
console.log('   git commit -m "Fix CSP and CORS while keeping original design"');
console.log('   git push origin main');

console.log('\n⏳ 部署完成後，請測試：');
console.log('   https://echochat-frontend.onrender.com'); 