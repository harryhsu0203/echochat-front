const https = require('https');

console.log('🔧 創建測試帳號...\n');

const API_URL = 'https://echochat-api.onrender.com';

async function createTestAccount() {
    try {
        // 1. 發送驗證碼
        console.log('📡 發送電子郵件驗證碼...');
        const emailResponse = await makeRequest(`${API_URL}/api/send-verification-code`, 'POST', {
            email: 'test@echochat.com'
        });
        
        if (emailResponse.status === 200) {
            console.log('✅ 驗證碼已發送');
            console.log('📄 回應:', emailResponse.data);
            
            // 如果有驗證碼，使用它
            let verificationCode = '123456'; // 預設驗證碼
            if (emailResponse.data.code) {
                verificationCode = emailResponse.data.code;
            }
            
            // 2. 驗證電子郵件
            console.log('\n📡 驗證電子郵件...');
            const verifyResponse = await makeRequest(`${API_URL}/api/verify-code`, 'POST', {
                email: 'test@echochat.com',
                code: verificationCode
            });
            
            if (verifyResponse.status === 200) {
                console.log('✅ 電子郵件驗證成功');
                
                // 3. 註冊帳號
                console.log('\n📡 註冊測試帳號...');
                const registerResponse = await makeRequest(`${API_URL}/api/register`, 'POST', {
                    username: 'testadmin',
                    email: 'test@echochat.com',
                    password: 'test123',
                    name: '測試管理員'
                });
                
                if (registerResponse.status === 200) {
                    console.log('✅ 測試帳號創建成功！');
                    console.log('📧 帳號: testadmin');
                    console.log('🔑 密碼: test123');
                    console.log('📧 郵箱: test@echochat.com');
                    
                    // 4. 測試登入
                    console.log('\n📡 測試登入...');
                    const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
                        username: 'testadmin',
                        password: 'test123'
                    });
                    
                    if (loginResponse.status === 200) {
                        console.log('✅ 登入測試成功！');
                        console.log('🎉 測試帳號可以正常使用！');
                    } else {
                        console.log('❌ 登入測試失敗');
                        console.log('📄 錯誤:', loginResponse.data);
                    }
                } else {
                    console.log('❌ 註冊失敗');
                    console.log('📄 錯誤:', registerResponse.data);
                }
            } else {
                console.log('❌ 電子郵件驗證失敗');
                console.log('📄 錯誤:', verifyResponse.data);
            }
        } else {
            console.log('❌ 發送驗證碼失敗');
            console.log('📄 錯誤:', emailResponse.data);
        }
        
    } catch (error) {
        console.error('❌ 創建測試帳號過程發生錯誤:', error.message);
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
                'User-Agent': 'EchoChat-Test-Account/1.0'
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

// 執行創建測試帳號
createTestAccount().catch(console.error); 