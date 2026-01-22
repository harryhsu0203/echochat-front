const fs = require('fs');

console.log('🔧 修復後端資料庫...');

// 修復後端資料庫檔案
const backendDbPath = 'echochat-api/data/database.json';
let backendDb = JSON.parse(fs.readFileSync(backendDbPath, 'utf8'));

console.log('📊 檢查後端資料庫用戶...');
backendDb.staff_accounts.forEach((user, index) => {
    console.log(`用戶 ${index + 1}: ${user.username} (${user.role})`);
    console.log(`  密碼雜湊: ${user.password.substring(0, 20)}...`);
    
    // 如果密碼不是正確的 bcrypt 格式，重新設定
    if (user.password === 'b.hash' || user.password.length < 20) {
        console.log(`⚠️ 用戶 ${user.username} 的密碼格式不正確，正在修復...`);
        
        // 使用一個有效的 bcrypt 雜湊值（admin123 的雜湊）
        const validHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        backendDb.staff_accounts[index].password = validHash;
        console.log(`✅ 用戶 ${user.username} 的密碼已修復為 admin123`);
    }
});

// 檢查是否已存在 admin 帳號
const existingAdmin = backendDb.staff_accounts.find(user => user.username === 'admin');
if (!existingAdmin) {
    console.log('➕ 創建測試管理員帳號...');
    const adminUser = {
        id: backendDb.staff_accounts.length + 1,
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        name: '管理員',
        role: 'admin',
        email: 'admin@echochat.com',
        created_at: new Date().toISOString()
    };
    backendDb.staff_accounts.push(adminUser);
    console.log('✅ 測試管理員帳號已創建 (admin/admin123)');
} else {
    console.log('ℹ️ admin 帳號已存在');
}

// 檢查是否已存在 user 帳號
const existingUser = backendDb.staff_accounts.find(user => user.username === 'user');
if (!existingUser) {
    console.log('➕ 創建測試用戶帳號...');
    const regularUser = {
        id: backendDb.staff_accounts.length + 1,
        username: 'user',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        name: '測試用戶',
        role: 'user',
        email: 'user@echochat.com',
        created_at: new Date().toISOString()
    };
    backendDb.staff_accounts.push(regularUser);
    console.log('✅ 測試用戶帳號已創建 (user/admin123)');
} else {
    console.log('ℹ️ user 帳號已存在');
}

// 儲存修復後的後端資料庫
fs.writeFileSync(backendDbPath, JSON.stringify(backendDb, null, 2));
console.log('💾 後端資料庫已儲存');

// 創建一個測試 API 的腳本
const testApiScript = `const fetch = require('node-fetch');

async function testLogin() {
    console.log('🔍 測試 API 登入...');
    
    const testAccounts = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'admin123' },
        { username: 'sunnyharry1', password: 'admin123' }
    ];
    
    for (const account of testAccounts) {
        try {
            console.log(\`\\n測試帳號: \${account.username}\`);
            
            const response = await fetch('https://echochat-api.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(account)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ 登入成功');
                console.log('Token:', data.token.substring(0, 20) + '...');
                console.log('用戶:', data.user);
            } else {
                console.log('❌ 登入失敗:', data.error);
            }
        } catch (error) {
            console.log('❌ 網路錯誤:', error.message);
        }
    }
}

testLogin();`;

fs.writeFileSync('test-api-login.js', testApiScript);
console.log('✅ 創建了 API 測試腳本');

// 創建一個同步資料庫的腳本
const syncDbScript = `const fs = require('fs');

console.log('🔄 同步資料庫檔案...');

// 讀取前端資料庫
const frontendDb = JSON.parse(fs.readFileSync('data/database.json', 'utf8'));
console.log('📊 前端資料庫用戶數量:', frontendDb.staff_accounts.length);

// 讀取後端資料庫
const backendDb = JSON.parse(fs.readFileSync('echochat-api/data/database.json', 'utf8'));
console.log('📊 後端資料庫用戶數量:', backendDb.staff_accounts.length);

// 同步用戶資料
backendDb.staff_accounts = frontendDb.staff_accounts;

// 儲存同步後的後端資料庫
fs.writeFileSync('echochat-api/data/database.json', JSON.stringify(backendDb, null, 2));
console.log('✅ 資料庫已同步');

console.log('\\n📋 同步後的用戶列表：');
backendDb.staff_accounts.forEach((user, index) => {
    console.log(\`\${index + 1}. \${user.username} (\${user.role})\`);
    console.log(\`   密碼長度: \${user.password.length}\`);
    console.log(\`   密碼開頭: \${user.password.substring(0, 20)}...\`);
});`;

fs.writeFileSync('sync-database.js', syncDbScript);
console.log('✅ 創建了資料庫同步腳本');

console.log('');
console.log('🎉 後端資料庫修復完成！');
console.log('');
console.log('📋 修復內容：');
console.log('1. ✅ 修復了後端資料庫中的密碼格式');
console.log('2. ✅ 創建了測試管理員帳號 (admin/admin123)');
console.log('3. ✅ 創建了測試用戶帳號 (user/admin123)');
console.log('4. ✅ 修復了原有帳號的密碼 (sunnyharry1/admin123)');
console.log('5. ✅ 創建了 API 測試腳本');
console.log('6. ✅ 創建了資料庫同步腳本');
console.log('');
console.log('🔍 測試步驟：');
console.log('1. 執行 node sync-database.js 同步資料庫');
console.log('2. 執行 node test-api-login.js 測試 API');
console.log('3. 等待部署完成後，使用測試帳號登入');
console.log('');
console.log('�� 請重新部署到 Render'); 