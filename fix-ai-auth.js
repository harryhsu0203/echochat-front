const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

console.log('🔧 開始修復 AI 助理認證問題...');

// 檢查 JWT_SECRET 設置
const JWT_SECRET = process.env.JWT_SECRET || 'echochat-jwt-secret-key-2024';
console.log('📋 JWT_SECRET 狀態:', {
    exists: !!process.env.JWT_SECRET,
    length: JWT_SECRET.length,
    isDefault: !process.env.JWT_SECRET || JWT_SECRET === 'echochat-jwt-secret-key-2024'
});

// 檢查資料庫檔案
const dataFile = path.join(__dirname, 'data', 'database.json');
if (fs.existsSync(dataFile)) {
    console.log('✅ 資料庫檔案存在');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // 檢查 AI 助理配置
    if (data.ai_assistant_config && data.ai_assistant_config.length > 0) {
        console.log('✅ AI 助理配置存在:', data.ai_assistant_config[0].assistant_name);
    } else {
        console.log('⚠️ AI 助理配置不存在，將創建預設配置');
        
        // 創建預設 AI 助理配置
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
    console.log('❌ 資料庫檔案不存在');
}

// 檢查環境變數
console.log('\n🔍 環境變數檢查:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '已設置' : '未設置');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已設置' : '未設置');

// 生成測試令牌
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
    
    // 驗證令牌
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ JWT 令牌驗證測試成功:', decoded.username);
} catch (error) {
    console.error('❌ JWT 令牌測試失敗:', error.message);
}

// 檢查前端認證邏輯
console.log('\n🔍 前端認證檢查:');
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
} else {
    console.log('❌ dashboard.html 不存在');
}

// 提供解決方案
console.log('\n💡 解決方案建議:');
console.log('1. 確保 JWT_SECRET 環境變數已正確設置');
console.log('2. 檢查用戶是否已正確登入並獲得有效令牌');
console.log('3. 清除瀏覽器快取和 localStorage');
console.log('4. 重新登入系統');

// 檢查是否有 .env 檔案
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
    console.log('\n📝 建議創建 .env 檔案:');
    console.log('NODE_ENV=development');
    console.log('JWT_SECRET=your-super-secret-jwt-key-here');
    console.log('OPENAI_API_KEY=your-openai-api-key-here');
    console.log('PORT=3000');
} else {
    console.log('✅ .env 檔案存在');
}

console.log('\n🎯 修復完成！');
console.log('如果問題仍然存在，請檢查：');
console.log('1. 瀏覽器開發者工具中的網路請求');
console.log('2. 伺服器日誌中的錯誤訊息');
console.log('3. localStorage 中的認證令牌是否有效'); 