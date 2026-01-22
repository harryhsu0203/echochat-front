// 調試身份驗證問題
console.log('🔍 調試身份驗證...');
console.log('當前 URL:', window.location.href);
console.log('Token 存在:', !!localStorage.getItem('token'));
console.log('API URL:', window.API_BASE_URL);

// 測試 API 連接
fetch(window.API_BASE_URL + '/health')
    .then(response => {
        console.log('API 健康檢查:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('API 回應:', data);
    })
    .catch(error => {
        console.error('API 錯誤:', error);
    });

// 測試身份驗證
const token = localStorage.getItem('token');
if (token) {
    fetch(window.API_BASE_URL + '/me', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('身份驗證檢查:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('身份驗證回應:', data);
    })
    .catch(error => {
        console.error('身份驗證錯誤:', error);
    });
}