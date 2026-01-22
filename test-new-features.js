const axios = require('axios');

// 測試配置
const config = {
    baseURL: 'https://echochat-api.onrender.com',
    timeout: 10000
};

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 測試API端點
async function testEndpoint(endpoint, method = 'GET', data = null) {
    try {
        const url = `${config.baseURL}${endpoint}`;
        log(`測試 ${method} ${url}`, 'cyan');
        
        const response = await axios({
            method,
            url,
            data,
            timeout: config.timeout
        });
        
        log(`✅ ${endpoint} - 成功 (${response.status})`, 'green');
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            log(`❌ ${endpoint} - 失敗 (${error.response.status})`, 'red');
            log(`   錯誤: ${error.response.data?.error || error.response.statusText}`, 'red');
        } else {
            log(`❌ ${endpoint} - 錯誤: ${error.message}`, 'red');
        }
        return { success: false, error: error.message };
    }
}

// 測試Gemini功能
async function testGeminiFeatures() {
    log('\n=== 測試 Gemini 系列功能 ===', 'bright');
    
    const tests = [
        { endpoint: '/api/gemini/ai-models/supported', method: 'GET' },
        { endpoint: '/api/gemini/roles', method: 'GET' },
        { 
            endpoint: '/api/gemini/roles', 
            method: 'POST',
            data: {
                name: '測試角色',
                permissions: ['read', 'write'],
                description: '測試用角色'
            }
        }
    ];
    
    for (const test of tests) {
        await testEndpoint(test.endpoint, test.method, test.data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 延遲1秒
    }
}

// 測試企業管理功能
async function testEnterpriseManagement() {
    log('\n=== 測試企業管理功能 ===', 'bright');
    
    const tests = [
        { endpoint: '/api/enterprise/users', method: 'GET' },
        { endpoint: '/api/enterprise/departments', method: 'GET' },
        { endpoint: '/api/enterprise/roles', method: 'GET' },
        {
            endpoint: '/api/enterprise/users',
            method: 'POST',
            data: {
                name: '測試用戶',
                email: 'test@example.com',
                role: '客服專員',
                department: '客服部',
                password: 'test123'
            }
        }
    ];
    
    for (const test of tests) {
        await testEndpoint(test.endpoint, test.method, test.data);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 測試系統設定功能
async function testSystemSettings() {
    log('\n=== 測試系統設定功能 ===', 'bright');
    
    const tests = [
        { endpoint: '/api/system/settings', method: 'GET' },
        { endpoint: '/api/system/features', method: 'GET' },
        { endpoint: '/api/system/stats', method: 'GET' },
        {
            endpoint: '/api/system/company',
            method: 'POST',
            data: {
                name: '測試公司',
                logo: '/images/test-logo.png',
                description: '測試公司描述',
                contact_info: {
                    email: 'contact@test.com',
                    phone: '+886-2-1234-5678'
                }
            }
        }
    ];
    
    for (const test of tests) {
        await testEndpoint(test.endpoint, test.method, test.data);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 測試AI聊天機器人功能
async function testAIChatbotService() {
    log('\n=== 測試 AI 聊天機器人服務 ===', 'bright');
    
    const tests = [
        { endpoint: '/api/ai-chatbot/robots', method: 'GET' },
        { endpoint: '/api/ai-chatbot/conversations', method: 'GET' },
        { endpoint: '/api/ai-chatbot/stats/comprehensive', method: 'GET' },
        { endpoint: '/api/ai-chatbot/knowledge', method: 'GET' },
        {
            endpoint: '/api/ai-chatbot/robots',
            method: 'POST',
            data: {
                name: '測試機器人',
                type: 'general',
                description: '測試用機器人',
                config: {}
            }
        },
        {
            endpoint: '/api/ai-chatbot/chat/multimodal',
            method: 'POST',
            data: {
                message: '你好，這是一個測試訊息',
                conversationId: 'test_conv_123'
            }
        }
    ];
    
    for (const test of tests) {
        await testEndpoint(test.endpoint, test.method, test.data);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 測試前端頁面
async function testFrontendPages() {
    log('\n=== 測試前端頁面 ===', 'bright');
    
    const frontendURL = 'https://echochat-frontend.onrender.com';
    const pages = [
        '/gemini-features.html',
        '/enterprise-management.html'
    ];
    
    for (const page of pages) {
        try {
            const url = `${frontendURL}${page}`;
            log(`測試頁面: ${url}`, 'cyan');
            
            const response = await axios.get(url, { timeout: config.timeout });
            
            if (response.status === 200) {
                log(`✅ ${page} - 可訪問`, 'green');
            } else {
                log(`❌ ${page} - 無法訪問 (${response.status})`, 'red');
            }
        } catch (error) {
            log(`❌ ${page} - 錯誤: ${error.message}`, 'red');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 主測試函數
async function runAllTests() {
    log('開始測試 EchoChat 新功能...', 'bright');
    log(`後端URL: ${config.baseURL}`, 'blue');
    log(`前端URL: https://echochat-frontend.onrender.com`, 'blue');
    
    try {
        // 測試後端API
        await testGeminiFeatures();
        await testEnterpriseManagement();
        await testSystemSettings();
        await testAIChatbotService();
        
        // 測試前端頁面
        await testFrontendPages();
        
        log('\n=== 測試完成 ===', 'bright');
        log('所有測試已完成，請檢查上述結果。', 'green');
        
    } catch (error) {
        log(`測試過程中發生錯誤: ${error.message}`, 'red');
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    runAllTests().catch(error => {
        log(`執行失敗: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    testGeminiFeatures,
    testEnterpriseManagement,
    testSystemSettings,
    testAIChatbotService,
    testFrontendPages,
    runAllTests
}; 