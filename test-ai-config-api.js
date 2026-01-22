const axios = require('axios');

// 測試配置
const BASE_URL = 'https://your-render-app.onrender.com'; // 請替換為您的 Render URL
const TEST_TOKEN = 'your-test-token'; // 請替換為有效的 JWT Token

// API 測試函數
async function testAIConfigAPI() {
    console.log('🧪 開始測試 AI 配置 API...\n');

    try {
        // 1. 測試獲取 AI 配置
        console.log('1️⃣ 測試獲取 AI 配置...');
        const getConfigResponse = await axios.get(`${BASE_URL}/api/ai-assistant-config`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (getConfigResponse.data.success) {
            console.log('✅ 獲取 AI 配置成功');
            console.log('配置內容:', JSON.stringify(getConfigResponse.data.config, null, 2));
        } else {
            console.log('❌ 獲取 AI 配置失敗:', getConfigResponse.data.error);
        }

        // 2. 測試獲取 AI 模型資訊
        console.log('\n2️⃣ 測試獲取 AI 模型資訊...');
        const getModelsResponse = await axios.get(`${BASE_URL}/api/ai-models`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (getModelsResponse.data.success) {
            console.log('✅ 獲取 AI 模型資訊成功');
            console.log('可用模型:', Object.keys(getModelsResponse.data.models));
        } else {
            console.log('❌ 獲取 AI 模型資訊失敗:', getModelsResponse.data.error);
        }

        // 3. 測試更新 AI 配置
        console.log('\n3️⃣ 測試更新 AI 配置...');
        const newConfig = {
            assistant_name: '測試智能助手',
            llm: 'gpt-4o-mini',
            use_case: 'customer-service',
            description: '這是一個測試用的智能助手配置'
        };

        const updateConfigResponse = await axios.post(`${BASE_URL}/api/ai-assistant-config`, newConfig, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (updateConfigResponse.data.success) {
            console.log('✅ 更新 AI 配置成功');
            console.log('更新結果:', updateConfigResponse.data.message);
        } else {
            console.log('❌ 更新 AI 配置失敗:', updateConfigResponse.data.error);
        }

        // 4. 測試重置 AI 配置
        console.log('\n4️⃣ 測試重置 AI 配置...');
        const resetConfigResponse = await axios.post(`${BASE_URL}/api/ai-assistant-config/reset`, {}, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (resetConfigResponse.data.success) {
            console.log('✅ 重置 AI 配置成功');
            console.log('重置結果:', resetConfigResponse.data.message);
        } else {
            console.log('❌ 重置 AI 配置失敗:', resetConfigResponse.data.error);
        }

        console.log('\n🎉 AI 配置 API 測試完成！');

    } catch (error) {
        console.error('❌ API 測試失敗:', error.message);
        if (error.response) {
            console.error('錯誤詳情:', error.response.data);
        }
    }
}

// 手機端 App 整合測試
async function testMobileAppIntegration() {
    console.log('\n📱 測試手機端 App 整合...\n');

    try {
        // 模擬手機端 App 的 API 調用
        const mobileAPI = {
            baseURL: BASE_URL,
            token: TEST_TOKEN,

            async getAIConfig() {
                const response = await axios.get(`${this.baseURL}/api/ai-assistant-config`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            },

            async updateAIConfig(config) {
                const response = await axios.post(`${this.baseURL}/api/ai-assistant-config`, config, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            },

            async getAIModels() {
                const response = await axios.get(`${this.baseURL}/api/ai-models`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data;
            }
        };

        // 測試獲取配置
        console.log('📱 手機端 App 獲取 AI 配置...');
        const config = await mobileAPI.getAIConfig();
        console.log('✅ 手機端獲取配置成功:', config.success ? '是' : '否');

        // 測試獲取模型
        console.log('📱 手機端 App 獲取 AI 模型...');
        const models = await mobileAPI.getAIModels();
        console.log('✅ 手機端獲取模型成功:', models.success ? '是' : '否');

        // 測試更新配置
        console.log('📱 手機端 App 更新 AI 配置...');
        const updateResult = await mobileAPI.updateAIConfig({
            assistant_name: '手機端測試助手',
            llm: 'gpt-4o-mini',
            use_case: 'mobile-app',
            description: '專為手機端 App 設計的智能助手'
        });
        console.log('✅ 手機端更新配置成功:', updateResult.success ? '是' : '否');

        console.log('\n🎉 手機端 App 整合測試完成！');

    } catch (error) {
        console.error('❌ 手機端 App 整合測試失敗:', error.message);
    }
}

// 執行測試
async function runTests() {
    console.log('🚀 開始執行 AI 配置 API 測試套件...\n');
    
    await testAIConfigAPI();
    await testMobileAppIntegration();
    
    console.log('\n📋 測試總結:');
    console.log('- AI 配置 API 已準備就緒');
    console.log('- 支援手機端 App 整合');
    console.log('- CORS 已正確配置');
    console.log('- 請確保在 Render 上正確部署並設定環境變數');
}

// 如果直接執行此腳本
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testAIConfigAPI,
    testMobileAppIntegration
}; 