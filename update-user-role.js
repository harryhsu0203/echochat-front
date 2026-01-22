const fs = require('fs');
const path = require('path');

// 修改用戶權限
const updateUserRole = async (username, newRole) => {
    try {
        const dataDir = './data';
        const dataFile = path.join(dataDir, 'database.json');
        
        // 檢查資料檔案是否存在
        if (!fs.existsSync(dataFile)) {
            console.error('❌ 資料庫檔案不存在');
            return false;
        }
        
        // 讀取現有資料
        const data = fs.readFileSync(dataFile, 'utf8');
        const database = JSON.parse(data);
        
        // 尋找用戶
        const userIndex = database.staff_accounts.findIndex(user => user.username === username);
        if (userIndex === -1) {
            console.error(`❌ 用戶 ${username} 不存在`);
            return false;
        }
        
        const user = database.staff_accounts[userIndex];
        const oldRole = user.role;
        
        // 更新權限
        database.staff_accounts[userIndex].role = newRole;
        
        // 儲存資料
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
        
        console.log(`✅ 用戶 ${username} 權限已成功更新`);
        console.log(`👤 用戶: ${username}`);
        console.log(`🔄 權限變更: ${oldRole} → ${newRole}`);
        
        // 顯示當前所有用戶
        console.log(`\n📊 當前總用戶數量: ${database.staff_accounts.length}`);
        console.log('👥 用戶列表:');
        database.staff_accounts.forEach(user => {
            console.log(`   - ${user.username} (${user.role})`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ 更新用戶權限失敗:', error.message);
        return false;
    }
};

// 如果直接執行此腳本
if (require.main === module) {
    const username = process.argv[2];
    const newRole = process.argv[3];
    
    if (!username || !newRole) {
        console.log('使用方法:');
        console.log('  node update-user-role.js <username> <new_role>');
        console.log('');
        console.log('範例:');
        console.log('  node update-user-role.js BIGCHI1215 admin');
        console.log('  node update-user-role.js testuser user');
        process.exit(1);
    }
    
    console.log('🔄 開始更新用戶權限...');
    updateUserRole(username, newRole);
}

module.exports = { updateUserRole }; 