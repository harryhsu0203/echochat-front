const fs = require('fs');
const path = require('path');

console.log('🔧 創建測試數據...');

// 資料庫檔案路徑
const dataDir = './data';
const dataFile = path.join(dataDir, 'database.json');

// 確保資料目錄存在
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 載入現有資料
let database = {
    staff_accounts: [],
    user_questions: [],
    knowledge: [],
    user_states: [],
    chat_history: [],
    ai_assistant_config: [],
    email_verifications: [],
    password_reset_requests: []
};

if (fs.existsSync(dataFile)) {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        const loadedData = JSON.parse(data);
        database = {
            staff_accounts: loadedData.staff_accounts || [],
            user_questions: loadedData.user_questions || [],
            knowledge: loadedData.knowledge || [],
            user_states: loadedData.user_states || [],
            chat_history: loadedData.chat_history || [],
            ai_assistant_config: loadedData.ai_assistant_config || [],
            email_verifications: loadedData.email_verifications || [],
            password_reset_requests: loadedData.password_reset_requests || []
        };
        console.log('✅ 載入現有資料庫');
    } catch (error) {
        console.error('❌ 載入資料庫失敗:', error.message);
    }
}

// 生成測試用戶數據
function createTestUsers() {
    console.log('👥 創建測試用戶數據...');
    
    const userNames = ['張小明', '李美玲', '王大華', '陳小芳', '林志明', '黃雅婷', '劉建國', '周淑芬'];
    const questions = [
        '如何重置密碼？',
        '系統使用問題',
        '帳號登入問題',
        '功能操作說明',
        '技術支援需求',
        '產品諮詢',
        '服務問題',
        '系統錯誤報告'
    ];
    
    // 生成最近7天的用戶數據
    const now = new Date();
    for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
        
        const user = {
            id: Date.now() + i,
            username: `user${i + 1}`,
            name: userNames[i % userNames.length],
            question: questions[i % questions.length],
            created_at: timestamp.toISOString(),
            timestamp: timestamp.toISOString()
        };
        
        database.user_questions.push(user);
    }
    
    console.log(`✅ 創建了 ${database.user_questions.length} 個用戶記錄`);
}

// 生成測試訊息數據
function createTestMessages() {
    console.log('💬 創建測試訊息數據...');
    
    const messages = [
        '您好，我想詢問關於系統使用的問題',
        '如何重置我的密碼？',
        '系統出現錯誤，請協助處理',
        '我需要技術支援',
        '產品功能諮詢',
        '帳號登入有問題',
        '如何使用新功能？',
        '系統設定問題',
        '資料匯出功能',
        '權限設定問題'
    ];
    
    const responses = [
        '感謝您的詢問，我們會盡快為您處理',
        '請按照以下步驟重置密碼...',
        '我們已收到您的錯誤報告，正在處理中',
        '技術支援團隊會與您聯繫',
        '產品功能說明如下...',
        '請檢查您的登入資訊',
        '新功能使用說明...',
        '系統設定可以透過以下方式調整...',
        '資料匯出功能位於...',
        '權限設定請聯繫管理員'
    ];
    
    // 生成最近7天的訊息數據
    const now = new Date();
    for (let i = 0; i < 100; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
        
        const messageIndex = i % messages.length;
        const responseTime = (Math.random() * 5 + 1).toFixed(1); // 1-6秒的回應時間
        
        const message = {
            id: Date.now() + i,
            userId: `user${Math.floor(Math.random() * 50) + 1}`,
            content: messages[messageIndex],
            response: responses[messageIndex],
            responseTime: parseFloat(responseTime),
            timestamp: timestamp.toISOString(),
            created_at: timestamp.toISOString()
        };
        
        database.chat_history.push(message);
    }
    
    console.log(`✅ 創建了 ${database.chat_history.length} 條訊息記錄`);
}

