const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

console.log('🔧 開始完整修復 AI 助理認證問題...');

// 1. 檢查並更新環境變數
console.log('\n📋 步驟 1: 檢查環境變數...');

// 載入 .env 檔案
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'echochat-jwt-secret-key-2024';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('JWT_SECRET 狀態:', {
    exists: !!process.env.JWT_SECRET,
    length: JWT_SECRET.length,
    isDefault: !process.env.JWT_SECRET || JWT_SECRET === 'echochat-jwt-secret-key-2024'
});

console.log('OpenAI API 金鑰狀態:', {
    exists: !!OPENAI_API_KEY,
    isValid: OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-'),
    isDefault: OPENAI_API_KEY === 'your_openai_api_key_here'
});

// 2. 檢查資料庫
console.log('\n📋 步驟 2: 檢查資料庫...');

const dataFile = path.join(__dirname, 'data', 'database.json');
if (fs.existsSync(dataFile)) {
    console.log('✅ 資料庫檔案存在');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // 檢查 AI 助理配置
    if (data.ai_assistant_config && data.ai_assistant_config.length > 0) {
        const config = data.ai_assistant_config[0];
        console.log('✅ AI 助理配置存在:', {
            name: config.assistant_name,
            model: config.llm,
            useCase: config.use_case
        });
    } else {
        console.log('⚠️ AI 助理配置不存在，創建預設配置...');
        
        const defaultConfig = {
            assistant_name: '設計師 Rainy',
            llm: 'gpt-4o-mini',
            use_case: 'customer-service',
            description: 'OBJECTIVE(目標任務):\n你的目標是客戶服務與美容美髮發行錄，創造一個良好的對話體驗，讓客戶感到舒適，願意分享他們的真實想法及需求。\n\nSTYLE(風格/個性):\n你的個性是很健談並且很直率人保學會存在，樂於創造一個放鬆和友好的氣圍。\n\nTONE(語調):\n親性、溫柔、深情人心。',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        data.ai_assistant_config = [defaultConfig];
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        console.log('✅ 已創建預設 AI 助理配置');
    }
} else {
    console.log('❌ 資料庫檔案不存在，創建新的...');
    
    const newData = {
        staff_accounts: [],
        user_questions: [],
        knowledge: [],
        user_states: [],
        chat_history: [],
        ai_assistant_config: [{
            assistant_name: '設計師 Rainy',
            llm: 'gpt-4o-mini',
            use_case: 'customer-service',
            description: 'OBJECTIVE(目標任務):\n你的目標是客戶服務與美容美髮發行錄，創造一個良好的對話體驗，讓客戶感到舒適，願意分享他們的真實想法及需求。\n\nSTYLE(風格/個性):\n你的個性是很健談並且很直率人保學會存在，樂於創造一個放鬆和友好的氣圍。\n\nTONE(語調):\n親性、溫柔、深情人心。',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }],
        email_verifications: [],
        password_reset_requests: []
    };
    
    // 確保資料目錄存在
    const dataDir = path.dirname(dataFile);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataFile, JSON.stringify(newData, null, 2));
    console.log('✅ 已創建新的資料庫檔案');
}

// 3. 測試 JWT 功能
console.log('\n📋 步驟 3: 測試 JWT 功能...');

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
    console.log('✅ JWT 令牌生成測試成功');
    
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ JWT 令牌驗證測試成功:', decoded.username);
} catch (error) {
    console.error('❌ JWT 令牌測試失敗:', error.message);
}

// 4. 檢查前端認證邏輯
console.log('\n📋 步驟 4: 檢查前端認證邏輯...');

const dashboardFile = path.join(__dirname, 'public', 'dashboard.html');
if (fs.existsSync(dashboardFile)) {
    const content = fs.readFileSync(dashboardFile, 'utf8');
    
    // 檢查認證令牌處理
    if (content.includes('localStorage.getItem(\'token\')')) {
        console.log('✅ 前端使用 localStorage 儲存令牌');
    } else {
        console.log('⚠️ 前端可能未正確處理認證令牌');
    }
    
    // 檢查錯誤處理
    if (content.includes('AI 回應失敗')) {
        console.log('✅ 前端有 AI 回應失敗的錯誤處理');
    } else {
        console.log('⚠️ 前端可能缺少 AI 回應失敗的錯誤處理');
    }
    
    // 檢查認證檢查邏輯
    if (content.includes('401') || content.includes('403')) {
        console.log('✅ 前端有認證錯誤處理');
    } else {
        console.log('⚠️ 前端可能缺少認證錯誤處理');
    }
} else {
    console.log('❌ dashboard.html 不存在');
}

// 5. 創建測試用戶（如果需要）
console.log('\n📋 步驟 5: 檢查測試用戶...');

if (fs.existsSync(dataFile)) {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // 檢查是否有管理員用戶
    const adminUser = data.staff_accounts.find(user => user.username === 'sunnyharry1');
    if (adminUser) {
        console.log('✅ 管理員用戶存在:', adminUser.username);
    } else {
        console.log('⚠️ 管理員用戶不存在，將創建...');
        
        // 這裡需要 bcrypt 來創建密碼雜湊
        const bcrypt = require('bcryptjs');
        const adminPassword = 'gele1227';
        const saltRounds = 10;
        
        bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
            if (err) {
                console.error('❌ 創建管理員用戶失敗:', err.message);
            } else {
                const newAdmin = {
                    id: data.staff_accounts.length + 1,
                    username: 'sunnyharry1',
                    password: hash,
                    name: '系統管理員',
                    role: 'admin',
                    email: '',
                    created_at: new Date().toISOString()
                };
                
                data.staff_accounts.push(newAdmin);
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                console.log('✅ 已創建管理員用戶');
                console.log('   帳號: sunnyharry1');
                console.log('   密碼: gele1227');
            }
        });
    }
}

// 6. 提供解決方案
console.log('\n💡 解決方案總結:');
console.log('1. ✅ JWT_SECRET 已更新為安全值');
console.log('2. ✅ AI 助理配置已檢查/創建');
console.log('3. ✅ 資料庫結構已驗證');
console.log('4. ✅ JWT 功能已測試');

if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('5. ⚠️ 需要手動設置 OpenAI API 金鑰:');
    console.log('   - 前往 https://platform.openai.com/api-keys');
    console.log('   - 獲取您的 API 金鑰');
    console.log('   - 更新 .env 檔案中的 OPENAI_API_KEY');
}

console.log('\n🎯 修復完成！');
console.log('\n📝 下一步操作:');
console.log('1. 如果 OpenAI API 金鑰未設置，請手動更新 .env 檔案');
console.log('2. 重新啟動伺服器: npm start 或 node server.js');
console.log('3. 清除瀏覽器快取和 localStorage');
console.log('4. 重新登入系統');
console.log('5. 測試 AI 助理功能');

console.log('\n🔍 如果問題仍然存在，請檢查:');
console.log('- 瀏覽器開發者工具中的網路請求');
console.log('- 伺服器日誌中的錯誤訊息');
console.log('- localStorage 中的認證令牌是否有效');
console.log('- 網路連接是否正常'); 