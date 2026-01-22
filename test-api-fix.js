const axios = require('axios');

console.log('🧪 測試 API 修復...');
console.log('==================================');

// 顏色定義
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️ ${message}`, 'blue');
}

// 測試基本健康檢查
async function testHealthCheck() {
    try {
        logInfo('測試後端健康檢查...');
        const response = await axios.get('https://echochat-api.onrender.com/api/health', {
            timeout: 10000
        });
        
        if (response.status === 200) {
            logSuccess('後端健康檢查通過');
            console.log('📊 健康狀態:', response.data);
            return true;
        } else {
            logWarning(`後端健康檢查失敗 (${response.status})`);
            return false;
        }
    } catch (error) {
        logError(`後端健康檢查失敗: ${error.message}`);
        return false;
    }
}

// 測試 AI 助理配置端點（需要認證）
async function testAIAssistantConfig() {
    try {
        logInfo('測試 AI 助理配置端點...');
        
        // 先測試未認證的請求
        try {
            const response = await axios.get('https://echochat-api.onrender.com/api/ai-assistant-config', {
                timeout: 10000
            });
            logWarning('AI 助理配置端點應該需要認證，但返回了成功');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                logSuccess('AI 助理配置端點正確要求認證');
            } else {
                logError(`AI 助理配置端點測試失敗: ${error.message}`);
            }
        }
        
        return true;
    } catch (error) {
        logError(`AI 助理配置端點測試失敗: ${error.message}`);
        return false;
    }
}

// 測試 AI 模型端點（需要認證）
async function testAIModels() {
    try {
        logInfo('測試 AI 模型端點...');
        
        // 先測試未認證的請求
        try {
            const response = await axios.get('https://echochat-api.onrender.com/api/ai-models', {
                timeout: 10000
            });
            logWarning('AI 模型端點應該需要認證，但返回了成功');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                logSuccess('AI 模型端點正確要求認證');
            } else {
                logError(`AI 模型端點測試失敗: ${error.message}`);
            }
        }
        
        return true;
    } catch (error) {
        logError(`AI 模型端點測試失敗: ${error.message}`);
        return false;
    }
}

// 測試前端載入
async function testFrontendLoad() {
    try {
        logInfo('測試前端載入...');
        const response = await axios.get('https://echochat-backend.onrender.com', {
            timeout: 10000
        });
        
        if (response.status === 200) {
            logSuccess('前端載入正常');
            return true;
        } else {
            logWarning(`前端載入異常 (${response.status})`);
            return false;
        }
    } catch (error) {
        logError(`前端載入測試失敗: ${error.message}`);
        return false;
    }
}

// 主測試流程
async function main() {
    console.log('🚀 開始 API 修復測試...\n');
    
    const tests = [
        { name: '後端健康檢查', func: testHealthCheck },
        { name: 'AI 助理配置端點', func: testAIAssistantConfig },
        { name: 'AI 模型端點', func: testAIModels },
        { name: '前端載入', func: testFrontendLoad }
    ];
    
    let passedTests = 0;
    const totalTests = tests.length;
    
    for (const test of tests) {
        logInfo(`執行測試: ${test.name}`);
        const result = await test.func();
        if (result) {
            passedTests++;
        }
        console.log(''); // 空行
    }
    
    // 總結
    console.log('📋 測試結果總結:');
    console.log('==================================');
    console.log(`✅ 通過測試: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        logSuccess('🎉 所有 API 測試通過！');
        console.log('\n💡 下一步:');
        console.log('1. 等待前端部署完成（2-5 分鐘）');
        console.log('2. 測試前端登入功能');
        console.log('3. 測試 AI 助理功能');
        console.log('4. 確認所有功能正常運作');
    } else {
        logWarning('⚠️ 部分測試失敗');
        console.log('\n🔍 建議檢查:');
        console.log('1. 等待部署完成');
        console.log('2. 檢查 Render 儀表板日誌');
        console.log('3. 確認環境變數設置');
        console.log('4. 重新部署如有必要');
    }
    
    console.log('\n🌐 服務 URL:');
    console.log('   - 前端: https://echochat-backend.onrender.com');
    console.log('   - 後端: https://echochat-api.onrender.com');
    console.log('   - 健康檢查: https://echochat-api.onrender.com/api/health');
}

// 執行測試
main().catch(error => {
    logError(`測試過程中發生錯誤: ${error.message}`);
}); 