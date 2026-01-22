// EchoChat 認證系統整合範例
// 將此檔案包含在您的應用程式中

class EchoChatAuth {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('token');
    }

    // 登入
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: '登入失敗' };
        }
    }

    // 註冊
    async register(username, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: '註冊失敗' };
        }
    }

    // 發送驗證碼
    async sendVerificationCode(email) {
        try {
            const response = await fetch(`${this.baseUrl}/api/send-verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: '發送驗證碼失敗' };
        }
    }

    // 驗證碼驗證
    async verifyCode(email, code) {
        try {
            const response = await fetch(`${this.baseUrl}/api/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                localStorage.setItem('token', data.token);
                return { success: true, token: data.token };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: '驗證失敗' };
        }
    }

    // 檢查認證狀態
    async checkAuth() {
        if (!this.token) {
            return { authenticated: false };
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return { authenticated: true, user: data.user };
            } else {
                this.logout();
                return { authenticated: false };
            }
        } catch (error) {
            this.logout();
            return { authenticated: false };
        }
    }

    // 更新用戶資料
    async updateProfile(name, email) {
        if (!this.token) {
            return { success: false, error: '未登入' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ name, email })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: '更新失敗' };
        }
    }

    // 修改密碼
    async changePassword(oldPassword, newPassword) {
        if (!this.token) {
            return { success: false, error: '未登入' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: '修改密碼失敗' };
        }
    }

    // 刪除帳號
    async deleteAccount(password) {
        if (!this.token) {
            return { success: false, error: '未登入' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/delete-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.logout();
            }
            
            return data;
        } catch (error) {
            return { success: false, error: '刪除帳號失敗' };
        }
    }

    // 登出
    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // 獲取當前用戶
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // 檢查是否有 token
    isLoggedIn() {
        return !!this.token;
    }
}

// 使用範例
// const auth = new EchoChatAuth('https://your-render-app.onrender.com');

// 登入範例
// async function loginExample() {
//     const result = await auth.login('username', 'password');
//     if (result.success) {
//         console.log('登入成功:', result.user);
//         // 跳轉到儀表板
//         window.location.href = '/dashboard.html';
//     } else {
//         console.error('登入失敗:', result.error);
//     }
// }

// 註冊範例
// async function registerExample() {
//     // 1. 註冊
//     const registerResult = await auth.register('username', 'email@example.com', 'password');
//     
//     if (registerResult.success) {
//         // 2. 發送驗證碼
//         const codeResult = await auth.sendVerificationCode('email@example.com');
//         
//         if (codeResult.success) {
//             // 3. 用戶輸入驗證碼後驗證
//             const verifyResult = await auth.verifyCode('email@example.com', '123456');
//             
//             if (verifyResult.success) {
//                 console.log('註冊成功');
//                 window.location.href = '/dashboard.html';
//             }
//         }
//     }
// }

// 檢查認證狀態範例
// async function checkAuthExample() {
//     const authStatus = await auth.checkAuth();
//     
//     if (authStatus.authenticated) {
//         console.log('已登入:', authStatus.user);
//         // 顯示受保護的內容
//     } else {
//         console.log('未登入');
//         // 跳轉到登入頁面
//         window.location.href = '/login.html';
//     }
// } 