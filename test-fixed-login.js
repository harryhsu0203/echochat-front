const https = require('https');

console.log('🧪 測試修復後的登入...');

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

async function testLogin() {
    try {
        console.log('測試帳號: sunnyharry1 / admin123');
        
        const options = {
            hostname: 'echochat-api.onrender.com',
            port: 443,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const loginData = {
            username: 'sunnyharry1',
            password: 'admin123'
        };

        const result = await makeRequest(options, loginData);
        
        console.log('狀態碼:', result.status);
        console.log('回應:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✅ 登入成功！');
            console.log(`   Token: ${result.data.token.substring(0, 20)}...`);
            console.log(`   用戶: ${result.data.user.name} (${result.data.user.role})`);
        } else {
            console.log('❌ 登入失敗:', result.data.error);
        }
        
    } catch (error) {
        console.log('❌ 請求錯誤:', error.message);
    }
}

testLogin();