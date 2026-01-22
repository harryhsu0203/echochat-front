const fs = require('fs');
const path = require('path');

// 資料庫檔案路徑
const dbPath = path.join(__dirname, 'data', 'database.json');

function viewAccounts() {
    console.log('🔍 檢視系統帳號...\n');
    
    try {
        // 檢查資料庫檔案是否存在
        if (!fs.existsSync(dbPath)) {
            console.log('❌ 資料庫檔案不存在');
            console.log('📁 預期路徑:', dbPath);
            console.log('\n💡 系統會在首次啟動時自動創建預設管理員帳號：');
            console.log('   帳號: sunnyharry1');
            console.log('   密碼: gele1227');
            console.log('   角色: admin');
            return;
        }
        
        // 讀取資料庫檔案
        const data = fs.readFileSync(dbPath, 'utf8');
        const database = JSON.parse(data);
        
        if (!database.staff_accounts || database.staff_accounts.length === 0) {
            console.log('❌ 沒有找到任何帳號');
            console.log('\n💡 系統會在首次啟動時自動創建預設管理員帳號：');
            console.log('   帳號: sunnyharry1');
            console.log('   密碼: gele1227');
            console.log('   角色: admin');
            return;
        }
        
        console.log(`✅ 找到 ${database.staff_accounts.length} 個帳號：\n`);
        
        // 顯示所有帳號
        database.staff_accounts.forEach((account, index) => {
            console.log(`📋 帳號 ${index + 1}:`);
            console.log(`   ID: ${account.id}`);
            console.log(`   用戶名: ${account.username}`);
            console.log(`   姓名: ${account.name || '未設定'}`);
            console.log(`   角色: ${account.role}`);
            console.log(`   電子郵件: ${account.email || '未設定'}`);
            console.log(`   創建時間: ${account.created_at || '未知'}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ 讀取資料庫失敗:', error.message);
    }
}

// 執行檢視
viewAccounts(); 