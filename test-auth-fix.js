const axios = require('axios');

async function testAuthFix() {
    console.log('🧪 測試身份驗證修復...\n');
    
    // 測試登入
    console.log('1. 測試登入功能...');
    try {
        const loginResponse = await axios.post('https://echochat-api.onrender.com/api/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ 登入成功');
            const token = loginResponse.data.token;
            console.log(`   Token: ${token.substring(0, 20)}...`);
            
            // 測試 token 驗證
            console.log('\n2. 測試 token 驗證...');
            try {
                const meResponse = await axios.get('https://echochat-api.onrender.com/api/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (meResponse.data.success) {
                    console.log('✅ Token 驗證成功');
                    console.log(`   用戶: ${meResponse.data.user.name} (${meResponse.data.user.role})`);
                } else {
                    console.log('❌ Token 驗證失敗:', meResponse.data.error);
                }
            } catch (meError) {
                console.log('❌ Token 驗證錯誤:', meError.response?.data?.error || meError.message);
            }
            
        } else {
            console.log('❌ 登入失敗:', loginResponse.data.error);
        }
    } catch (loginError) {
        console.log('❌ 登入錯誤:', loginError.response?.data?.error || loginError.message);
    }
    
    console.log('\n🎯 身份驗證修復測試完成');
    console.log('📝 請在前端網站測試登入功能');
    console.log('🌐 前端網站: https://ai-chatbot-umqm.onrender.com');
    console.log('🔗 登入頁面: https://ai-chatbot-umqm.onrender.com/login.html');
}

testAuthFix(); 