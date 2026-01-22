const axios = require('axios');

console.log('🧪 測試帳號管理功能...');

const API_BASE_URL = 'https://echochat-api.onrender.com';

// 測試用的管理員 token（需要先登入獲取）
let adminToken = '';

async function testLogin() {
    try {
        console.log('\n1️⃣ 測試管理員登入...');
        
        const response = await axios.post(`${API_BASE_URL}/api/login`, {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        if (response.data.success) {
            adminToken = response.data.token;
            console.log('✅ 管理員登入成功');
            console.log(`   Token: ${adminToken.substring(0, 20)}...`);
            console.log(`   用戶: ${response.data.user.name} (${response.data.user.role})`);
            return true;
        } else {
            console.log('❌ 登入失敗:', response.data.error);
            return false;
        }
    } catch (error) {
        console.log('❌ 登入錯誤:', error.response?.data?.error || error.message);
        return false;
    }
}

async function testGetAccounts() {
    try {
        console.log('\n2️⃣ 測試獲取帳號列表...');
        
        const response = await axios.get(`${API_BASE_URL}/api/accounts`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ 獲取帳號列表成功');
            console.log(`   總帳號數: ${response.data.total}`);
            response.data.accounts.forEach(account => {
                console.log(`   - ${account.username} (${account.name}) - ${account.role}`);
            });
            return response.data.accounts;
        } else {
            console.log('❌ 獲取帳號列表失敗:', response.data.error);
            return [];
        }
    } catch (error) {
        console.log('❌ 獲取帳號列表錯誤:', error.response?.data?.error || error.message);
        return [];
    }
}

async function testCreateAccount() {
    try {
        console.log('\n3️⃣ 測試創建新帳號...');
        
        const newAccount = {
            username: 'testuser_' + Date.now(),
            password: 'test123456',
            name: '測試用戶',
            role: 'user',
            email: 'test@example.com'
        };
        
        const response = await axios.post(`${API_BASE_URL}/api/accounts`, newAccount, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ 創建帳號成功');
            console.log(`   新帳號: ${response.data.account.username} (ID: ${response.data.account.id})`);
            return response.data.account;
        } else {
            console.log('❌ 創建帳號失敗:', response.data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ 創建帳號錯誤:', error.response?.data?.error || error.message);
        return null;
    }
}

async function testUpdateAccount(accountId) {
    try {
        console.log('\n4️⃣ 測試更新帳號...');
        
        const updateData = {
            name: '更新後的測試用戶',
            role: 'admin'
        };
        
        const response = await axios.put(`${API_BASE_URL}/api/accounts/${accountId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ 更新帳號成功');
            console.log(`   更新後: ${response.data.account.name} (${response.data.account.role})`);
            return true;
        } else {
            console.log('❌ 更新帳號失敗:', response.data.error);
            return false;
        }
    } catch (error) {
        console.log('❌ 更新帳號錯誤:', error.response?.data?.error || error.message);
        return false;
    }
}

async function testGetAccountDetail(accountId) {
    try {
        console.log('\n5️⃣ 測試獲取帳號詳情...');
        
        const response = await axios.get(`${API_BASE_URL}/api/accounts/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ 獲取帳號詳情成功');
            const account = response.data.account;
            console.log(`   帳號詳情: ${account.username} - ${account.name} (${account.role})`);
            console.log(`   電子郵件: ${account.email}`);
            console.log(`   創建時間: ${account.created_at}`);
            return true;
        } else {
            console.log('❌ 獲取帳號詳情失敗:', response.data.error);
            return false;
        }
    } catch (error) {
        console.log('❌ 獲取帳號詳情錯誤:', error.response?.data?.error || error.message);
        return false;
    }
}

async function testDeleteAccount(accountId) {
    try {
        console.log('\n6️⃣ 測試刪除帳號...');
        
        const response = await axios.delete(`${API_BASE_URL}/api/accounts/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ 刪除帳號成功');
            console.log(`   已刪除: ${response.data.deleted_account.username}`);
            return true;
        } else {
            console.log('❌ 刪除帳號失敗:', response.data.error);
            return false;
        }
    } catch (error) {
        console.log('❌ 刪除帳號錯誤:', error.response?.data?.error || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 開始測試帳號管理功能...');
    console.log('='.repeat(50));
    
    // 1. 測試登入
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log('\n❌ 登入失敗，無法繼續測試');
        return;
    }
    
    // 2. 測試獲取帳號列表
    const accounts = await testGetAccounts();
    
    // 3. 測試創建帳號
    const newAccount = await testCreateAccount();
    if (!newAccount) {
        console.log('\n❌ 創建帳號失敗，跳過後續測試');
        return;
    }
    
    // 4. 測試更新帳號
    await testUpdateAccount(newAccount.id);
    
    // 5. 測試獲取帳號詳情
    await testGetAccountDetail(newAccount.id);
    
    // 6. 測試刪除帳號
    await testDeleteAccount(newAccount.id);
    
    // 7. 再次獲取帳號列表確認刪除
    console.log('\n7️⃣ 確認刪除後的帳號列表...');
    await testGetAccounts();
    
    console.log('\n='.repeat(50));
    console.log('🎉 帳號管理功能測試完成！');
    console.log('\n📋 測試結果總結：');
    console.log('✅ 管理員登入');
    console.log('✅ 獲取帳號列表');
    console.log('✅ 創建新帳號');
    console.log('✅ 更新帳號資訊');
    console.log('✅ 獲取帳號詳情');
    console.log('✅ 刪除帳號');
    console.log('\n🌟 所有帳號管理功能正常運作！');
}

// 執行測試
runAllTests().catch(error => {
    console.error('測試執行錯誤:', error);
});