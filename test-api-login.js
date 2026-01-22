const fetch = require('node-fetch');

async function testLogin() {
    console.log('🔍 測試 API 登入...');
    
    const testAccounts = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'admin123' },
        { username: 'sunnyharry1', password: 'admin123' }
    ];
    
    for (const account of testAccounts) {
        try {
            console.log(`\n測試帳號: ${account.username}`);
            
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

testLogin();