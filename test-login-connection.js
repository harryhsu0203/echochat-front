const https = require('https');

console.log('🔍 測試登入連接問題...\n');

const API_URL = 'https://echochat-api.onrender.com';

async function testLoginConnection() {
    try {
        // 1. 測試健康檢查
        console.log('📡 測試 API 健康檢查...');
        const healthResponse = await makeRequest(`${API_URL}/api/health`);
        console.log('✅ 健康檢查成功:', healthResponse.data);
        
        // 2. 測試登入端點
        console.log('\n📡 測試登入端點...');
        const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        console.log('📄 登入回應:', loginResponse);
        
        if (loginResponse.status === 200) {
            console.log('✅ 登入成功！');
            console.log('📧 帳號: sunnyharry1');
            console.log('🔑 密碼: gele1227');
        } else {
            console.log('❌ 登入失敗');
            console.log('💡 可能的原因：');
            console.log('1. 管理員帳號未正確初始化');
            console.log('2. 密碼不正確');
            console.log('3. 資料庫問題');
        }
        
        // 3. 測試CORS
        console.log('\n📡 測試 CORS 設定...');
        const corsResponse = await makeRequest(`${API_URL}/api/health`, 'OPTIONS');
        console.log('✅ CORS 設定正常');
        
        // 4. 測試從不同域名訪問
        console.log('\n📡 測試從 localhost 訪問...');
        const localhostResponse = await makeRequest(`${API_URL}/api/health`, 'GET', null, {
            'Origin': 'http://localhost:8000',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        });
        console.log('✅ 從 localhost 訪問正常');
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error.message);
    }
}

function makeRequest(url, method = 'GET', data = null, extraHeaders = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'EchoChat-Test/1.0',
                ...extraHeaders
            }
        };
        
        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: responseData
                    });
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

// 執行測試
testLoginConnection().catch(console.error); 