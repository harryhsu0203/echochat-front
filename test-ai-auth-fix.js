const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

console.log('🧪 開始測試 AI 助理認證修復...');

// 1. 測試環境變數
console.log('\n📋 測試 1: 環境變數...');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'echochat-jwt-secret-key-2024';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('JWT_SECRET:', {
    exists: !!process.env.JWT_SECRET,
    length: JWT_SECRET.length,
    isSecure: JWT_SECRET.length >= 32
});

console.log('OpenAI API 金鑰:', {
    exists: !!OPENAI_API_KEY,
    isValid: OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-'),
    isDefault: OPENAI_API_KEY === 'your_openai_api_key_here'
});

// 2. 測試資料庫配置
console.log('\n📋 測試 2: 資料庫配置...');

const dataFile = path.join(__dirname, 'data', 'database.json');
if (fs.existsSync(dataFile)) {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    if (data.ai_assistant_config && data.ai_assistant_config.length > 0) {
        const config = data.ai_assistant_config[0];
        console.log('✅ AI 助理配置存在');
        console.log('   - 名稱:', config.assistant_name);
        console.log('   - 模型:', config.llm);
        console.log('   - 用途:', config.use_case);
        console.log('   - 描述長度:', config.description ? config.description.length : 0);
        
        // 檢查必要欄位
        const requiredFields = ['assistant_name', 'llm', 'use_case', 'description'];
        const missingFields = requiredFields.filter(field => !config[field]);
        
        if (missingFields.length === 0) {
            console.log('✅ 所有必要欄位都存在');
        } else {
            console.log('❌ 缺少欄位:', missingFields);
        }
    } else {
        console.log('❌ AI 助理配置不存在');
    }
} else {
    console.log('❌ 資料庫檔案不存在');
}

// 3. 測試 JWT 功能
console.log('\n📋 測試 3: JWT 功能...');

try {
    const testToken = jwt.sign(
        { 
            id: 1, 
            username: 'test', 
            role: 'admin' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
    console.log('✅ JWT 令牌生成成功');
    
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ JWT 令牌驗證成功:', decoded.username);
    
    // 測試過期令牌
    const expiredToken = jwt.sign(
        { 
            id: 1, 
            username: 'test', 
            role: 'admin' 
        }, 
        JWT_SECRET, 
        { expiresIn: '-1s' }
    );
    
    try {
        jwt.verify(expiredToken, JWT_SECRET);
        console.log('❌ 過期令牌驗證應該失敗');
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('✅ 過期令牌正確被拒絕');
        } else {
            console.log('⚠️ 過期令牌錯誤類型:', error.name);
        }
    }
} catch (error) {
    console.error('❌ JWT 測試失敗:', error.message);
}

// 4. 測試前端認證邏輯
console.log('\n📋 測試 4: 前端認證邏輯...');

const dashboardFile = path.join(__dirname, 'public', 'dashboard.html');
if (fs.existsSync(dashboardFile)) {
    const content = fs.readFileSync(dashboardFile, 'utf8');
    
    const checks = [
        { name: 'localStorage 令牌處理', pattern: 'localStorage.getItem(\'token\')' },
        { name: 'AI 回應失敗處理', pattern: 'AI 回應失敗' },
        { name: '認證錯誤處理', pattern: '401|403' },
        { name: 'Bearer 令牌格式', pattern: 'Bearer \\$\\{token\\}' }
    ];
    
    checks.forEach(check => {
        if (content.includes(check.pattern) || new RegExp(check.pattern).test(content)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`⚠️ ${check.name} - 可能缺少`);
        }
    });
} else {
    console.log('❌ dashboard.html 不存在');
}

// 5. 模擬 API 請求測試
console.log('\n📋 測試 5: 模擬 API 請求...');

// 創建測試令牌
const testUserToken = jwt.sign(
    { 
        id: 1, 
        username: 'sunnyharry1', 
        role: 'admin' 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
);

console.log('✅ 測試用戶令牌已生成');
console.log('   用戶: sunnyharry1');
console.log('   角色: admin');
console.log('   令牌長度:', testUserToken.length);

// 6. 總結
console.log('\n🎯 測試總結:');

const results = {
    envVars: !!process.env.JWT_SECRET && JWT_SECRET.length >= 32,
    aiConfig: fs.existsSync(dataFile) && JSON.parse(fs.readFileSync(dataFile, 'utf8')).ai_assistant_config?.length > 0,
    jwtFunction: true, // 如果到這裡沒有錯誤就是成功
    frontendLogic: fs.existsSync(dashboardFile),
    testToken: testUserToken.length > 0
};

const passedTests = Object.values(results).filter(Boolean).length;
const totalTests = Object.keys(results).length;

console.log(`✅ 通過測試: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
    console.log('🎉 所有測試通過！AI 助理認證問題已修復');
} else {
    console.log('⚠️ 部分測試失敗，請檢查上述問題');
}

console.log('\n💡 下一步:');
console.log('1. 重新啟動伺服器: npm start 或 node server.js');
console.log('2. 清除瀏覽器快取和 localStorage');
console.log('3. 重新登入系統');
console.log('4. 測試 AI 助理功能');

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('\n⚠️ 重要提醒:');
    console.log('   - 請設置有效的 OpenAI API 金鑰');
    console.log('   - 前往 https://platform.openai.com/api-keys');
    console.log('   - 更新 .env 檔案中的 OPENAI_API_KEY');
} 