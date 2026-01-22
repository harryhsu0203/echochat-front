const https = require('https');

console.log('🔧 更新 Render 上的 CSP 設定...');

// 測試當前的 CSP 設定
async function checkCurrentCSP() {
    try {
        const response = await makeRequest('https://echochat-api.onrender.com/api/health', 'GET');
        const cspHeader = response.headers['content-security-policy'];
        
        console.log('📋 當前 CSP 設定:');
        console.log(cspHeader);
        
        if (cspHeader && cspHeader.includes("connect-src 'self'")) {
            console.log('❌ CSP 設定仍然限制連接');
            console.log('💡 需要重新部署到 Render');
            return false;
        } else {
            console.log('✅ CSP 設定已更新');
            return true;
        }
    } catch (error) {
        console.error('❌ 檢查 CSP 時發生錯誤:', error.message);
        return false;
    }
}

// 測試登入功能
async function testLogin() {
    try {
        console.log('\n🔐 測試登入功能...');
        
        const response = await makeRequest('https://echochat-api.onrender.com/api/login', 'POST', {
            username: 'sunnyharry1',
            password: 'gele1227'
        });
        
        if (response.status === 200) {
            console.log('✅ 登入成功');
            return true;
        } else {
            console.log('❌ 登入失敗:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ 登入測試錯誤:', error.message);
        return false;
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
                'User-Agent': 'EchoChat-CSP-Test/1.0'
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
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: responseData
                });
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

// 主函數
async function main() {
    console.log('🚀 開始檢查 Render 部署狀態...\n');
    
    // 檢查 CSP 設定
    const cspUpdated = await checkCurrentCSP();
    
    // 測試登入
    const loginWorks = await testLogin();
    
    console.log('\n📊 檢查結果:');
    console.log(`CSP 設定: ${cspUpdated ? '✅ 已更新' : '❌ 需要更新'}`);
    console.log(`登入功能: ${loginWorks ? '✅ 正常' : '❌ 有問題'}`);
    
    if (!cspUpdated) {
        console.log('\n🔧 解決方案:');
        console.log('1. 前往 https://render.com');
        console.log('2. 找到您的 echochat-api 專案');
        console.log('3. 點擊 "Manual Deploy"');
        console.log('4. 選擇 "Deploy latest commit"');
        console.log('5. 等待部署完成後重新測試');
        
        console.log('\n📝 或者手動更新 server.js:');
        console.log('在 Render 控制台中編輯 server.js，將 CSP 設定改為:');
        console.log('contentSecurityPolicy: false');
    }
    
    if (loginWorks && cspUpdated) {
        console.log('\n🎉 所有功能正常！');
        console.log('現在可以正常使用登入功能了。');
    }
}

main().catch(console.error); 