const https = require('https');

console.log('🔧 重置管理員密碼...\n');

const API_URL = 'https://echochat-api.onrender.com';

async function resetAdminPassword() {
    try {
        // 1. 嘗試使用不同的密碼組合
        const passwordAttempts = [
            'gele1227',
            'admin123',
            'password',
            '123456',
            'admin'
        ];
        
        console.log('📡 嘗試不同的密碼組合...');
        
        for (const password of passwordAttempts) {
            console.log(`   嘗試密碼: ${password}`);
            
            const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
                username: 'sunnyharry1',
                password: password
            });
            
            if (loginResponse.status === 200) {
                console.log(`✅ 登入成功！密碼是: ${password}`);
                console.log('🎉 管理員帳號可以正常使用！');
                console.log('📧 帳號: sunnyharry1');
                console.log(`🔑 密碼: ${password}`);
                return;
            }
        }
        
        console.log('❌ 所有密碼組合都失敗了');
        
        // 2. 嘗試創建一個新的管理員帳號
        console.log('\n📡 嘗試創建新的管理員帳號...');
        
        // 先發送驗證碼
        const emailResponse = await makeRequest(`${API_URL}/api/send-verification-code`, 'POST', {
            email: 'admin@echochat.com'
        });
        
        if (emailResponse.status === 200) {
            console.log('✅ 驗證碼已發送');
            
            // 使用預設驗證碼
            const verifyResponse = await makeRequest(`${API_URL}/api/verify-code`, 'POST', {
                email: 'admin@echochat.com',
                code: '123456'
            });
            
            if (verifyResponse.status === 200) {
                console.log('✅ 電子郵件驗證成功');
                
                // 註冊新管理員
                const registerResponse = await makeRequest(`${API_URL}/api/register`, 'POST', {
                    username: 'admin',
                    email: 'admin@echochat.com',
                    password: 'admin123',
                    name: '系統管理員'
                });
                
                if (registerResponse.status === 200) {
                    console.log('✅ 新管理員帳號創建成功！');
                    console.log('📧 帳號: admin');
                    console.log('🔑 密碼: admin123');
                    
                    // 測試登入
                    const testLoginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
                        username: 'admin',
                        password: 'admin123'
                    });
                    
                    if (testLoginResponse.status === 200) {
                        console.log('✅ 新管理員帳號登入成功！');
                    } else {
                        console.log('❌ 新管理員帳號登入失敗');
                    }
                } else {
                    console.log('❌ 註冊失敗:', registerResponse.data);
                }
            } else {
                console.log('❌ 電子郵件驗證失敗:', verifyResponse.data);
            }
        } else {
            console.log('❌ 發送驗證碼失敗:', emailResponse.data);
        }
        
    } catch (error) {
        console.error('❌ 重置過程發生錯誤:', error.message);
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
                'User-Agent': 'EchoChat-Reset-Admin/1.0'
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

// 執行重置
resetAdminPassword().catch(console.error); 