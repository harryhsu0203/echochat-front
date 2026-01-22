const fs = require('fs');

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

console.log('\n📋 同步後的用戶列表：');
backendDb.staff_accounts.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} (${user.role})`);
    console.log(`   密碼長度: ${user.password.length}`);
    console.log(`   密碼開頭: ${user.password.substring(0, 20)}...`);
});