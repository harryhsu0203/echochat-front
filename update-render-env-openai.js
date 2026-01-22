#!/usr/bin/env node

/**
 * 更新 Render 環境變數 - 添加 OpenAI API Key
 * 
 * 使用方法:
 * 1. 設置 RENDER_API_KEY 環境變數：export RENDER_API_KEY="your-render-api-key"
 * 2. 運行此腳本：node update-render-env-openai.js
 */

const https = require('https');

// Render API 配置
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const SERVICE_ID = 'srv-ct8vdatsvqrc73dt1o60'; // echochat-api 服務 ID

if (!RENDER_API_KEY) {
    console.error('❌ 錯誤：請先設置 RENDER_API_KEY 環境變數');
    console.error('請執行：export RENDER_API_KEY="your-render-api-key"');
    console.error('\n如何獲取 Render API Key:');
    console.error('1. 登入 https://render.com');
    console.error('2. 點擊右上角頭像 -> Account Settings');
    console.error('3. 點擊 API Keys');
    console.error('4. 創建或複製現有的 API Key');
    process.exit(1);
}

// 提示用戶輸入 OpenAI API Key
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('=== 更新 Render 環境變數 - OpenAI API Key ===\n');
console.log('⚠️  重要：此操作將為您的 Render 部署添加 OpenAI API Key');
console.log('這將允許聊天功能正常工作\n');

rl.question('請輸入您的 OpenAI API Key (以 sk- 開頭): ', (apiKey) => {
    // 驗證 API Key 格式
    if (!apiKey || !apiKey.startsWith('sk-')) {
        console.error('❌ 錯誤：無效的 OpenAI API Key');
        console.error('API Key 應該以 "sk-" 開頭');
        rl.close();
        process.exit(1);
    }

    console.log('\n📋 即將更新的環境變數：');
    console.log('- OPENAI_API_KEY: ' + apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4));
    
    rl.question('\n確定要更新這些環境變數嗎？(yes/no): ', (confirm) => {
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('❌ 操作已取消');
            rl.close();
            process.exit(0);
        }

        // 準備環境變數
        const envVars = [
            { key: 'OPENAI_API_KEY', value: apiKey }
        ];

        console.log('\n🚀 正在更新環境變數...');

        // 更新環境變數
        updateEnvVars(envVars)
            .then(() => {
                console.log('✅ 環境變數更新成功！');
                console.log('\n📝 後續步驟：');
                console.log('1. Render 會自動重新部署服務（約需 2-3 分鐘）');
                console.log('2. 部署完成後，聊天功能應該可以正常工作');
                console.log('3. 您可以訪問 https://echochat-api.onrender.com/api/chat 測試');
                console.log('\n💡 提示：如果仍有問題，可以運行 node check-render-deployment.js 檢查部署狀態');
                rl.close();
            })
            .catch((error) => {
                console.error('❌ 更新失敗:', error.message);
                rl.close();
                process.exit(1);
            });
    });
});

// 更新環境變數函數
function updateEnvVars(envVars) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(envVars);

        const options = {
            hostname: 'api.render.com',
            port: 443,
            path: `/v1/services/${SERVICE_ID}/env-vars`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${RENDER_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(responseData);
                } else {
                    reject(new Error(`API 請求失敗: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}