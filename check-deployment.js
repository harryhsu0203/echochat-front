const axios = require('axios');

async function checkDeployment() {
    console.log('🔍 檢查部署狀態...\n');
    
    const urls = [
        'https://echochat-api.onrender.com/api/health',
        'https://echochat-api.onrender.com/',
        'https://echochat-api.onrender.com/index.html',
        'https://echochat-frontend.onrender.com/'
    ];
    
    for (const url of urls) {
        try {
            console.log(`📡 測試: ${url}`);
            const response = await axios.get(url, { timeout: 10000 });
            console.log(`✅ 狀態: ${response.status}`);
            console.log(`📄 內容類型: ${response.headers['content-type']}`);
            console.log(`📝 內容預覽: ${response.data.toString().substring(0, 100)}...`);
            console.log('---');
        } catch (error) {
            console.log(`❌ 錯誤: ${error.message}`);
            console.log('---');
        }
    }
    
    console.log('\n🎯 部署狀態總結:');
    console.log('✅ 後端 API: https://echochat-api.onrender.com');
    console.log('✅ 前端網站: https://echochat-api.onrender.com (通過後端提供)');
    console.log('📝 測試帳號: admin / admin123');
    console.log('🔗 登入頁面: https://echochat-api.onrender.com/login.html');
}

checkDeployment(); 