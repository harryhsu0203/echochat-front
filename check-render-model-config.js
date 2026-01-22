#!/usr/bin/env node

/**
 * 檢查 Render 上的模型配置
 */

const https = require('https');

console.log('=== 檢查 Render 模型配置 ===\n');

// 執行 API 請求
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        https.get(`https://echochat-api.onrender.com${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

// 主函數
async function main() {
    try {
        // 檢查健康狀態
        console.log('📋 檢查 API 健康狀態...');
        const health = await makeRequest('/api/health');
        console.log('健康檢查:', health.success ? '✅ 成功' : '❌ 失敗');
        console.log('');
        
        // 檢查模型端點
        console.log('📋 檢查模型配置...');
        const models = await makeRequest('/api/models');
        if (models.models) {
            console.log('可用模型:');
            models.models.forEach(model => {
                console.log(`  - ${model.id}: ${model.description}`);
            });
        } else {
            console.log('模型端點回應:', JSON.stringify(models, null, 2));
        }
        console.log('');
        
        // 檢查測試端點
        console.log('📋 檢查測試端點...');
        const test = await makeRequest('/api/test');
        if (test.ai_config) {
            console.log('AI 配置:');
            console.log('  助理名稱:', test.ai_config.assistant_name);
            console.log('  模型:', test.ai_config.llm);
            console.log('  使用場景:', test.ai_config.use_case);
        } else {
            console.log('測試端點回應:', JSON.stringify(test, null, 2));
        }
        
        console.log('');
        console.log('=== 診斷建議 ===');
        console.log('如果模型參數仍然有問題，可能的原因：');
        console.log('1. Render 還在部署中（需要等待 2-3 分鐘）');
        console.log('2. 數據庫中的 AI 配置可能有問題');
        console.log('3. 環境變數可能需要重新設置');
        console.log('');
        console.log('💡 您可以查看 Render Dashboard 確認部署狀態：');
        console.log('https://dashboard.render.com/web/srv-ct8vdatsvqrc73dt1o60/events');
        
    } catch (error) {
        console.error('檢查失敗:', error.message);
    }
}

// 執行
main();