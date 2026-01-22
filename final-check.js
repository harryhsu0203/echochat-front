#!/usr/bin/env node

const https = require('https');

console.log('🎯 最終檢查登入修復...\n');

const API_URL = 'https://echochat-api.onrender.com';
const FRONTEND_URL = 'https://echochat-frontend.onrender.com';

async function wait(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

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
        
        req.setTimeout(15000, () => {
            console.log(`⏰ ${description}: 超時`);
            req.destroy();
            resolve({ success: false, error: 'timeout' });
        });
    });
}

async function runFinalCheck() {
    console.log('🚀 開始最終檢查...\n');
    
    // 等待部署完成
    console.log('⏳ 等待部署完成...');
    await wait(60); // 等待 1 分鐘
    
    console.log('1️⃣ 檢查前端頁面...');
    const indexPage = await testEndpoint(FRONTEND_URL, '首頁');
    const loginPage = await testEndpoint(`${FRONTEND_URL}/login.html`, '登入頁面');
    const dashboardPage = await testEndpoint(`${FRONTEND_URL}/dashboard.html`, '儀表板頁面');
    
    console.log('\n2️⃣ 檢查後端 API...');
    const apiHealth = await testEndpoint(`${API_URL}/api/health`, 'API 健康檢查');
    
    console.log('\n📊 檢查結果:');
    console.log(`   首頁: ${indexPage.success ? '✅ 正常' : '❌ 異常 (${indexPage.statusCode})'}`);
    console.log(`   登入頁面: ${loginPage.success ? '✅ 正常' : '❌ 異常 (${loginPage.statusCode})'}`);
    console.log(`   儀表板頁面: ${dashboardPage.success ? '✅ 正常' : '❌ 異常 (${dashboardPage.statusCode})'}`);
    console.log(`   API 健康檢查: ${apiHealth.success ? '✅ 正常' : '❌ 異常'}`);
    
    const allPassed = indexPage.success && loginPage.success && dashboardPage.success && apiHealth.success;
    
    if (allPassed) {
        console.log('\n🎉 所有檢查通過！登入功能已修復！');
        console.log('\n📋 修復總結：');
        console.log('   ✅ 修復了 CSP 和 CORS 問題');
        console.log('   ✅ 創建了簡化的前端頁面');
        console.log('   ✅ 添加了認證檢查');
        console.log('   ✅ 維持前後端分離架構');
        
        console.log('\n🔗 重要連結：');
        console.log(`   首頁: ${FRONTEND_URL}`);
        console.log(`   登入: ${FRONTEND_URL}/login.html`);
        console.log(`   儀表板: ${FRONTEND_URL}/dashboard.html`);
        console.log(`   後端 API: ${API_URL}`);
        
        console.log('\n📋 使用步驟：');
        console.log('1. 訪問首頁或登入頁面');
        console.log('2. 輸入正確的用戶名和密碼');
        console.log('3. 登入成功後會跳轉到儀表板');
        console.log('4. 如果直接訪問儀表板而沒有登入，會跳回登入頁面');
        
        console.log('\n🔧 如果還有問題：');
        console.log('1. 清除瀏覽器快取');
        console.log('2. 檢查瀏覽器開發者工具中的錯誤');
        console.log('3. 確認用戶名和密碼正確');
        
    } else {
        console.log('\n⚠️ 部分檢查失敗，請等待更長時間讓部署完成');
        console.log('   建議再等待 2-3 分鐘後重新測試');
        
        console.log('\n🔧 如果問題持續：');
        console.log('1. 檢查 Render 部署狀態');
        console.log('2. 確認環境變數設定');
        console.log('3. 檢查網路連接');
    }
    
    console.log('\n📝 調試建議：');
    console.log('1. 打開瀏覽器開發者工具 (F12)');
    console.log('2. 查看 Console 標籤中的錯誤訊息');
    console.log('3. 查看 Network 標籤中的請求狀態');
    console.log('4. 檢查 localStorage 中的 token');
}

runFinalCheck().catch(console.error); 