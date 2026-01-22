const fs = require('fs');
const path = require('path');

// 載入資料庫
function loadDatabase() {
    // 檢查兩個可能的位置
    const dbPaths = [
        path.join(__dirname, 'echochat-api', 'data', 'database.json'),
        path.join(__dirname, 'data', 'database.json')
    ];
    
    for (const dbPath of dbPaths) {
        if (fs.existsSync(dbPath)) {
            console.log(`📂 使用資料庫: ${dbPath}\n`);
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        }
    }
    
    console.log('❌ 找不到資料庫文件');
    return { line_api_settings: [] };
}

// 檢查 LINE API 設定狀態
function checkLineStatus() {
    console.log('🔍 檢查 LINE API 設定狀態...\n');
    
    const database = loadDatabase();
    const settings = database.line_api_settings || [];
    
    if (settings.length === 0) {
        console.log('❌ 沒有找到任何 LINE API 設定記錄');
        console.log('💡 請先到 LINE Token Manager 頁面設定您的 Channel Access Token 和 Channel Secret');
        return;
    }
    
    console.log(`📊 找到 ${settings.length} 筆 LINE API 設定記錄：\n`);
    
    settings.forEach((setting, index) => {
        console.log(`--- 記錄 #${index + 1} ---`);
        console.log(`用戶 ID: ${setting.user_id}`);
        console.log(`Channel Access Token: ${setting.channel_access_token ? '已設定' : '未設定'}`);
        console.log(`Channel Secret: ${setting.channel_secret ? '已設定' : '未設定'}`);
        console.log(`Webhook URL: ${setting.webhook_url || '未設定'}`);
        console.log(`啟用狀態 (isActive): ${setting.isActive !== false ? '✅ 啟用' : '❌ 停用'}`);
        console.log(`更新時間: ${setting.updated_at || '未知'}`);
        console.log('');
    });
    
    // 檢查是否有停用的設定
    const inactiveSettings = settings.filter(s => s.isActive === false);
    if (inactiveSettings.length > 0) {
        console.log(`⚠️  發現 ${inactiveSettings.length} 筆停用的設定`);
        console.log('💡 如果您的 LINE 客服顯示「未啟動」，可能是因為 isActive 被設置為 false');
        console.log('💡 您可以：');
        console.log('   1. 到 LINE Token Manager 頁面，將開關切換為「啟用」');
        console.log('   2. 或執行修復腳本：node fix-line-status.js');
    } else {
        console.log('✅ 所有設定都是啟用狀態');
    }
}

// 執行檢查
checkLineStatus();

