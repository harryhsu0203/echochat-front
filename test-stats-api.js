const axios = require('axios');

console.log('🧪 測試統計數據 API...');

// 測試配置
const API_BASE_URL = 'https://echochat-api.onrender.com/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJzdW5ueWhhcnJ5MSIsIm5hbWUiOiLns7vntbHnrqHnkIblk6EiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQ0MDc2ODgsImV4cCI6MTc1NTAxMjQ4OH0.W6GWX8Lk4HhhWlbA7Q9WPdkdkd3thy13vH56kL5CjrI';

// 測試統計數據 API
async function testStatsAPI() {
    console.log('\n🔍 測試統計數據 API...');
    try {
        const response = await axios.get(`${API_BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        if (response.data.success) {
            const stats = response.data.data;
            console.log('✅ 統計數據 API 正常');
            console.log('📊 統計數據:');
            console.log(`   - 總用戶數: ${stats.totalUsers}`);
            console.log(`   - 總訊息數: ${stats.totalMessages}`);
            console.log(`   - 知識庫項目: ${stats.knowledgeItems}`);
            console.log(`   - 平均回應時間: ${stats.avgResponseTime}`);
            console.log(`   - 最近用戶: ${stats.recentUsers}`);
            console.log(`   - 知識庫使用: ${stats.knowledgeUsage}`);
            console.log(`   - 最後更新: ${stats.lastUpdated}`);
            return true;
        } else {
            console.error('❌ 統計數據 API 返回錯誤:', response.data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ 統計數據 API 測試失敗:', error.response?.data || error.message);
        return false;
    }
}

// 測試活躍度數據 API
async function testActivityAPI() {
    console.log('\n🔍 測試活躍度數據 API...');
    try {
        const response = await axios.get(`${API_BASE_URL}/stats/activity`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        if (response.data.success) {
            const activityData = response.data.data;
            console.log('✅ 活躍度數據 API 正常');
            console.log('📈 活躍度數據:');
            console.log(`   - 標籤: ${activityData.labels.join(', ')}`);
            console.log(`   - 數據: ${activityData.datasets[0].data.join(', ')}`);
            return true;
        } else {
            console.error('❌ 活躍度數據 API 返回錯誤:', response.data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ 活躍度數據 API 測試失敗:', error.response?.data || error.message);
        return false;
    }
}

// 測試最近活動 API
async function testRecentActivityAPI() {
    console.log('\n🔍 測試最近活動 API...');
    try {
        const response = await axios.get(`${API_BASE_URL}/stats/recent-activity`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        if (response.data.success) {
            const activities = response.data.data;
            console.log('✅ 最近活動 API 正常');
            console.log('📋 最近活動:');
            activities.forEach((activity, index) => {
                console.log(`   ${index + 1}. ${activity.text} (${activity.time})`);
            });
            return true;
        } else {
            console.error('❌ 最近活動 API 返回錯誤:', response.data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ 最近活動 API 測試失敗:', error.response?.data || error.message);
        return false;
    }
}

// 主測試函數
async function runTests() {
    console.log('🚀 開始測試統計數據 API...\n');
    
    const results = {
        statsAPI: await testStatsAPI(),
        activityAPI: await testActivityAPI(),
        recentActivityAPI: await testRecentActivityAPI()
    };
    
    console.log('\n📊 測試結果總結:');
    console.log('1. 統計數據 API:', results.statsAPI ? '✅ 通過' : '❌ 失敗');
    console.log('2. 活躍度數據 API:', results.activityAPI ? '✅ 通過' : '❌ 失敗');
    console.log('3. 最近活動 API:', results.recentActivityAPI ? '✅ 通過' : '❌ 失敗');
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 所有 API 測試通過！');
        console.log('💡 儀表板現在可以顯示真實的統計數據');
    } else {
        console.log('\n⚠️ 部分 API 測試失敗');
        console.log('🔧 建議檢查:');
        console.log('1. 後端服務是否已部署最新版本');
        console.log('2. API 端點是否正確');
        console.log('3. 認證 token 是否有效');
    }
}

// 執行測試
runTests().catch(console.error); 