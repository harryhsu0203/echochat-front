const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 添加新用戶
const addUser = async (username, password, name = '', role = 'user', email = '') => {
    try {
        const dataDir = './data';
        const dataFile = path.join(dataDir, 'database.json');
        
        // 確保資料目錄存在
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // 讀取現有資料
        let database = {
            staff_accounts: [],
            user_questions: [],
            knowledge: [],
            user_states: [],
            chat_history: [],
            ai_assistant_config: [],
            email_verifications: []
        };
        
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            database = JSON.parse(data);
        }
        
        // 檢查用戶是否已存在
        const existingUser = database.staff_accounts.find(user => user.username === username);
        if (existingUser) {
            console.log(`⚠️ 用戶 ${username} 已存在`);
            return false;
        }
        
        // 加密密碼
        const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
            });
        });
        
        // 創建新用戶
        const newUser = {
            id: database.staff_accounts.length + 1,
            username: username,
            password: hash,
            name: name || username,
            role: role,
            email: email,
            created_at: new Date().toISOString()
        };
        
        // 添加到資料庫
        database.staff_accounts.push(newUser);
        
        // 儲存資料
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
        
        console.log(`✅ 用戶 ${username} 已成功添加`);
        console.log(`📧 帳號: ${username}`);
        console.log(`🔑 密碼: ${password}`);
        console.log(`👤 角色: ${role}`);
        
        // 顯示當前所有用戶
        console.log(`\n📊 當前總用戶數量: ${database.staff_accounts.length}`);
        console.log('👥 用戶列表:');
        database.staff_accounts.forEach(user => {
            console.log(`   - ${user.username} (${user.role})`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ 添加用戶失敗:', error.message);
        return false;
    }
};

// 如果直接執行此腳本
if (require.main === module) {
    const username = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || '';
    const role = process.argv[5] || 'user';
    const email = process.argv[6] || '';
    
    if (!username || !password) {
        console.log('使用方法:');
        console.log('  node add-user.js <username> <password> [name] [role] [email]');
        console.log('');
        console.log('範例:');
        console.log('  node add-user.js BIGCHI1215 A891215b "大智" user "bigchi@example.com"');
        process.exit(1);
    }
    
    console.log('🔄 開始添加用戶...');
    addUser(username, password, name, role, email);
}

module.exports = { addUser }; 