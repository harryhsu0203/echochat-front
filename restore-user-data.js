const fs = require('fs');
const path = require('path');

// 恢復用戶資料
const restoreUserData = () => {
    try {
        const backupDir = './backups';
        const dataDir = './data';
        const dataFile = path.join(dataDir, 'database.json');
        
        // 確保資料目錄存在
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // 找到最新的備份檔案
        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('database_backup_') && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (backupFiles.length > 0) {
            const latestBackup = path.join(backupDir, backupFiles[0]);
            const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
            
            // 檢查當前資料庫是否存在
            let currentData = {
                staff_accounts: [],
                user_questions: [],
                knowledge: [],
                user_states: [],
                chat_history: [],
                ai_assistant_config: [],
                email_verifications: []
            };
            
            if (fs.existsSync(dataFile)) {
                currentData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
            }
            
            // 合併用戶資料，保留現有用戶，添加備份中的新用戶
            const existingUsernames = new Set(currentData.staff_accounts.map(user => user.username));
            const newUsers = backupData.staff_accounts.filter(user => !existingUsernames.has(user.username));
            
            if (newUsers.length > 0) {
                currentData.staff_accounts = [...currentData.staff_accounts, ...newUsers];
                fs.writeFileSync(dataFile, JSON.stringify(currentData, null, 2));
                
                console.log(`✅ 已恢復 ${newUsers.length} 個用戶資料`);
                newUsers.forEach(user => {
                    console.log(`   - ${user.username} (${user.role})`);
                });
            } else {
                console.log('ℹ️ 沒有新的用戶資料需要恢復');
            }
            
            // 顯示當前所有用戶
            console.log(`📊 當前總用戶數量: ${currentData.staff_accounts.length}`);
            currentData.staff_accounts.forEach(user => {
                console.log(`   - ${user.username} (${user.role})`);
            });
            
            return true;
        } else {
            console.log('⚠️ 沒有找到備份檔案');
            return false;
        }
    } catch (error) {
        console.error('❌ 恢復失敗:', error.message);
        return false;
    }
};

// 如果直接執行此腳本
if (require.main === module) {
    console.log('🔄 開始恢復用戶資料...');
    restoreUserData();
}

module.exports = { restoreUserData }; 