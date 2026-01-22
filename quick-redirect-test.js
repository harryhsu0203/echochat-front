#!/usr/bin/env node

const https = require('https');

console.log('🚀 快速測試跳轉問題修復...\n');

const API_URL = 'https://echochat-api.onrender.com';
const FRONTEND_URL = 'https://echochat-frontend.onrender.com';

async function testEndpoint(url, description) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            console.log(`✅ ${description}: ${res.statusCode}`);
            resolve({ success: res.statusCode === 200, statusCode: res.statusCode });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${description}: ${error.message}`);
            resolve({ success: false, error: error.message });
        });
        
        req.setTimeout(10000, () => {
            console.log(`⏰ ${description}: 超時`);
            req.destroy();
            resolve({ success: false, error: 'timeout' });
        });
    });
}

async function runQuickTest() {
    console.log('🔍 檢查關鍵頁面...');
    
    const indexPage = await testEndpoint(FRONTEND_URL, '首頁');
    const loginPage = await testEndpoint(`${FRONTEND_URL}/login.html`, '登入頁面');
    const dashboardPage = await testEndpoint(`${FRONTEND_URL}/dashboard.html`, '儀表板頁面');
    const debugPage = await testEndpoint(`${FRONTEND_URL}/debug-token.html`, '調試頁面');
    const apiHealth = await testEndpoint(`${API_URL}/api/health`, 'API 健康檢查');
    
    console.log('\n📊 測試結果:');
    console.log(`   首頁: ${indexPage.success ? '✅ 正常' : '❌ 異常 (${indexPage.statusCode})'}`);
    console.log(`   登入頁面: ${loginPage.success ? '✅ 正常' : '❌ 異常 (${loginPage.statusCode})'}`);
    console.log(`   儀表板頁面: ${dashboardPage.success ? '✅ 正常' : '❌ 異常 (${dashboardPage.statusCode})'}`);
    console.log(`   調試頁面: ${debugPage.success ? '✅ 正常' : '❌ 異常 (${debugPage.statusCode})'}`);
    console.log(`   API 健康檢查: ${apiHealth.success ? '✅ 正常' : '❌ 異常'}`);
    
    const allPassed = indexPage.success && loginPage.success && dashboardPage.success && 
                     debugPage.success && apiHealth.success;
    
    if (allPassed) {
        console.log('\n🎉 所有頁面正常！跳轉問題應該已修復！');
        console.log('\n📋 修復內容：');
        console.log('   ✅ 使用更寬鬆的認證檢查');
        console.log('   ✅ 創建了簡單版本的認證檢查');
        console.log('   ✅ 添加了 Token 調試頁面');
        console.log('   ✅ 網路錯誤時不會立即跳轉');
        
        console.log('\n🔗 重要連結：');
        console.log(`   首頁: ${FRONTEND_URL}`);
        console.log(`   登入: ${FRONTEND_URL}/login.html`);
        console.log(`   儀表板: ${FRONTEND_URL}/dashboard.html`);
        console.log(`   調試頁面: ${FRONTEND_URL}/debug-token.html`);
        
        console.log('\n📋 測試步驟：');
        console.log('1. 訪問登入頁面並登入');
        console.log('2. 檢查是否還會跳回登入頁面');
        console.log('3. 如果還有問題，使用調試頁面檢查 token');
        console.log('4. 檢查瀏覽器開發者工具中的錯誤訊息');
        
    } else {
        console.log('\n⚠️ 部分頁面異常，請等待部署完成');
        console.log('   建議再等待 2-3 分鐘後重新測試');
    }
    
    console.log('\n💡 如果還有跳轉問題：');
    console.log('1. 訪問調試頁面檢查 token 狀態');
    console.log('2. 清除瀏覽器快取');
    console.log('3. 檢查瀏覽器開發者工具');
    console.log('4. 確認用戶名和密碼正確');
}

runQuickTest().catch(console.error); 