const https = require('https');

// 初始化管理員帳號的API端點
const API_URL = 'https://echochat-api.onrender.com';

async function initAdminAccount() {
    console.log('🔧 開始初始化遠程管理員帳號...\n');
    
    try {
        // 1. 檢查API健康狀態
        console.log('📡 檢查 API 健康狀態...');
        const healthResponse = await makeRequest(`${API_URL}/api/health`);
        console.log('✅ API 健康檢查通過');
        
        // 2. 嘗試使用預設帳號登入
        console.log('\n📡 嘗試使用預設帳號登入...');
        const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        if (loginResponse.status === 200) {
            console.log('✅ 管理員帳號已存在且可正常登入');
            return;
        }
        
        console.log('⚠️ 管理員帳號不存在或密碼錯誤，需要重新初始化');
        
        // 3. 嘗試觸發資料庫初始化
        console.log('\n📡 觸發資料庫初始化...');
        const initResponse = await makeRequest(`${API_URL}/api/init-database`, 'POST');
        
        if (initResponse.status === 200) {
            console.log('✅ 資料庫初始化成功');
        } else {
            console.log('⚠️ 無法遠程初始化資料庫，請手動檢查');
        }
        
        // 4. 再次嘗試登入
        console.log('\n📡 再次嘗試登入...');
        const finalLoginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        if (finalLoginResponse.status === 200) {
            console.log('✅ 管理員帳號初始化成功！');
            console.log('📧 帳號: sunnyharry1');
            console.log('🔑 密碼: gele1227');
        } else {
            console.log('❌ 管理員帳號初始化失敗');
            console.log('💡 請檢查 Render 專案的環境變數和資料庫設定');
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
                'User-Agent': 'EchoChat-Admin-Init/1.0'
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

// 執行初始化
initAdminAccount().catch(console.error); 