#!/usr/bin/env node

/**
 * 直接測試 AI 聊天功能
 */

const https = require('https');

console.log('=== 直接測試 AI 聊天功能 ===\n');

// 執行 API 請求
function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL('https://echochat-api.onrender.com' + path);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`回應狀態碼: ${res.statusCode}`);
                console.log(`回應內容: ${responseData.substring(0, 500)}`);
                
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({ statusCode: res.statusCode, data: parsedData });
                } catch (error) {
                    resolve({ statusCode: res.statusCode, data: responseData });
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

// 主測試流程
async function main() {
    try {
        // 測試 1：檢查 API 健康狀態
        console.log('📋 步驟 1：檢查 API 健康狀態');
        const health = await makeRequest('/api/health');
        console.log('健康檢查結果:', health.data);
        console.log('');
        
        // 測試 2：嘗試登入
        console.log('📋 步驟 2：嘗試登入');
        const loginData = {
            username: 'admin',
            password: 'Admin123!@#'
        };
        
        // 嘗試正確的登入端點
        const login = await makeRequest('/api/login', 'POST', loginData);
        
        if (login.statusCode === 200 && login.data.success) {
            const token = login.data.token;
            console.log('✅ 登入成功，獲得 token');
            console.log('');
            
            // 測試 3：使用 token 測試聊天
            console.log('📋 步驟 3：測試 AI 聊天功能');
            const chatData = {
                message: '你好，請簡短介紹一下你自己',
                conversationId: `test_${Date.now()}`
            };
            
            const chat = await makeRequest('/api/chat', 'POST', chatData, token);
            
            if (chat.statusCode === 200 && chat.data.success) {
                console.log('✅ 聊天功能正常！');
                console.log('AI 回應:', chat.data.reply);
                console.log('使用模型:', chat.data.model);
            } else if (chat.statusCode === 500) {
                console.log('❌ 聊天功能錯誤：');
                console.log('錯誤訊息:', chat.data.error);
                if (chat.data.details) {
                    console.log('詳細資訊:', chat.data.details);
                }
                if (chat.data.solution) {
                    console.log('💡 解決方案:', chat.data.solution);
                }
            }
        } else {
            console.log('❌ 登入失敗');
            console.log('回應:', login.data);
        }
        
    } catch (error) {
        console.error('測試失敗:', error.message);
    }
}

// 執行測試
main();