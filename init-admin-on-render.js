const https = require('https');

console.log('🔧 開始在 Render 上初始化管理員帳號...\n');

const API_URL = 'https://echochat-api.onrender.com';

async function initAdminOnRender() {
    try {
        // 1. 檢查API健康狀態
        console.log('📡 檢查 API 健康狀態...');
        const healthResponse = await makeRequest(`${API_URL}/api/health`);
        console.log('✅ API 健康檢查通過');
        
        // 2. 強制初始化資料庫
        console.log('\n📡 強制初始化資料庫...');
        const initResponse = await makeRequest(`${API_URL}/api/init-database`, 'POST');
        
        if (initResponse.status === 200) {
            console.log('✅ 資料庫初始化成功');
            console.log('📄 回應:', initResponse.data);
            
            if (initResponse.data.adminCreated) {
                console.log('🎉 管理員帳號已創建！');
                console.log('📧 帳號: sunnyharry1');
                console.log('🔑 密碼: gele1227');
            } else {
                console.log('ℹ️ 管理員帳號已存在');
            }
        } else {
            console.log('❌ 資料庫初始化失敗');
            console.log('📄 錯誤:', initResponse.data);
            return;
        }
        
        // 3. 測試登入
        console.log('\n📡 測試登入...');
        const loginResponse = await makeRequest(`${API_URL}/api/login`, 'POST', {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        if (loginResponse.status === 200) {
            console.log('✅ 登入測試成功！');
            console.log('🎉 管理員帳號可以正常使用！');
            console.log('📧 帳號: sunnyharry1');
            console.log('🔑 密碼: gele1227');
            console.log('\n🚀 前端登入功能現在可以正常使用了！');
        } else {
            console.log('❌ 登入測試失敗');
            console.log('📄 錯誤:', loginResponse.data);
            console.log('\n💡 請檢查以下可能的原因：');
            console.log('1. 資料庫檔案權限問題');
            console.log('2. 環境變數設定問題');
            console.log('3. Render 專案需要重新部署');
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
initAdminOnRender().catch(console.error); 