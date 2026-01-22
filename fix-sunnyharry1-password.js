const fs = require('fs');
const bcrypt = require('bcryptjs');

console.log('🔧 修復 sunnyharry1 密碼...');

async function fixPassword() {
    try {
        // 讀取資料庫
        const backendDbPath = 'echochat-api/data/database.json';
        const frontendDbPath = 'data/database.json';
        
        let backendDb = JSON.parse(fs.readFileSync(backendDbPath, 'utf8'));
        let frontendDb = JSON.parse(fs.readFileSync(frontendDbPath, 'utf8'));
        
        console.log('📊 目前的 sunnyharry1 帳號資料：');
        const sunnyUser = backendDb.staff_accounts.find(user => user.username === 'sunnyharry1');
        if (sunnyUser) {
            console.log(`   用戶名: ${sunnyUser.username}`);
            console.log(`   姓名: ${sunnyUser.name}`);
            console.log(`   角色: ${sunnyUser.role}`);
            console.log(`   舊密碼雜湊: ${sunnyUser.password.substring(0, 20)}...`);
        }
        
        // 生成 gele1227 的正確雜湊值
        console.log('\n🔐 生成新的密碼雜湊...');
        const newPasswordHash = await bcrypt.hash('gele1227', 10);
        console.log(`   新密碼雜湊: ${newPasswordHash.substring(0, 20)}...`);
        
        // 驗證新雜湊是否正確
        const isValid = await bcrypt.compare('gele1227', newPasswordHash);
        console.log(`   密碼驗證: ${isValid ? '✅ 正確' : '❌ 錯誤'}`);
        
        if (!isValid) {
            throw new Error('生成的密碼雜湊無效');
        }
        
        // 更新後端資料庫
        console.log('\n💾 更新後端資料庫...');
        if (sunnyUser) {
            sunnyUser.password = newPasswordHash;
            sunnyUser.updated_at = new Date().toISOString();
        } else {
            // 如果用戶不存在，創建新用戶
            console.log('   用戶不存在，創建新用戶...');
            backendDb.staff_accounts.push({
                id: Math.max(...backendDb.staff_accounts.map(a => a.id), 0) + 1,
                username: 'sunnyharry1',
                password: newPasswordHash,
                name: '系統管理員',
                role: 'admin',
                email: 'sunnyharry1@echochat.com',
                created_at: new Date().toISOString()
            });
        }
        
        fs.writeFileSync(backendDbPath, JSON.stringify(backendDb, null, 2));
        console.log('   ✅ 後端資料庫已更新');
        
        // 更新前端資料庫
        console.log('\n💾 更新前端資料庫...');
        const frontendSunnyUser = frontendDb.staff_accounts.find(user => user.username === 'sunnyharry1');
        if (frontendSunnyUser) {
            frontendSunnyUser.password = newPasswordHash;
            frontendSunnyUser.updated_at = new Date().toISOString();
        } else {
            frontendDb.staff_accounts.push({
                id: Math.max(...frontendDb.staff_accounts.map(a => a.id), 0) + 1,
                username: 'sunnyharry1',
                password: newPasswordHash,
                name: '系統管理員',
                role: 'admin',
                email: 'sunnyharry1@echochat.com',
                created_at: new Date().toISOString()
            });
        }
        
        fs.writeFileSync(frontendDbPath, JSON.stringify(frontendDb, null, 2));
        console.log('   ✅ 前端資料庫已更新');
        
        console.log('\n🎉 密碼修復完成！');
        console.log('\n📋 測試資訊：');
        console.log('   用戶名: sunnyharry1');
        console.log('   密碼: gele1227');
        console.log('   角色: admin');
        
        // 測試新密碼
        console.log('\n🧪 測試新密碼...');
        const testResult = await bcrypt.compare('gele1227', newPasswordHash);
        console.log(`   密碼測試結果: ${testResult ? '✅ 成功' : '❌ 失敗'}`);
        
    } catch (error) {
        console.error('❌ 修復密碼時發生錯誤:', error);
    }
}

fixPassword();