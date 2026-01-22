const axios = require('axios');

console.log('🔍 檢查 Render 部署狀態...');
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

// 檢查服務狀態
async function checkService(url, serviceName) {
    try {
        logInfo(`檢查 ${serviceName}...`);
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'EchoChat-Deployment-Check/1.0'
            }
        });
        
        if (response.status === 200) {
            logSuccess(`${serviceName} 運行正常 (${response.status})`);
            return true;
        } else {
            logWarning(`${serviceName} 回應異常 (${response.status})`);
            return false;
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            logError(`${serviceName} 無法連接 - 可能還在部署中`);
        } else if (error.response) {
            logWarning(`${serviceName} 回應錯誤 (${error.response.status}): ${error.response.statusText}`);
        } else {
            logError(`${serviceName} 檢查失敗: ${error.message}`);
        }
        return false;
    }
}

// 檢查 API 健康狀態
async function checkApiHealth() {
    try {
        logInfo('檢查後端 API 健康狀態...');
        const response = await axios.get('https://echochat-api.onrender.com/api/health', {
            timeout: 10000
        });
        
        if (response.status === 200) {
            logSuccess('後端 API 健康檢查通過');
            console.log('📊 健康狀態:', response.data);
            return true;
        } else {
            logWarning(`後端 API 健康檢查失敗 (${response.status})`);
            return false;
        }
    } catch (error) {
        logError(`後端 API 健康檢查失敗: ${error.message}`);
        return false;
    }
}

// 檢查前端功能
async function checkFrontendFunctionality() {
    try {
        logInfo('檢查前端功能...');
        const response = await axios.get('https://echochat-backend.onrender.com/index.html', {
            timeout: 10000
        });
        
        if (response.status === 200) {
            logSuccess('前端頁面載入正常');
            return true;
        } else {
            logWarning(`前端頁面載入異常 (${response.status})`);
            return false;
        }
    } catch (error) {
        logError(`前端功能檢查失敗: ${error.message}`);
        return false;
    }
}

// 主檢查流程
async function main() {
    console.log('🚀 開始檢查 Render 部署狀態...\n');
    
    const services = [
        { url: 'https://echochat-api.onrender.com', name: '後端 API' },
        { url: 'https://echochat-backend.onrender.com', name: '前端網站' }
    ];
    
    let allServicesOk = true;
    
    // 檢查基本服務狀態
    for (const service of services) {
        const isOk = await checkService(service.url, service.name);
        if (!isOk) {
            allServicesOk = false;
        }
        console.log(''); // 空行
    }
    
    // 檢查 API 健康狀態
    if (allServicesOk) {
        await checkApiHealth();
        console.log('');
    }
    
    // 檢查前端功能
    if (allServicesOk) {
        await checkFrontendFunctionality();
        console.log('');
    }
    
    // 總結
    console.log('📋 部署狀態總結:');
    console.log('==================================');
    
    if (allServicesOk) {
        logSuccess('🎉 所有服務運行正常！');
        console.log('\n🌐 服務 URL:');
        console.log('   - 前端: https://echochat-backend.onrender.com');
        console.log('   - 後端: https://echochat-api.onrender.com');
        console.log('   - 健康檢查: https://echochat-api.onrender.com/api/health');
        
        console.log('\n💡 下一步:');
        console.log('1. 測試登入功能');
        console.log('2. 測試 AI 助理功能');
        console.log('3. 檢查所有頁面是否正常載入');
        
    } else {
        logWarning('⚠️ 部分服務可能有問題');
        console.log('\n🔍 建議檢查:');
        console.log('1. 等待部署完成（通常需要 2-5 分鐘）');
        console.log('2. 檢查 Render 儀表板: https://dashboard.render.com');
        console.log('3. 查看部署日誌');
        console.log('4. 確認環境變數設置正確');
    }
    
    console.log('\n📊 詳細狀態:');
    console.log('   - 前端狀態: https://echochat-backend.onrender.com');
    console.log('   - 後端狀態: https://echochat-api.onrender.com');
    console.log('   - Render 儀表板: https://dashboard.render.com');
}

// 執行檢查
main().catch(error => {
    logError(`檢查過程中發生錯誤: ${error.message}`);
}); 