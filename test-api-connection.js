// 測試的API端點
const API_URLS = [
    'https://echochat-api.onrender.com/api/health',
    'https://echochat-backend.onrender.com/api/health',
    'http://localhost:3000/api/health'
];

async function testApiConnection() {
    console.log('🔍 開始測試 API 連接...\n');
    
    for (const url of API_URLS) {
        try {
            console.log(`📡 測試: ${url}`);
            const response = await fetch(url, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log(`✅ 成功 - 狀態: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`📄 回應:`, data);
            } else {
                console.log(`❌ HTTP 錯誤: ${response.status} ${response.statusText}`);
            }
            console.log('---\n');
        } catch (error) {
            console.log(`❌ 失敗 - ${error.message}`);
            console.log('---\n');
        }
    }
}

// 執行測試
testApiConnection().catch(console.error); 