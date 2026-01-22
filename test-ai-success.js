#!/usr/bin/env node

/**
 * 互動式 AI 聊天測試
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let authToken = '';

// 執行 API 請求
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL('https://echochat-api.onrender.com' + path);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
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
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (e) {
                    resolve(responseData);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// 登入
async function login() {
    const credentials = [
        { username: 'admin', password: 'Admin123!@#' },
        { username: 'admin', password: 'admin123' }
    ];
    
    for (const cred of credentials) {
        const result = await makeRequest('/api/login', 'POST', cred);
        if (result.success && result.token) {
            authToken = result.token;
            console.log('✅ 登入成功！');
            return true;
        }
    }
    console.log('❌ 登入失敗');
    return false;
}

// 發送聊天訊息
async function sendMessage(message) {
    const result = await makeRequest('/api/chat', 'POST', {
        message: message,
        conversationId: `interactive_${Date.now()}`
    });
    
    if (result.success) {
        return result.reply;
    } else {
        throw new Error(result.error || '聊天失敗');
    }
}

// 主函數
async function main() {
    console.log('=== 🤖 EchoChat AI 互動式聊天 ===\n');
    console.log('正在連接到 AI 服務...');
    
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('無法連接到服務');
        rl.close();
        return;
    }
    
    console.log('\n💬 開始對話！輸入 "exit" 或 "quit" 退出\n');
    console.log('AI: 你好！我是 EchoChat AI 助理，有什麼可以幫助您的嗎？\n');
    
    const chat = () => {
        rl.question('您: ', async (input) => {
            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
                console.log('\nAI: 很高興為您服務，再見！👋');
                rl.close();
                return;
            }
            
            try {
                console.log('\nAI 正在思考...');
                const reply = await sendMessage(input);
                console.log('\nAI:', reply, '\n');
            } catch (error) {
                console.error('\n❌ 錯誤:', error.message, '\n');
            }
            
            chat();
        });
    };
    
    chat();
}

// 執行
main().catch(console.error);