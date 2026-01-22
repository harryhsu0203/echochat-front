const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const ADMIN_ROLES = ['admin', 'super_admin'];
const isAdminRole = (role) => ADMIN_ROLES.includes(String(role || '').toLowerCase());

console.log('🔧 創建管理員帳號...');

// 資料庫檔案路徑
const dataDir = './data';
const dataFile = path.join(dataDir, 'database.json');

// 確保資料目錄存在
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化資料結構
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

// 載入現有資料
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

// 創建管理員帳號
async function createAdminAccount() {
    try {
        // 檢查是否已存在管理員帳號
        const existingAdmin = database.staff_accounts.find(account => 
            account.username === 'admin' || isAdminRole(account.role)
        );
        
        if (existingAdmin) {
            console.log('⚠️ 管理員帳號已存在:', existingAdmin.username);
            return;
        }
        
        // 創建管理員帳號
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const adminAccount = {
            id: Date.now(),
            username: 'admin',
            password: hashedPassword,
            name: '系統管理員',
            role: 'admin',
            email: 'admin@echochat.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // 添加到資料庫
        database.staff_accounts.push(adminAccount);
        
        // 儲存資料庫
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
        
        console.log('✅ 管理員帳號創建成功！');
        console.log('👤 帳號資訊:');
        console.log('   - 用戶名: admin');
        console.log('   - 密碼: admin123');
        console.log('   - 角色: admin');
        console.log('   - 姓名: 系統管理員');
        
    } catch (error) {
        console.error('❌ 創建管理員帳號失敗:', error.message);
    }
}

// 創建測試帳號
async function createTestAccount() {
    try {
        // 檢查是否已存在測試帳號
        const existingTest = database.staff_accounts.find(account => 
            account.username === 'test'
        );
        
        if (existingTest) {
            console.log('⚠️ 測試帳號已存在:', existingTest.username);
            return;
        }
        
        // 創建測試帳號
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const testAccount = {
            id: Date.now() + 1,
            username: 'test',
            password: hashedPassword,
            name: '測試用戶',
            role: 'staff',
            email: 'test@echochat.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // 添加到資料庫
        database.staff_accounts.push(testAccount);
        
        // 儲存資料庫
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
        
        console.log('✅ 測試帳號創建成功！');
        console.log('👤 帳號資訊:');
        console.log('   - 用戶名: test');
        console.log('   - 密碼: test123');
        console.log('   - 角色: staff');
        console.log('   - 姓名: 測試用戶');
        
    } catch (error) {
        console.error('❌ 創建測試帳號失敗:', error.message);
    }
}

// 顯示所有帳號
function showAllAccounts() {
    console.log('\n📋 所有帳號列表:');
    database.staff_accounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.username} (${account.role}) - ${account.name}`);
    });
}

// 主函數
async function main() {
    console.log('🚀 開始初始化帳號...\n');
    
    await createAdminAccount();
    await createTestAccount();
    
    console.log('\n📊 資料庫統計:');
    console.log(`   - 總帳號數: ${database.staff_accounts.length}`);
    console.log(`   - 管理員數: ${database.staff_accounts.filter(a => isAdminRole(a.role)).length}`);
    console.log(`   - 員工數: ${database.staff_accounts.filter(a => a.role === 'staff').length}`);
    
    showAllAccounts();
    
    console.log('\n🎉 帳號初始化完成！');
    console.log('\n💡 您現在可以使用以下帳號登入:');
    console.log('   - 管理員: admin / admin123');
    console.log('   - 測試用戶: test / test123');
}

// 執行主函數
main().catch(console.error); 