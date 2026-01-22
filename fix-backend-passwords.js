const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// 讀取後端數據庫
const backendDbPath = path.join(__dirname, 'echochat-api', 'data', 'database.json');
const backendData = JSON.parse(fs.readFileSync(backendDbPath, 'utf8'));

// 重置密碼
async function resetPasswords() {
    console.log('🔧 重置後端密碼...');
    
    // 重置 admin 密碼
    const adminUser = backendData.staff_accounts.find(user => user.username === 'admin');
    if (adminUser) {
        adminUser.password = await bcrypt.hash('admin123', 10);
        console.log('✅ admin 密碼已重置為: admin123');
    }
    
    // 重置 sunnyharry1 密碼
    const sunnyUser = backendData.staff_accounts.find(user => user.username === 'sunnyharry1');
    if (sunnyUser) {
        sunnyUser.password = await bcrypt.hash('sunnyharry1', 10);
        console.log('✅ sunnyharry1 密碼已重置為: sunnyharry1');
    }
    
    // 重置 user 密碼
    const userUser = backendData.staff_accounts.find(user => user.username === 'user');
    if (userUser) {
        userUser.password = await bcrypt.hash('user123', 10);
        console.log('✅ user 密碼已重置為: user123');
    }
    
    // 保存數據庫
    fs.writeFileSync(backendDbPath, JSON.stringify(backendData, null, 2));
    console.log('💾 數據庫已保存');
    
    console.log('\n📋 重置後的帳號:');
    console.log('- admin / admin123');
    console.log('- sunnyharry1 / sunnyharry1');
    console.log('- user / user123');
}

resetPasswords().catch(console.error); 