const fs = require('fs');
const path = require('path');

// 備份資料庫
const backupDatabase = () => {
    try {
        const dataDir = './data';
        const dataFile = path.join(dataDir, 'database.json');
        const backupDir = './backups';
        const backupFile = path.join(backupDir, `database_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        
        // 確保備份目錄存在
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // 檢查原始資料檔案是否存在
        if (fs.existsSync(dataFile)) {
            // 複製資料檔案到備份目錄
            fs.copyFileSync(dataFile, backupFile);
            console.log(`✅ 資料庫已備份到: ${backupFile}`);
            
            // 讀取並顯示用戶統計
            const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
            const userCount = data.staff_accounts ? data.staff_accounts.length : 0;
            console.log(`📊 當前用戶數量: ${userCount}`);
            
            if (data.staff_accounts) {
                console.log('👥 用戶列表:');
                data.staff_accounts.forEach(user => {
                    console.log(`   - ${user.username} (${user.role})`);
                });
            }
        } else {
            console.log('⚠️ 原始資料檔案不存在，跳過備份');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 備份失敗:', error.message);
        return false;
    }
};

// 恢復資料庫
const restoreDatabase = () => {
    try {
        const dataDir = './data';
        const dataFile = path.join(dataDir, 'database.json');
        const backupDir = './backups';
        
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
            fs.copyFileSync(latestBackup, dataFile);
            console.log(`✅ 資料庫已從備份恢復: ${latestBackup}`);
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
    const command = process.argv[2];
    
    if (command === 'backup') {
        console.log('🔄 開始備份資料庫...');
        backupDatabase();
    } else if (command === 'restore') {
        console.log('🔄 開始恢復資料庫...');
        restoreDatabase();
    } else {
        console.log('使用方法:');
        console.log('  node backup-db.js backup  - 備份資料庫');
        console.log('  node backup-db.js restore - 恢復資料庫');
    }
}

module.exports = { backupDatabase, restoreDatabase }; 