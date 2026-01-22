const https = require('https');

console.log('🔧 強制觸發資料庫初始化...\n');

const API_URL = 'https://echochat-api.onrender.com';

async function forceInit() {
    try {
        // 1. 多次訪問根路徑來觸發初始化
        console.log('📡 觸發伺服器初始化...');
        
        for (let i = 0; i < 5; i++) {
            console.log(`   嘗試 ${i + 1}/5...`);
            try {
                const response = await makeRequest(`${API_URL}/`);
                console.log(`   ✅ 訪問成功 (${response.status})`);
            } catch (error) {
                console.log(`   ❌ 訪問失敗: ${error.message}`);
            }
            
            // 等待一下
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // 2. 嘗試登入
        console.log('\n📡 測試登入...');
        const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        if (loginResponse.status === 200) {
            console.log('✅ 登入成功！');
            console.log('🎉 管理員帳號已初始化！');
            console.log('📧 帳號: sunnyharry1');
            console.log('🔑 密碼: gele1227');
        } else {
            console.log('❌ 登入失敗');
            console.log('📄 錯誤:', loginResponse.data);
            
            // 3. 嘗試創建一個新的管理員帳號
            console.log('\n📡 嘗試創建新管理員帳號...');
            const createResponse = await makeRequest(`${API_URL}/api/register`, 'POST', {
                username: 'admin',
                email: 'admin@echochat.com',
                password: 'admin123',
                name: '系統管理員'
            });
            
            if (createResponse.status === 200) {
                console.log('✅ 新管理員帳號創建成功！');
                console.log('📧 帳號: admin');
                console.log('🔑 密碼: admin123');
            } else {
                console.log('❌ 創建新帳號失敗');
                console.log('📄 錯誤:', createResponse.data);
            }
        }
        
    } catch (error) {
        console.error('❌ 初始化過程發生錯誤:', error.message);
    }
}

function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'EchoChat-Force-Init/1.0'
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
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
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

// 執行強制初始化
forceInit().catch(console.error); 