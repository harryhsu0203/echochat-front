#!/usr/bin/env node

/**
 * 測試 AI 聊天 API 功能
 * 用於驗證 OpenAI API 集成是否正常工作
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// API 配置
const API_URL = 'https://echochat-api.onrender.com';
let authToken = '';

console.log('=== AI 聊天 API 測試工具 ===\n');

// 執行 API 請求
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_URL + path);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
        }

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsedData);
                    } else {
                        reject({ statusCode: res.statusCode, data: parsedData });
                    }
                } catch (error) {
                    reject({ statusCode: res.statusCode, data: responseData });
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

// 測試健康檢查
async function testHealth() {
    console.log('📋 測試 1：健康檢查');
    try {
        const result = await makeRequest('/api/health');
        console.log('✅ 健康檢查成功');
        console.log('   狀態:', result.status);
        console.log('   環境變數:');
        if (result.env && result.env.OPENAI_API_KEY) {
            console.log('   - OPENAI_API_KEY:', result.env.OPENAI_API_KEY);
        }
        console.log('');
        return true;
    } catch (error) {
        console.error('❌ 健康檢查失敗:', error.message || error);
        console.log('');
        return false;
    }
}

// 測試登入
async function testLogin() {
    console.log('📋 測試 2：用戶登入');
    try {
        const loginData = {
            username: 'admin',
            password: 'Admin123!@#'
        };
        
        const result = await makeRequest('/api/auth/login', 'POST', loginData);
        if (result.success && result.token) {
            authToken = result.token;
            console.log('✅ 登入成功');
            console.log('   用戶:', result.user.username);
            console.log('   角色:', result.user.role);
            console.log('');
            return true;
        } else {
            console.error('❌ 登入失敗:', result.error);
            console.log('');
            return false;
        }
    } catch (error) {
        console.error('❌ 登入請求失敗:', error.data || error.message);
        console.log('');
        return false;
    }
}

// 測試聊天功能
async function testChat(message) {
    console.log('📋 測試 3：AI 聊天功能');
    console.log('   發送訊息:', message);
    
    try {
        const chatData = {
            message: message,
            conversationId: `test_${Date.now()}`
        };
        
        const result = await makeRequest('/api/chat', 'POST', chatData);
        
        if (result.success) {
            console.log('✅ 聊天請求成功');
            console.log('   AI 回應:', result.reply.substring(0, 100) + '...');
            console.log('   使用模型:', result.model);
            console.log('   助理名稱:', result.assistantName);
            console.log('');
            return true;
        } else {
            console.error('❌ 聊天失敗:', result.error);
            if (result.details) {
                console.error('   詳情:', result.details);
            }
            if (result.solution) {
                console.log('   💡 解決方案:', result.solution);
            }
            console.log('');
            return false;
        }
    } catch (error) {
        console.error('❌ 聊天請求失敗');
        if (error.statusCode === 500 && error.data) {
            console.error('   錯誤:', error.data.error);
            if (error.data.details) {
                console.error('   詳情:', error.data.details);
            }
            if (error.data.solution) {
                console.log('   💡 解決方案:', error.data.solution);
            }
        } else {
            console.error('   錯誤:', error.message || error);
        }
        console.log('');
        return false;
    }
}

// 主測試流程
async function runTests() {
    console.log('🚀 開始測試 AI 聊天 API...\n');
    
    // 測試 1：健康檢查
    const healthOk = await testHealth();
    if (!healthOk) {
        console.log('⚠️  API 服務可能無法訪問，繼續其他測試...\n');
    }
    
    // 測試 2：登入
    const loginOk = await testLogin();
    if (!loginOk) {
        console.log('⚠️  無法登入，嘗試繼續測試...\n');
    }
    
    // 測試 3：聊天功能
    const chatOk = await testChat('你好，請介紹一下你自己');
    
    // 總結
    console.log('=== 測試總結 ===\n');
    console.log(`健康檢查: ${healthOk ? '✅ 通過' : '❌ 失敗'}`);
    console.log(`用戶登入: ${loginOk ? '✅ 通過' : '❌ 失敗'}`);
    console.log(`聊天功能: ${chatOk ? '✅ 通過' : '❌ 失敗'}`);
    
    if (!chatOk) {
        console.log('\n=== 診斷建議 ===\n');
        console.log('如果聊天功能失敗，可能的原因：');
        console.log('1. OpenAI API Key 未設置');
        console.log('   解決：運行 node update-render-env-openai.js');
        console.log('');
        console.log('2. OpenAI API Key 無效或過期');
        console.log('   解決：檢查 OpenAI 帳戶並更新 API Key');
        console.log('');
        console.log('3. OpenAI 帳戶餘額不足');
        console.log('   解決：充值 OpenAI 帳戶');
        console.log('');
        console.log('4. 網路連接問題');
        console.log('   解決：檢查伺服器的網路連接');
    }
    
    // 詢問是否進行交互式測試
    if (chatOk) {
        console.log('\n');
        rl.question('是否要進行交互式聊天測試？(yes/no): ', (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                interactiveChat();
            } else {
                console.log('\n測試完成！');
                rl.close();
            }
        });
    } else {
        rl.close();
    }
}

// 交互式聊天測試
function interactiveChat() {
    console.log('\n=== 交互式聊天測試 ===');
    console.log('輸入訊息與 AI 對話，輸入 "exit" 退出\n');
    
    function askQuestion() {
        rl.question('您: ', async (message) => {
            if (message.toLowerCase() === 'exit') {
                console.log('\n感謝使用！再見！');
                rl.close();
                return;
            }
            
            try {
                const result = await makeRequest('/api/chat', 'POST', {
                    message: message,
                    conversationId: `interactive_${Date.now()}`
                });
                
                if (result.success) {
                    console.log('AI:', result.reply);
                    console.log('');
                } else {
                    console.error('錯誤:', result.error);
                }
            } catch (error) {
                console.error('請求失敗:', error.data?.error || error.message);
            }
            
            askQuestion();
        });
    }
    
    askQuestion();
}

// 執行測試
runTests().catch(error => {
    console.error('測試執行失敗:', error);
    rl.close();
    process.exit(1);
});