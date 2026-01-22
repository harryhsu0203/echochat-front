const https = require('https');

console.log('⏳ 等待 Render 部署並測試登入...');

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

async function waitForDeploy() {
    console.log('🔄 等待 Render 部署完成...');
    
    for (let i = 1; i <= 10; i++) {
        console.log(`   嘗試 ${i}/10 - 檢查 API 狀態...`);
        
        try {
            const healthOptions = {
                hostname: 'echochat-api.onrender.com',
                port: 443,
                path: '/api/health',
                method: 'GET',
                timeout: 10000
            };

            const healthResult = await makeRequest(healthOptions);
            
            if (healthResult.status === 200 && healthResult.data.success) {
                console.log('✅ API 服務正常');
                
                // 測試登入
                console.log('🧪 測試登入功能...');
                await testAllLogins();
                return true;
            } else {
                console.log(`   ⚠️  API 狀態: ${healthResult.status}`);
            }
        } catch (error) {
            console.log(`   ❌ 連接失敗: ${error.message}`);
        }
        
        if (i < 10) {
            console.log('   等待 30 秒後重試...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    console.log('❌ 等待部署超時');
    return false;
}

async function testAllLogins() {
    const testAccounts = [
        { username: 'sunnyharry1', password: 'admin123' },
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'admin123' }
    ];
    
    console.log('\n📋 測試所有帳號登入：');
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
                console.log(`      Token: ${result.data.token.substring(0, 20)}...`);
            } else {
                console.log(`   ❌ 登入失敗: ${result.data.error || '未知錯誤'}`);
                console.log(`      狀態碼: ${result.status}`);
                if (result.data.error) {
                    console.log(`      錯誤詳情: ${JSON.stringify(result.data, null, 2)}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ 請求錯誤: ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
    
    console.log('='.repeat(50));
    console.log('🎯 測試完成！');
    
    console.log('\n📝 如果登入成功，您可以：');
    console.log('1. 使用 /fixed-login.html 進行登入');
    console.log('2. 使用 /login.html 進行一般登入');
    console.log('3. 登入後訪問 /account-management.html 管理帳號');
    console.log('4. 登入後修改密碼回 gele1227');
}

// 開始等待和測試
waitForDeploy().then(success => {
    if (success) {
        console.log('\n🎉 部署測試完成！');
    } else {
        console.log('\n⚠️  請手動檢查 Render 部署狀態');
        console.log('   或等待更長時間後使用 /fixed-login.html 測試');
    }
}).catch(error => {
    console.error('測試過程發生錯誤:', error);
});