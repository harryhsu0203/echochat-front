const fs = require('fs');
const path = require('path');

console.log('🔧 開始修復 AI 助理配置結構...');

const dataFile = path.join(__dirname, 'data', 'database.json');

if (fs.existsSync(dataFile)) {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // 檢查現有的 AI 助理配置
    if (data.ai_assistant_config && data.ai_assistant_config.length > 0) {
        const currentConfig = data.ai_assistant_config[0];
        console.log('📋 現有配置:', currentConfig);
        
        // 檢查配置結構是否正確
        const requiredFields = ['assistant_name', 'llm', 'use_case', 'description'];
        const missingFields = requiredFields.filter(field => !currentConfig[field]);
        
        if (missingFields.length > 0) {
            console.log('⚠️ 配置缺少必要欄位:', missingFields);
            
            // 創建正確的配置結構
            const correctConfig = {
                assistant_name: currentConfig.name || '設計師 Rainy',
                llm: currentConfig.model || 'gpt-4o-mini',
                use_case: currentConfig.useCase || 'customer-service',
                description: currentConfig.description || 'OBJECTIVE(目標任務):\n你的目標是客戶服務與美容美髮發行錄，創造一個良好的對話體驗，讓客戶感到舒適，願意分享他們的真實想法及需求。\n\nSTYLE(風格/個性):\n你的個性是很健談並且很直率人保學會存在，樂於創造一個放鬆和友好的氣圍。\n\nTONE(語調):\n親性、溫柔、深情人心。',
                created_at: currentConfig.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // 更新配置
            data.ai_assistant_config = [correctConfig];
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            
            console.log('✅ 已修復 AI 助理配置結構');
            console.log('📋 新配置:', correctConfig);
        } else {
            console.log('✅ AI 助理配置結構正確');
        }
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
        console.log('📋 新配置:', defaultConfig);
    }
} else {
    console.log('❌ 資料庫檔案不存在');
}

console.log('\n🎯 AI 助理配置修復完成！'); 