// 生成測試知識庫數據
function createTestKnowledge() {
    console.log('🧠 創建測試知識庫數據...');
    
    const knowledgeItems = [
        {
            question: '如何重置密碼？',
            answer: '請點擊登入頁面的「忘記密碼」連結，輸入您的電子郵件地址，系統會發送重設密碼的連結給您。',
            category: '帳號管理',
            usage_count: Math.floor(Math.random() * 50) + 10
        },
        {
            question: '系統使用問題',
            answer: '請先查看使用手冊，如果仍有問題請聯繫技術支援。',
            category: '系統使用',
            usage_count: Math.floor(Math.random() * 30) + 5
        },
        {
            question: '帳號登入問題',
            answer: '請確認您的用戶名和密碼是否正確，如果忘記密碼請使用重設功能。',
            category: '帳號管理',
            usage_count: Math.floor(Math.random() * 40) + 8
        },
        {
            question: '功能操作說明',
            answer: '詳細的功能操作說明請參考系統內的使用指南。',
            category: '系統使用',
            usage_count: Math.floor(Math.random() * 25) + 3
        },
        {
            question: '技術支援需求',
            answer: '請提供詳細的問題描述，我們的技術團隊會盡快為您處理。',
            category: '技術支援',
            usage_count: Math.floor(Math.random() * 20) + 2
        },
        {
            question: '產品諮詢',
            answer: '關於產品功能的詳細資訊，請參考產品說明書或聯繫銷售團隊。',
            category: '產品資訊',
            usage_count: Math.floor(Math.random() * 35) + 6
        },
        {
            question: '服務問題',
            answer: '如果您遇到服務相關問題，請聯繫客服團隊。',
            category: '客戶服務',
            usage_count: Math.floor(Math.random() * 15) + 1
        },
        {
            question: '系統錯誤報告',
            answer: '請提供錯誤的詳細資訊，包括錯誤訊息和操作步驟。',
            category: '技術支援',
            usage_count: Math.floor(Math.random() * 45) + 12
        }
    ];
    
    // 生成知識庫項目
    const now = new Date();
    for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
        
        const itemIndex = i % knowledgeItems.length;
        const item = knowledgeItems[itemIndex];
        
        const knowledge = {
            id: Date.now() + i,
            question: item.question,
            answer: item.answer,
            category: item.category,
            usage_count: item.usage_count,
            created_at: timestamp.toISOString(),
            updated_at: timestamp.toISOString()
        };
        
        database.knowledge.push(knowledge);
    }
    
    console.log(`✅ 創建了 ${database.knowledge.length} 個知識庫項目`);
}

// 生成用戶狀態數據
function createTestUserStates() {
    console.log('👤 創建測試用戶狀態數據...');
    
    const states = ['online', 'offline', 'busy', 'away'];
    
    for (let i = 0; i < 20; i++) {
        const userState = {
            id: Date.now() + i,
            userId: `user${i + 1}`,
            status: states[Math.floor(Math.random() * states.length)],
            lastActivity: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        database.user_states.push(userState);
    }
    
    console.log(`✅ 創建了 ${database.user_states.length} 個用戶狀態記錄`);
}

// 生成 AI 助理配置數據
function createTestAIConfig() {
    console.log('🤖 創建測試 AI 助理配置...');
    
    const aiConfig = {
        id: 1,
        name: 'EchoChat AI 助理',
        version: '1.0.0',
        status: 'active',
        model: 'gpt-3.5-turbo',
        maxTokens: 2048,
        temperature: 0.7,
        responseTime: 2.3,
        totalRequests: database.chat_history.length,
        successRate: 95.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    database.ai_assistant_config = [aiConfig];
    
    console.log('✅ AI 助理配置創建完成');
}

// 主函數
function main() {
    console.log('🚀 開始創建測試數據...\n');
    
    createTestUsers();
    createTestMessages();
    createTestKnowledge();
    createTestUserStates();
    createTestAIConfig();
    
    // 儲存資料庫
    try {
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
        console.log('\n✅ 測試數據已儲存到資料庫');
        
        console.log('\n📊 數據統計:');
        console.log(`   - 用戶記錄: ${database.user_questions.length}`);
        console.log(`   - 訊息記錄: ${database.chat_history.length}`);
        console.log(`   - 知識庫項目: ${database.knowledge.length}`);
        console.log(`   - 用戶狀態: ${database.user_states.length}`);
        console.log(`   - AI 配置: ${database.ai_assistant_config.length}`);
        
        console.log('\n🎉 測試數據創建完成！');
        console.log('💡 現在儀表板將顯示真實的統計數據');
        
    } catch (error) {
        console.error('❌ 儲存資料庫失敗:', error.message);
    }
}

// 執行主函數
main(); 