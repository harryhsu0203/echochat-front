const https = require('https');

console.log('🔍 快速登入測試...');

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
        console.log('測試帳號: sunnyharry1 / gele1227');
        
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
            password: 'gele1227'
        };

        const result = await makeRequest(options, loginData);
        
        console.log('狀態碼:', result.status);
        console.log('回應:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✅ 登入成功！');
        } else {
            console.log('❌ 登入失敗:', result.data.error);
        }
        
    } catch (error) {
        console.log('❌ 請求錯誤:', error.message);
    }
}

async function testBypassLogin() {
    try {
        console.log('\n測試繞過登入: sunnyharry1');
        
        const options = {
            hostname: 'echochat-api.onrender.com',
            port: 443,
            path: '/api/login-bypass',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const bypassData = {
            username: 'sunnyharry1'
        };

        const result = await makeRequest(options, bypassData);
        
        console.log('狀態碼:', result.status);
        console.log('回應:', JSON.stringify(result.data, null, 2));
        
        if (result.data.success) {
            console.log('✅ 繞過登入成功！');
        } else {
            console.log('❌ 繞過登入失敗:', result.data.error);
        }
        
    } catch (error) {
        console.log('❌ 請求錯誤:', error.message);
    }
}

async function testHealthCheck() {
    try {
        console.log('\n測試 API 健康狀態...');
        
        const options = {
            hostname: 'echochat-api.onrender.com',
            port: 443,
            path: '/api/health',
            method: 'GET'
        };

        const result = await makeRequest(options);
        
        console.log('狀態碼:', result.status);
        console.log('回應:', JSON.stringify(result.data, null, 2));
        
    } catch (error) {
        console.log('❌ 請求錯誤:', error.message);
    }
}

async function runTests() {
    console.log('='.repeat(50));
    await testHealthCheck();
    console.log('='.repeat(50));
    await testLogin();
    console.log('='.repeat(50));
    await testBypassLogin();
    console.log('='.repeat(50));
}

runTests();