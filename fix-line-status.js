const fs = require('fs');
const path = require('path');

// 載入資料庫
let currentDbPath = null;
function loadDatabase() {
    // 檢查兩個可能的位置
    const dbPaths = [
        path.join(__dirname, 'echochat-api', 'data', 'database.json'),
        path.join(__dirname, 'data', 'database.json')
    ];
    
    for (const dbPath of dbPaths) {
        if (fs.existsSync(dbPath)) {
            currentDbPath = dbPath;
            console.log(`📂 使用資料庫: ${dbPath}\n`);
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        }
    }
    
    console.log('❌ 找不到資料庫文件');
    return { line_api_settings: [] };
}

// 儲存資料庫
function saveDatabase(database) {
    if (!currentDbPath) {
        // 如果沒有找到現有資料庫，使用預設位置
        currentDbPath = path.join(__dirname, 'echochat-api', 'data', 'database.json');
    }
    
    const dbDir = path.dirname(currentDbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(currentDbPath, JSON.stringify(database, null, 2), 'utf8');
}

// 修復 LINE API 設定狀態
function fixLineStatus() {
    console.log('🔧 開始修復 LINE API 設定狀態...\n');
    
    const database = loadDatabase();
    const settings = database.line_api_settings || [];
    
    if (settings.length === 0) {
        console.log('❌ 沒有找到任何 LINE API 設定記錄');
        console.log('💡 請先到 LINE Token Manager 頁面設定您的 Channel Access Token 和 Channel Secret');
        return;
    }
    
    let fixedCount = 0;
    
    settings.forEach((setting, index) => {
        const beforeStatus = setting.isActive !== false ? '啟用' : '停用';
        
        // 如果 isActive 是 false 或 undefined，設置為 true
        if (setting.isActive === false || setting.isActive === undefined) {
            setting.isActive = true;
            setting.updated_at = new Date().toISOString();
            fixedCount++;
            console.log(`✅ 記錄 #${index + 1} (用戶 ID: ${setting.user_id}): ${beforeStatus} → 啟用`);
        } else {
            console.log(`✓ 記錄 #${index + 1} (用戶 ID: ${setting.user_id}): 已經是啟用狀態`);
        }
    });
    
    if (fixedCount > 0) {
        saveDatabase(database);
        console.log(`\n🎉 已修復 ${fixedCount} 筆記錄`);
        console.log('💡 請重新整理 LINE Token Manager 頁面查看更新後的狀態');
    } else {
        console.log('\n✅ 所有記錄都已經是啟用狀態，無需修復');
    }
}

// 執行修復
fixLineStatus();

