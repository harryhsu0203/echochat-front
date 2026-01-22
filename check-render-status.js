const https = require('https');

// 檢查的端點
const endpoints = [
    {
        name: 'API 健康檢查',
        url: 'https://echochat-api.onrender.com/api/health'
    },
    {
        name: '根路徑',
        url: 'https://echochat-api.onrender.com/'
    },
    {
        name: '登入端點測試',
        url: 'https://echochat-api.onrender.com/api/login',
        method: 'POST',
        data: JSON.stringify({
            username: 'sunnyharry1',
            password: 'gele1227'
        })
    }
];

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
                'User-Agent': 'EchoChat-Test/1.0'
            }
        };
        
        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(data);
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
            req.write(data);
        }
        
        req.end();
    });
}

async function checkEndpoints() {
    console.log('🔍 開始檢查 Render 專案狀態...\n');
    
    for (const endpoint of endpoints) {
        try {
            console.log(`📡 測試: ${endpoint.name}`);
            console.log(`   URL: ${endpoint.url}`);
            
            const response = await makeRequest(
                endpoint.url, 
                endpoint.method || 'GET', 
                endpoint.data
            );
            
            console.log(`   ✅ 狀態: ${response.status}`);
            console.log(`   📄 回應:`, response.data);
            
            if (response.headers['access-control-allow-origin']) {
                console.log(`   🌐 CORS: ${response.headers['access-control-allow-origin']}`);
            }
            
        } catch (error) {
            console.log(`   ❌ 錯誤: ${error.message}`);
        }
        
        console.log('---\n');
    }
}

// 執行檢查
checkEndpoints().catch(console.error); 