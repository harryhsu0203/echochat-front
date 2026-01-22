// API 配置檔案
const API_CONFIG = {
    // 開發環境
    development: 'http://localhost:3000/api',
    // 生產環境 - 指向後端 API
    production: 'https://echochat-api.onrender.com/api',
    // 測試環境
    staging: 'https://echochat-api-staging.onrender.com/api'
};

// 根據當前環境決定使用哪個 API URL
function getApiBaseUrl() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    console.log('🔍 當前環境偵測:', { hostname, port });
    
    // 如果是本地開發
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('📍 使用開發環境 API:', API_CONFIG.development);
        return API_CONFIG.development;
    } 
    // 如果是測試環境
    else if (hostname.includes('staging')) {
        console.log('📍 使用測試環境 API:', API_CONFIG.staging);
        return API_CONFIG.staging;
    } 
    // 生產環境 - 使用當前域名
    else {
        const productionUrl = API_CONFIG.production;
        console.log('📍 使用生產環境 API:', productionUrl);
        return productionUrl;
    }
}

// 全域 API 基礎 URL
const API_BASE_URL = getApiBaseUrl();

// API 呼叫輔助函數
class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
        // 不在生產環境輸出敏感設定
    }

    // 設定認證 token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token); // 同時設置兩個key以確保兼容性
        console.log('🔑 Token 已設定');
    }

    // 清除 token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        console.log('🗑️ Token 已清除');
    }

    // 測試API連接
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                return true;
            }
        } catch (_) {}
        return false;
    }

    // 若本機端點不可用，自動切換到生產 API
    async ensureConnectivity() {
        const ok = await this.testConnection();
        if (ok) return true;
        if (this.baseURL.includes('localhost')) {
            this.baseURL = API_CONFIG.production;
            window.API_BASE_URL = this.baseURL;
            try {
                const retry = await this.testConnection();
                return retry;
            } catch (_) {
                return false;
            }
        }
        return false;
    }

    // 通用 API 呼叫方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // 如果有 token，加入認證標頭
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'omit'
        };

        // 不輸出請求細節，避免洩露端點

        try {
            const response = await fetch(url, config);
            // 不輸出回應細節
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    // GET 請求
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST 請求
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT 請求
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE 請求
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// 建立全域 API 客戶端實例
const apiClient = new ApiClient();

// 頁面載入時測試API連接
document.addEventListener('DOMContentLoaded', async () => {
    await apiClient.ensureConnectivity();
});

// 匯出供其他檔案使用
window.apiClient = apiClient;
window.API_BASE_URL = API_BASE_URL;

// 15 分鐘自動登出機制
(function initSessionTimeoutWatcher() {
    const timeoutMinutesRaw = window.SESSION_TIMEOUT_MINUTES || '15';
    const timeoutMinutes = Math.max(parseInt(timeoutMinutesRaw, 10) || 15, 1);
    const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
    const STORAGE_KEY = 'lastActiveAt';
    const CHECK_INTERVAL_MS = 60 * 1000;
    let lastSaved = Date.now();
    let timerId = null;
    let countdownInterval = null;
    let indicatorEl = null;
    const INTERNAL_PAGE_KEYWORDS = [
        'dashboard',
        'line-token',
        'line-bot',
        'account',
        'knowledge',
        'retention',
        'booking',
        'subscription',
        'chat',
        'manager',
        'analytics',
        'settings',
        'admin'
    ];

    function hasToken() {
        try {
            return !!localStorage.getItem('token');
        } catch {
            return false;
        }
    }

    function updateActivity(force = false) {
        const now = Date.now();
        if (!force && now - lastSaved < 5000) return;
        lastSaved = now;
        try {
            localStorage.setItem(STORAGE_KEY, String(now));
        } catch (error) {
            console.warn('無法寫入最後活動時間:', error);
        }
        refreshCountdownDisplay();
    }

    function enforceLogout(reason = 'timeout') {
        if (window.__sessionLogoutTriggered) return;
        window.__sessionLogoutTriggered = true;
        try {
            sessionStorage.setItem('logoutReason', reason);
        } catch (error) {
            console.warn('無法寫入 logout 原因:', error);
        }
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('無法清除 localStorage:', error);
        }
        hideIndicator();
        window.location.href = 'login.html';
    }

    function checkTimeout() {
        if (!hasToken()) {
            clearTimeout(timerId);
            return;
        }

        let lastActivity = lastSaved;
        try {
            const stored = parseInt(localStorage.getItem(STORAGE_KEY), 10);
            if (!isNaN(stored)) {
                lastActivity = stored;
            }
        } catch (error) {
            console.warn('無法讀取最後活動時間:', error);
        }

        if (Date.now() - lastActivity >= TIMEOUT_MS) {
            enforceLogout('timeout');
            return;
        }

        timerId = setTimeout(checkTimeout, CHECK_INTERVAL_MS);
    }

    function ensureIndicator() {
        if (indicatorEl) return indicatorEl;
        indicatorEl = document.createElement('div');
        indicatorEl.id = 'session-timeout-indicator';
        indicatorEl.style.position = 'fixed';
        indicatorEl.style.bottom = '24px';
        indicatorEl.style.right = '24px';
        indicatorEl.style.zIndex = '9999';
        indicatorEl.style.background = 'rgba(20, 20, 30, 0.9)';
        indicatorEl.style.color = '#fff';
        indicatorEl.style.padding = '10px 18px';
        indicatorEl.style.borderRadius = '999px';
        indicatorEl.style.fontSize = '0.9rem';
        indicatorEl.style.display = 'none';
        indicatorEl.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        indicatorEl.style.backdropFilter = 'blur(6px)';
        indicatorEl.style.alignItems = 'center';
        indicatorEl.style.gap = '8px';
        indicatorEl.style.lineHeight = '1.2';
        indicatorEl.innerHTML = `
            <span>將於</span>
            <span id="sessionTimeoutCountdown" style="font-family: 'JetBrains Mono', 'SFMono-Regular', monospace; font-weight:600;">--:--</span>
            <span>後登出</span>
        `;
        document.body.appendChild(indicatorEl);
        return indicatorEl;
    }

    function updateIndicator(timeLeftMs) {
        const el = ensureIndicator();
        const countdown = el.querySelector('#sessionTimeoutCountdown');
        const seconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
        const minutes = Math.floor(seconds / 60);
        const remainSeconds = seconds % 60;
        if (countdown) {
            countdown.textContent = `${minutes.toString().padStart(2, '0')}:${remainSeconds.toString().padStart(2, '0')}`;
        }
        el.style.display = hasToken() ? 'flex' : 'none';
    }

    function hideIndicator() {
        if (indicatorEl) {
            indicatorEl.style.display = 'none';
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    function refreshCountdownDisplay() {
        if (!hasToken()) {
            hideIndicator();
            return;
        }
        const timeLeft = Math.max(0, TIMEOUT_MS - (Date.now() - lastSaved));
        updateIndicator(timeLeft);
    }

    function startWatcher() {
        if (window.__sessionTimeoutWatcherInitialized) return;
        if (!hasToken()) return;
        // 登入頁面不啟動自動登出機制
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            return;
        }
        const currentPath = (window.location.pathname || '').toLowerCase();
        const isInternalPage = INTERNAL_PAGE_KEYWORDS.some(keyword => currentPath.includes(keyword));
        if (!isInternalPage) {
            console.log('ℹ️ 公開頁面不顯示會話倒數提示');
            hideIndicator();
            return;
        }
        window.__sessionTimeoutWatcherInitialized = true;

        let initial = Date.now();
        try {
            const stored = parseInt(localStorage.getItem(STORAGE_KEY), 10);
            // 如果存儲的時間戳超過 15 分鐘，重置為當前時間（可能是舊的登入記錄）
            if (!isNaN(stored) && (Date.now() - stored) < TIMEOUT_MS) {
                initial = stored;
            } else {
                // 重置為當前時間，避免立即登出
                initial = Date.now();
                localStorage.setItem(STORAGE_KEY, String(initial));
            }
        } catch (error) {
            console.warn('初始化活動時間失敗:', error);
            initial = Date.now();
            try {
                localStorage.setItem(STORAGE_KEY, String(initial));
            } catch (e) {
                console.warn('無法設置活動時間:', e);
            }
        }
        lastSaved = initial;

        const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart', 'touchmove'];
        activityEvents.forEach(evt => {
            document.addEventListener(evt, () => updateActivity(false), { passive: true });
        });
        window.addEventListener('focus', () => updateActivity(true));
        window.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                updateActivity(true);
            }
        });

        timerId = setTimeout(checkTimeout, CHECK_INTERVAL_MS);
        refreshCountdownDisplay();
        if (!countdownInterval) {
            countdownInterval = setInterval(refreshCountdownDisplay, 1000);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        startWatcher();
    } else {
        document.addEventListener('DOMContentLoaded', startWatcher, { once: true });
    }
})();