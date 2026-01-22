const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

console.log('🔧 重置密碼工具...\n');

// 資料庫檔案路徑
const dataDir = './data';
const dataFile = path.join(dataDir, 'database.json');

// 載入資料庫
function loadDatabase() {
    if (!fs.existsSync(dataFile)) {
        console.error('❌ 資料庫檔案不存在:', dataFile);
        return null;
    }
    
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ 載入資料庫失敗:', error.message);
        return null;
    }
}

// 儲存資料庫
function saveDatabase(database) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
        console.log('✅ 資料庫已儲存');
        return true;
    } catch (error) {
        console.error('❌ 儲存資料庫失敗:', error.message);
        return false;
    }
}

// 重置指定帳號的密碼
async function resetPassword(username, newPassword) {
    const database = loadDatabase();
    if (!database) return false;
    
    const account = database.staff_accounts.find(acc => acc.username === username);
    if (!account) {
        console.log(`❌ 找不到帳號: ${username}`);
        return false;
    }
    
    // 加密新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    account.updated_at = new Date().toISOString();
    
    if (saveDatabase(database)) {
        console.log(`✅ 帳號 ${username} 的密碼已重置為: ${newPassword}`);
        return true;
    }
    return false;
}

// 創建新帳號
async function createAccount(username, password, name, role = 'staff', email = '') {
    const database = loadDatabase();
    if (!database) return false;
    
    // 檢查帳號是否已存在
    const existingAccount = database.staff_accounts.find(acc => acc.username === username);
    if (existingAccount) {
        console.log(`⚠️ 帳號 ${username} 已存在`);
        return false;
    }
    
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 創建新帳號
    const newAccount = {
        id: Date.now(),
        username: username,
        password: hashedPassword,
        name: name,
        role: role,
        email: email || `${username}@echochat.com`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // 添加到資料庫
    database.staff_accounts.push(newAccount);
    
    if (saveDatabase(database)) {
        console.log(`✅ 新帳號創建成功:`);
        console.log(`   - 用戶名: ${username}`);
        console.log(`   - 密碼: ${password}`);
        console.log(`   - 姓名: ${name}`);
        console.log(`   - 角色: ${role}`);
        return true;
    }
    return false;
}

// 顯示所有帳號
function showAllAccounts() {
    const database = loadDatabase();
    if (!database) return;
    
    console.log('\n📋 所有帳號列表:');
    database.staff_accounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.username} (${account.role}) - ${account.name}`);
    });
}

// 主函數
async function main() {
    console.log('請選擇操作:');
    console.log('1. 重置現有帳號密碼');
    console.log('2. 創建新帳號');
    console.log('3. 顯示所有帳號');
    console.log('4. 退出');
    
    // 這裡可以根據需要修改
    const choice = process.argv[2] || '3';
    
    switch (choice) {
        case '1':
            const username = process.argv[3] || 'admin';
            const newPassword = process.argv[4] || 'your-new-password';
            await resetPassword(username, newPassword);
            break;
        case '2':
            const newUsername = process.argv[3] || 'newuser';
            const newUserPassword = process.argv[4] || 'password123';
            const newUserName = process.argv[5] || '新用戶';
            const newUserRole = process.argv[6] || 'staff';
            await createAccount(newUsername, newUserPassword, newUserName, newUserRole);
            break;
        case '3':
            showAllAccounts();
            break;
        case '4':
            console.log('👋 再見！');
            break;
        default:
            console.log('❌ 無效的選擇');
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { resetPassword, createAccount, showAllAccounts }; 