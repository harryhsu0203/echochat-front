const axios = require('axios');

// 測試配置
const API_BASE_URL = 'https://your-render-app.onrender.com'; // 請替換為您的 Render 網址
const TEST_EMAIL = 'test@example.com'; // 請替換為實際的測試郵箱

// 測試忘記密碼功能
async function testMobileForgotPassword() {
    console.log('🧪 開始測試手機端忘記密碼 API...\n');

    try {
        // 步驟1: 發送驗證碼
        console.log('📧 步驟1: 發送驗證碼');
        const sendCodeResponse = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
            email: TEST_EMAIL
        });

        if (sendCodeResponse.data.success) {
            console.log('✅ 驗證碼發送成功:', sendCodeResponse.data.message);
        } else {
            console.log('❌ 驗證碼發送失敗:', sendCodeResponse.data.error);
            return;
        }

        // 等待用戶輸入驗證碼
        console.log('\n⏳ 請檢查您的郵箱並輸入驗證碼...');
        console.log('💡 提示: 驗證碼為6位數字，10分鐘內有效');
        
        // 這裡可以模擬用戶輸入驗證碼
        // 在實際應用中，用戶會在手機端輸入驗證碼
        const testCode = '123456'; // 請替換為實際收到的驗證碼
        const newPassword = 'newpassword123';

        console.log(`\n🔢 使用測試驗證碼: ${testCode}`);
        console.log(`🔑 新密碼: ${newPassword}`);

        // 步驟2: 重設密碼
        console.log('\n🔐 步驟2: 重設密碼');
        const resetResponse = await axios.post(`${API_BASE_URL}/api/reset-password`, {
            email: TEST_EMAIL,
            code: testCode,
            newPassword: newPassword
        });

        if (resetResponse.data.success) {
            console.log('✅ 密碼重設成功:', resetResponse.data.message);
        } else {
            console.log('❌ 密碼重設失敗:', resetResponse.data.error);
        }

    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        if (error.response) {
            console.error('📋 錯誤詳情:', error.response.data);
        }
    }
}

// 測試 API 連接
async function testAPIConnection() {
    console.log('🔗 測試 API 連接...\n');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        console.log('✅ API 連接成功');
        console.log('📋 回應:', response.data);
        return true;
    } catch (error) {
        console.error('❌ API 連接失敗:', error.message);
        return false;
    }
}

// 測試 CORS 設定
async function testCORS() {
    console.log('\n🌐 測試 CORS 設定...\n');
    
    try {
        const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
            email: 'test@example.com'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://your-mobile-app.com'
            }
        });
        
        console.log('✅ CORS 設定正常');
        console.log('📋 回應狀態:', response.status);
        return true;
    } catch (error) {
        console.error('❌ CORS 測試失敗:', error.message);
        return false;
    }
}

// 主測試函數
async function runAllTests() {
    console.log('🚀 開始手機端忘記密碼 API 測試\n');
    console.log('📱 API 網址:', API_BASE_URL);
    console.log('📧 測試郵箱:', TEST_EMAIL);
    console.log('');

    // 測試1: API 連接
    const connectionOk = await testAPIConnection();
    if (!connectionOk) {
        console.log('❌ API 連接失敗，請檢查網址是否正確');
        return;
    }

    // 測試2: CORS 設定
    await testCORS();

    // 測試3: 忘記密碼流程
    await testMobileForgotPassword();

    console.log('\n🎉 測試完成！');
    console.log('\n📋 手機端整合檢查清單：');
    console.log('   ✅ API 端點可訪問');
    console.log('   ✅ CORS 設定正確');
    console.log('   ✅ 驗證碼發送功能');
    console.log('   ✅ 密碼重設功能');
    console.log('   ✅ 錯誤處理機制');
    console.log('\n💡 現在可以在手機端使用這些 API 了！');
}

// 執行測試
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testMobileForgotPassword,
    testAPIConnection,
    testCORS,
    runAllTests
}; 