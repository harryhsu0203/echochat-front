const fs = require('fs');
const path = require('path');

// 檢查 Render 雲端的資料庫路徑
function checkRenderAccounts() {
    console.log('🔍 檢查 Render 雲端帳號資料...\n');
    
    // Render 雲端的資料庫路徑
    const renderDataDir = '/opt/render/project/src/data';
    const renderDataFile = path.join(renderDataDir, 'database.json');
    
    // 本地開發路徑
    const localDataDir = './data';
    const localDataFile = path.join(localDataDir, 'database.json');
    
    console.log('📁 Render 雲端路徑:', renderDataFile);
    console.log('📁 本地開發路徑:', localDataFile);
    console.log('');
    
    // 檢查本地資料庫
    console.log('🔍 檢查本地資料庫...');
    if (fs.existsSync(localDataFile)) {
        try {
            const data = fs.readFileSync(localDataFile, 'utf8');
            const database = JSON.parse(data);
            
            if (database.staff_accounts && database.staff_accounts.length > 0) {
                console.log(`✅ 本地找到 ${database.staff_accounts.length} 個帳號：`);
                database.staff_accounts.forEach((account, index) => {
                    console.log(`   ${index + 1}. ${account.username} (${account.role})`);
                });
            } else {
                console.log('❌ 本地沒有帳號資料');
            }
        } catch (error) {
            console.log('❌ 讀取本地資料庫失敗:', error.message);
        }
    } else {
        console.log('❌ 本地資料庫檔案不存在');
    }
    
    console.log('\n💡 關於 Render 雲端帳號：');
    console.log('   1. 您的帳號資料儲存在 Render 的持久化磁碟中');
    console.log('   2. 路徑: /opt/render/project/src/data/database.json');
    console.log('   3. 這個磁碟會在部署時自動掛載');
    console.log('   4. 資料會持久保存，不會因為重新部署而丟失');
    
    console.log('\n📋 預設管理員帳號（如果尚未創建）：');
    console.log('   帳號: sunnyharry1');
    console.log('   密碼: gele1227');
    console.log('   角色: admin');
    
    console.log('\n🌐 如何訪問：');
    console.log('   1. 等待 Render 部署完成');
    console.log('   2. 訪問您的 Render 應用網址');
    console.log('   3. 使用上述帳號密碼登入');
    console.log('   4. 或使用忘記密碼功能重設密碼');
}

// 執行檢查
checkRenderAccounts(); 