const fs = require('fs');

console.log('🔍 檢查資料庫狀態...');

const database = JSON.parse(fs.readFileSync('data/database.json', 'utf8'));

console.log('📊 用戶列表：');
database.staff_accounts.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username} (${user.role})`);
    console.log(`   密碼長度: ${user.password.length}`);
    console.log(`   密碼開頭: ${user.password.substring(0, 20)}...`);
    console.log(`   電子郵件: ${user.email}`);
    console.log(`   創建時間: ${user.created_at}`);
    console.log('');
});