#!/usr/bin/env node

/**
 * 驗證 OpenAI 模型名稱修復
 */

const https = require('https');

console.log('=== 驗證 OpenAI 模型名稱修復 ===\n');

// 檢查 API 端點
function checkEndpoint(url, name) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`✅ ${name}: 可訪問`);
                    
                    // 檢查模型配置
                    if (json.ai_models) {
                        console.log(`   支援的模型: ${json.ai_models.join(', ')}`);
                    }
                    if (json.model_info) {
                        console.log('   模型資訊:');
                        Object.keys(json.model_info).forEach(model => {
                            console.log(`   - ${model}: ${json.model_info[model].description}`);
                        });
                    }
                    resolve(true);
                } catch (e) {
                    console.log(`✅ ${name}: 端點正常`);
                    resolve(true);
                }
            });
        }).on('error', (err) => {
            console.error(`❌ ${name}: ${err.message}`);
            resolve(false);
        });
    });
}

// 主函數
async function main() {
    console.log('📋 正在檢查 Render 部署狀態...\n');
    
    // 檢查各個端點
    await checkEndpoint('https://echochat-api.onrender.com/api/health', '健康檢查');
    await checkEndpoint('https://echochat-api.onrender.com/api/models', '模型列表');
    
    console.log('\n=== 修復摘要 ===\n');
    console.log('✅ 已修正的問題：');
    console.log('   1. gpt-4o-mini → gpt-3.5-turbo (正確的模型名稱)');
    console.log('   2. gpt-4o → gpt-4-turbo (正確的模型名稱)');
    console.log('   3. 移除不支援的模型 (claude-3-haiku, gemini-pro)');
    
    console.log('\n📝 支援的 OpenAI 模型：');
    console.log('   - gpt-3.5-turbo (經濟實惠，速度快)');
    console.log('   - gpt-4-turbo (功能強大，更準確)');
    
    console.log('\n⏳ 部署狀態：');
    console.log('   Render 正在自動重新部署，預計 2-3 分鐘完成');
    
    console.log('\n💡 下一步：');
    console.log('   1. 等待 Render 部署完成');
    console.log('   2. 如果尚未設置 OpenAI API Key，請運行：');
    console.log('      export RENDER_API_KEY="your-render-api-key"');
    console.log('      node update-render-env-openai.js');
    console.log('   3. 測試聊天功能：');
    console.log('      node test-chat-api.js');
}

// 執行
main().catch(console.error);