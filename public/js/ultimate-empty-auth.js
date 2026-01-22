// 終極身份驗證檢查
console.log('🔍 開始終極身份驗證檢查...');

// 檢查是否有登入 token
function checkAuth() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const staffName = localStorage.getItem('staffName');
    
    console.log('🔍 終極身份驗證狀態:', {
        token: token ? '存在' : '不存在',
        isLoggedIn: isLoggedIn,
        staffName: staffName
    });
    
    // 如果沒有 token 或未登入，跳轉到登入頁面
    if (!token || !isLoggedIn || !staffName) {
        console.log('❌ 終極身份驗證失敗，跳轉到登入頁面');
        showAuthError();
        return false;
    }
    
    // 驗證 token 是否有效
    validateToken(token).then(isValid => {
        if (!isValid) {
            console.log('❌ Token 無效，跳轉到登入頁面');
            showAuthError();
            return false;
        }
        console.log('✅ 終極身份驗證成功');
        return true;
    }).catch(error => {
        console.error('❌ Token 驗證錯誤:', error);
        showAuthError();
        return false;
    });
}

// 驗證 token 是否有效
async function validateToken(token) {
    try {
        const response = await fetch('https://echochat-api.onrender.com/api/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token 驗證成功:', data);
            return true;
        } else {
            console.log('❌ Token 驗證失敗:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Token 驗證錯誤:', error);
        return false;
    }
}

// 顯示身份驗證錯誤
function showAuthError() {
    // 清除無效的登入信息
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('staffName');
    localStorage.removeItem('staffRole');
    localStorage.removeItem('staffUsername');
    localStorage.removeItem('staffId');
    
    // 顯示錯誤消息
    const errorMessage = '登入已過期，請重新登入';
    alert(errorMessage);
    
    // 跳轉到登入頁面
    window.location.href = '/login.html';
}

// 頁面載入時進行身份驗證檢查
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 頁面載入完成，開始終極身份驗證檢查');
    checkAuth();
});

// 導出函數供其他文件使用
window.checkAuth = checkAuth;
window.validateToken = validateToken;