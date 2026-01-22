const axios = require('axios');

async function testLogin() {
    console.log('🧪 測試登入功能...\n');
    
    const testCases = [
        {
            username: 'admin',
            password: 'admin123',
            description: '管理員帳號'
        },
        {
            username: 'sunnyharry1',
            password: 'sunnyharry1',
            description: '系統管理員帳號'
        },
        {
            username: 'user',
            password: 'user123',
            description: '一般用戶帳號'
        }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`📝 測試 ${testCase.description}: ${testCase.username}`);
            
            const response = await axios.post('https://echochat-api.onrender.com/api/login', {
                username: testCase.username,
                password: testCase.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                console.log(`✅ ${testCase.description} 登入成功`);
                console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
                console.log(`   用戶: ${response.data.user.name} (${response.data.user.role})`);
            } else {
                console.log(`❌ ${testCase.description} 登入失敗: ${response.data.error}`);
            }
        } catch (error) {
            console.log(`❌ ${testCase.description} 登入錯誤: ${error.response?.data?.error || error.message}`);
        }
        console.log('---');
    }
    
    console.log('\n🎯 測試結果總結:');
    console.log('✅ 後端 API: https://echochat-api.onrender.com');
    console.log('✅ 前端網站: https://ai-chatbot-umqm.onrender.com');
    console.log('📝 請在前端網站測試登入功能');
}

testLogin(); 