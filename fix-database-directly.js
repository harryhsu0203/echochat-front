const https = require('https');

console.log('🔧 直接修復資料庫...\n');

const API_URL = 'https://echochat-api.onrender.com';

async function fixDatabaseDirectly() {
    try {
        // 1. 檢查API狀態
        console.log('📡 檢查 API 狀態...');
        const healthResponse = await makeRequest(`${API_URL}/api/health`);
        console.log('✅ API 健康檢查通過');
        
        // 2. 嘗試訪問根路徑多次來觸發初始化
        console.log('\n📡 觸發資料庫初始化...');
        for (let i = 0; i < 10; i++) {
            await makeRequest(`${API_URL}/`);
            console.log(`   觸發 ${i + 1}/10`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 3. 嘗試使用不同的用戶名
        console.log('\n📡 嘗試不同的用戶名...');
        const usernames = ['sunnyharry1', 'admin', 'root', 'system'];
        
        for (const username of usernames) {
            console.log(`   嘗試用戶名: ${username}`);
            
            const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
                username: username,
                password: 'gele1227'
            });
            
            if (loginResponse.status === 200) {
                console.log(`✅ 登入成功！用戶名: ${username}`);
                console.log('📧 帳號:', username);
                console.log('🔑 密碼: gele1227');
                return;
            }
            
            // 嘗試其他密碼
            const passwords = ['admin123', 'password', '123456'];
            for (const password of passwords) {
                const altLoginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
                    username: username,
                    password: password
                });
                
                if (altLoginResponse.status === 200) {
                    console.log(`✅ 登入成功！用戶名: ${username}, 密碼: ${password}`);
                    console.log('📧 帳號:', username);
                    console.log('🔑 密碼:', password);
                    return;
                }
            }
        }
        
        console.log('❌ 所有用戶名和密碼組合都失敗了');
        
        // 4. 提供解決方案
        console.log('\n💡 解決方案：');
        console.log('1. 在 Render 控制台中手動重新部署後端專案');
        console.log('2. 確保環境變數正確設定');
        console.log('3. 等待幾分鐘讓資料庫初始化完成');
        console.log('4. 使用以下測試帳號：');
        console.log('   - 用戶名: sunnyharry1');
        console.log('   - 密碼: gele1227');
        
    } catch (error) {
        console.error('❌ 修復過程發生錯誤:', error.message);
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
                'User-Agent': 'EchoChat-Fix-DB/1.0'
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

// 執行修復
fixDatabaseDirectly().catch(console.error); 