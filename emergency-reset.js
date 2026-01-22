const https = require('https');

console.log('🚨 執行緊急密碼重置...');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function emergencyReset() {
    try {
        console.log('🔧 調用緊急重置 API...');
        
        const resetOptions = {
            hostname: 'echochat-api.onrender.com',
            port: 443,
            path: '/api/emergency-reset',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        };

        const resetData = {
            secret: 'emergency-reset-2025'
        };

        const result = await makeRequest(resetOptions, resetData);
        
        console.log('狀態碼:', result.status);
        console.log('回應:', JSON.stringify(result.data, null, 2));
        
        if (result.status === 200 && result.data.success) {
            console.log('✅ 緊急重置成功！');
            console.log(`   重置了 ${result.data.reset_count} 個帳號`);
            console.log('\n📋 可用帳號：');
            result.data.accounts.forEach(acc => {
                console.log(`   - ${acc.username} / ${acc.password} (${acc.role})`);
            });
            
            // 測試登入
            console.log('\n🧪 測試重置後的登入...');
            await testLogin();
        } else {
            console.log('❌ 緊急重置失敗:', result.data.error || '未知錯誤');
        }
        
    } catch (error) {
        console.log('❌ 請求錯誤:', error.message);
    }
}

async function testLogin() {
    const testAccounts = [
        { username: 'sunnyharry1', password: 'admin123' },
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'admin123' }
    ];
    
    console.log('='.repeat(50));
    
    for (const account of testAccounts) {
        try {
            console.log(`🔍 測試: ${account.username} / ${account.password}`);
            
            const loginOptions = {
                hostname: 'echochat-api.onrender.com',
                port: 443,
                path: '/api/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            };

            const result = await makeRequest(loginOptions, account);
            
            if (result.status === 200 && result.data.success) {
                console.log(`   ✅ 登入成功！`);
                console.log(`      用戶: ${result.data.user.name} (${result.data.user.role})`);
            } else {
                console.log(`   ❌ 登入失敗: ${result.data.error || '未知錯誤'}`);
            }
        } catch (error) {
            console.log(`   ❌ 請求錯誤: ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
    
    console.log('='.repeat(50));
    console.log('🎯 登入測試完成！');
}

// 執行緊急重置
emergencyReset().catch(error => {
    console.error('緊急重置過程發生錯誤:', error);
});