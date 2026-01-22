// 共用認證工具：負責儲存 / 驗證 / 清除登入狀態
(function (window) {
    const TOKEN_KEY = 'token';
    const USER_KEY = 'auth.user';
    const LOGIN_PATH = 'login.html';

    function getApiBase() {
        if (window.API_BASE_URL) return window.API_BASE_URL;
        if (window.apiClient && window.apiClient.baseURL) return window.apiClient.baseURL;
        return '/api';
    }

    function setSession(token, user) {
        if (!token) return;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem('authToken', token);
        if (window.apiClient && typeof window.apiClient.setToken === 'function') {
            window.apiClient.setToken(token);
        }
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            localStorage.setItem('staffName', user.name || user.username || '');
            localStorage.setItem('staffRole', user.role || '');
            localStorage.setItem('staffUsername', user.username || '');
            localStorage.setItem('staffId', user.id ? String(user.id) : '');
        }
    }

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('authToken');
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('staffName');
        localStorage.removeItem('staffRole');
        localStorage.removeItem('staffUsername');
        localStorage.removeItem('staffId');
        localStorage.removeItem('isLoggedIn');
        if (window.apiClient && typeof window.apiClient.clearToken === 'function') {
            window.apiClient.clearToken();
        }
    }

    async function fetchCurrentUser() {
        const token = getToken();
        if (!token) {
            throw new Error('NO_TOKEN');
        }
        const resp = await fetch(`${getApiBase()}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            throw new Error('UNAUTHORIZED');
        }
        const data = await resp.json();
        if (!data.success || !data.user) {
            throw new Error(data.error || 'UNAUTHORIZED');
        }
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
    }

    async function ensureAuthenticated(options = {}) {
        try {
            const user = await fetchCurrentUser();
            window.currentUser = user;
            return user;
        } catch (error) {
            clearSession();
            if (options.redirect !== false) {
                const target = options.loginUrl || LOGIN_PATH;
                window.location.replace(target);
            }
            throw error;
        }
    }

    function getCurrentUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    window.Auth = {
        setSession,
        getToken,
        clearSession,
        ensureAuthenticated,
        getCurrentUser,
        fetchCurrentUser
    };
})(window);

