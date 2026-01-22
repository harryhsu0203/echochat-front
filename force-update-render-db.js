const fs = require('fs');

console.log('🚀 強制更新 Render 資料庫...');

// 這是一個有效的 admin123 密碼雜湊
const validAdmin123Hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

try {
    // 讀取後端資料庫
    const backendDbPath = 'echochat-api/data/database.json';
    let backendDb = JSON.parse(fs.readFileSync(backendDbPath, 'utf8'));
    
    console.log('📊 目前後端資料庫用戶：');
    backendDb.staff_accounts.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.role}) - 密碼長度: ${user.password.length}`);
    });
    
    // 更新所有用戶的密碼為 admin123
    console.log('\n🔐 更新所有用戶密碼為 admin123...');
    backendDb.staff_accounts.forEach(user => {
        const oldPassword = user.password.substring(0, 20);
        user.password = validAdmin123Hash;
        user.updated_at = new Date().toISOString();
        console.log(`   ✅ ${user.username}: ${oldPassword}... → ${user.password.substring(0, 20)}...`);
    });
    
    // 確保 sunnyharry1 存在
    const sunnyUser = backendDb.staff_accounts.find(user => user.username === 'sunnyharry1');
    if (!sunnyUser) {
        console.log('\n➕ 創建 sunnyharry1 用戶...');
        backendDb.staff_accounts.push({
            id: Math.max(...backendDb.staff_accounts.map(a => a.id), 0) + 1,
            username: 'sunnyharry1',
            password: validAdmin123Hash,
            name: '系統管理員',
            role: 'admin',
            email: 'sunnyharry1@echochat.com',
            created_at: new Date().toISOString()
        });
        console.log('   ✅ sunnyharry1 用戶已創建');
    }
    
    // 儲存後端資料庫
    fs.writeFileSync(backendDbPath, JSON.stringify(backendDb, null, 2));
    console.log('\n💾 後端資料庫已更新');
    
    // 同步前端資料庫
    const frontendDbPath = 'data/database.json';
    let frontendDb = JSON.parse(fs.readFileSync(frontendDbPath, 'utf8'));
    
    // 完全同步前端資料庫
    frontendDb.staff_accounts = JSON.parse(JSON.stringify(backendDb.staff_accounts));
    fs.writeFileSync(frontendDbPath, JSON.stringify(frontendDb, null, 2));
    console.log('💾 前端資料庫已同步');
    
    console.log('\n🎉 資料庫強制更新完成！');
    console.log('\n📋 所有帳號現在都使用密碼: admin123');
    console.log('   - sunnyharry1 / admin123 (管理員)');
    console.log('   - admin / admin123 (管理員)');
    console.log('   - user / admin123 (用戶)');
    
    console.log('\n⚠️  重要: 這將覆蓋 Render 上的資料庫');
    console.log('   請立即部署此更新到 Render');
    
} catch (error) {
    console.error('❌ 更新資料庫時發生錯誤:', error);
}