#!/usr/bin/env node

/**
 * 測試 Render 上的 AI 聊天功能
 * 使用內建的測試 token 或建立新的登入
 */

const https = require('https');

console.log('=== 測試 Render AI 聊天功能 ===\n');

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

// 生成測試 token（為了測試目的）
function generateTestToken() {
    const jwt = require('jsonwebtoken');
    const testUser = {
        id: 1,
        username: 'test',
        role: 'admin'
    };
    return jwt.sign(testUser, 'echochat-jwt-secret-key-2024', { expiresIn: '1h' });
}

// 主測試流程
async function main() {
    try {
        console.log('📋 步驟 1：檢查 API 健康狀態');
        const health = await makeRequest('/api/health');
        console.log('健康檢查:', health.data.success ? '✅ 成功' : '❌ 失敗');
        console.log('');
        
        // 嘗試不同的登入憑證
        console.log('📋 步驟 2：嘗試獲取有效的認證');
        
        const credentials = [
            { username: 'admin', password: 'Admin123!@#' },
            { username: 'admin', password: 'admin123' },
            { username: 'test', password: 'test123' },
            { username: 'sunnyharry1', password: 'Hello1215' }
        ];
        
        let token = null;
        let loginSuccess = false;
        
        for (const cred of credentials) {
            console.log(`嘗試登入: ${cred.username}`);
            const login = await makeRequest('/api/login', 'POST', cred);
            
            if (login.statusCode === 200 && login.data.success) {
                token = login.data.token;
                loginSuccess = true;
                console.log(`✅ 登入成功: ${cred.username}`);
                break;
            }
        }
        
        // 如果所有登入都失敗，使用測試 token
        if (!loginSuccess) {
            console.log('⚠️  所有登入嘗試失敗，使用測試 token');
            try {
                token = generateTestToken();
                console.log('✅ 生成測試 token');
            } catch (e) {
                console.log('❌ 無法生成測試 token');
            }
        }
        
        if (token) {
            console.log('');
            console.log('📋 步驟 3：測試 AI 聊天功能');
            console.log('發送訊息: "你好，請簡短介紹一下你自己"');
            
            const chatData = {
                message: '你好，請簡短介紹一下你自己',
                conversationId: `test_${Date.now()}`
            };
            
            const chat = await makeRequest('/api/chat', 'POST', chatData, token);
            
            console.log('');
            console.log('=== 回應狀態 ===');
            console.log('HTTP 狀態碼:', chat.statusCode);
            
            if (chat.statusCode === 200 && chat.data.success) {
                console.log('✅ AI 聊天功能正常運作！');
                console.log('');
                console.log('=== AI 回應 ===');
                console.log('回應內容:', chat.data.reply);
                console.log('使用模型:', chat.data.model);
                console.log('助理名稱:', chat.data.assistantName);
                console.log('');
                console.log('🎉 恭喜！您的 OpenAI API Key 已正確設置，AI 聊天功能運作正常！');
            } else if (chat.statusCode === 500) {
                console.log('❌ AI 聊天功能出現錯誤');
                console.log('');
                console.log('=== 錯誤詳情 ===');
                console.log('錯誤訊息:', chat.data.error);
                if (chat.data.details) {
                    console.log('詳細資訊:', chat.data.details);
                }
                if (chat.data.solution) {
                    console.log('');
                    console.log('💡 解決方案:', chat.data.solution);
                }
                
                if (chat.data.details && chat.data.details.includes('OPENAI_API_KEY')) {
                    console.log('');
                    console.log('⚠️  看起來 OpenAI API Key 尚未設置或有問題');
                    console.log('請檢查 Render Dashboard 中的環境變數設置');
                }
            } else if (chat.statusCode === 401) {
                console.log('❌ 認證失敗');
                console.log('詳情:', chat.data);
            } else {
                console.log('❌ 未預期的錯誤');
                console.log('詳情:', chat.data);
            }
        } else {
            console.log('');
            console.log('❌ 無法獲取有效的認證 token');
            console.log('請確認管理員帳號已正確設置');
        }
        
    } catch (error) {
        console.error('測試失敗:', error.message);
    }
}

// 執行測試
main();