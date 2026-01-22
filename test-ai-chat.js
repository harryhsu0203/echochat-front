const axios = require('axios');

// 測試配置
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM1NzQ5NjAwLCJleHAiOjE3MzU4MzYwMDB9.test'; // 請替換為有效的JWT token

async function testAIChat() {
    console.log('🤖 開始測試 AI 聊天功能...\n');

    try {
        // 1. 測試獲取AI配置
        console.log('1️⃣ 測試獲取 AI 配置...');
        const configResponse = await axios.get(`${BASE_URL}/api/ai-assistant-config`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        
        if (configResponse.data.success) {
            console.log('✅ AI 配置獲取成功');
            console.log('   配置內容:', JSON.stringify(configResponse.data.config, null, 2));
        } else {
            console.log('❌ AI 配置獲取失敗:', configResponse.data.error);
        }

        // 2. 測試獲取AI模型列表
        console.log('\n2️⃣ 測試獲取 AI 模型列表...');
        const modelsResponse = await axios.get(`${BASE_URL}/api/ai-models`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        
        if (modelsResponse.data.success) {
            console.log('✅ AI 模型列表獲取成功');
            console.log('   可用模型數量:', Object.keys(modelsResponse.data.models).length);
            Object.keys(modelsResponse.data.models).forEach(modelKey => {
                const model = modelsResponse.data.models[modelKey];
                console.log(`   - ${model.name} (${modelKey}): ${model.description}`);
            });
        } else {
            console.log('❌ AI 模型列表獲取失敗:', modelsResponse.data.error);
        }

        // 3. 測試AI聊天功能
        console.log('\n3️⃣ 測試 AI 聊天功能...');
        const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
            message: '你好，請介紹一下你自己',
            conversationId: null
        }, {
            headers: { 
                Authorization: `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (chatResponse.data.success) {
            console.log('✅ AI 聊天功能測試成功');
            console.log('   AI 回應:', chatResponse.data.reply);
            console.log('   對話ID:', chatResponse.data.conversationId);
            console.log('   使用模型:', chatResponse.data.model);
            console.log('   助理名稱:', chatResponse.data.assistantName);
        } else {
            console.log('❌ AI 聊天功能測試失敗:', chatResponse.data.error);
        }

        // 4. 測試獲取對話歷史
        console.log('\n4️⃣ 測試獲取對話歷史...');
        const conversationsResponse = await axios.get(`${BASE_URL}/api/conversations`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        
        if (conversationsResponse.data.success) {
            console.log('✅ 對話歷史獲取成功');
            console.log('   對話數量:', conversationsResponse.data.conversations.length);
            conversationsResponse.data.conversations.forEach((conv, index) => {
                console.log(`   對話 ${index + 1}: ${conv.messageCount} 條訊息`);
            });
        } else {
            console.log('❌ 對話歷史獲取失敗:', conversationsResponse.data.error);
        }

        // 5. 測試連續對話
        if (chatResponse.data.success && chatResponse.data.conversationId) {
            console.log('\n5️⃣ 測試連續對話...');
            const followUpResponse = await axios.post(`${BASE_URL}/api/chat`, {
                message: '謝謝你的介紹，你能幫我做什麼？',
                conversationId: chatResponse.data.conversationId
            }, {
                headers: { 
                    Authorization: `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (followUpResponse.data.success) {
                console.log('✅ 連續對話測試成功');
                console.log('   AI 回應:', followUpResponse.data.reply);
                console.log('   對話ID:', followUpResponse.data.conversationId);
            } else {
                console.log('❌ 連續對話測試失敗:', followUpResponse.data.error);
            }
        }

        console.log('\n🎉 AI 聊天功能測試完成！');

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        
        if (error.response) {
            console.error('   狀態碼:', error.response.status);
            console.error('   錯誤訊息:', error.response.data);
        }
    }
}

// 執行測試
testAIChat(); 