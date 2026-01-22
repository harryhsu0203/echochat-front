const fs = require('fs');
const path = require('path');

console.log('🔧 修復 Render 環境 API 配置...\n');

// 修復 API 配置文件
function fixApiConfig() {
    const apiConfigPath = path.join(__dirname, 'public', 'js', 'api-config.js');
    
    if (!fs.existsSync(apiConfigPath)) {
        console.error('❌ API 配置文件不存在:', apiConfigPath);
        return false;
    }
    
    let content = fs.readFileSync(apiConfigPath, 'utf8');
    
    // 更新 API 配置
    const newApiConfig = `// API 配置檔案
const API_CONFIG = {
    // 開發環境
    development: 'http://localhost:3000/api',
    // 生產環境 - 使用當前域名
    production: window.location.origin + '/api',
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
        console.log('🚀 API 客戶端初始化完成，基礎 URL:', this.baseURL);
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
            console.log('🔍 測試 API 連接...');
            console.log('📍 測試 URL:', \`\${this.baseURL}/health\`);
            
            const response = await fetch(\`\${this.baseURL}/health\`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API 連接正常:', data);
                return true;
            } else {
                console.log('❌ API 連接失敗:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ API 連接錯誤:', error);
            console.log('💡 這可能是CSP限制導致的，請檢查Render部署狀態');
            return false;
        }
    }

    // 通用 API 呼叫方法
    async request(endpoint, options = {}) {
        const url = \`\${this.baseURL}\${endpoint}\`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // 如果有 token，加入認證標頭
        if (this.token) {
            headers.Authorization = \`Bearer \${this.token}\`;
        }

        const config = {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'omit'
        };

        console.log('📡 API 請求:', { url, method: options.method || 'GET' });

        try {
            const response = await fetch(url, config);
            console.log('📥 API 回應:', { status: response.status, statusText: response.statusText });
            
            return response;
        } catch (error) {
            console.error('❌ API 呼叫錯誤:', error);
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
    await apiClient.testConnection();
});

// 匯出供其他檔案使用
window.apiClient = apiClient;
window.API_BASE_URL = API_BASE_URL;`;
    
    try {
        fs.writeFileSync(apiConfigPath, newApiConfig);
        console.log('✅ API 配置文件已更新');
        console.log('📍 主要變更:');
        console.log('   - 生產環境 API URL 改為使用當前域名');
        console.log('   - 移除了硬編碼的 Render URL');
        console.log('   - 改進了環境偵測邏輯');
        return true;
    } catch (error) {
        console.error('❌ 更新 API 配置文件失敗:', error.message);
        return false;
    }
}

// 創建部署腳本
function createDeployScript() {
    const deployScript = `#!/bin/bash

echo "🚀 部署到 Render..."

# 確保在正確的目錄
cd /opt/render/project/src

# 安裝依賴
npm install

# 創建必要的目錄
mkdir -p data
mkdir -p uploads

# 設置權限
chmod 755 data
chmod 755 uploads

# 啟動應用
npm start

echo "✅ 部署完成！"`;
    
    const scriptPath = path.join(__dirname, 'deploy-render.sh');
    try {
        fs.writeFileSync(scriptPath, deployScript);
        fs.chmodSync(scriptPath, '755');
        console.log('✅ 部署腳本已創建:', scriptPath);
        return true;
    } catch (error) {
        console.error('❌ 創建部署腳本失敗:', error.message);
        return false;
    }
}

// 更新 package.json
function updatePackageJson() {
    const packagePath = path.join(__dirname, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
        console.error('❌ package.json 不存在');
        return false;
    }
    
    try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // 確保有必要的腳本
        packageData.scripts = {
            ...packageData.scripts,
            "start": "node server.js",
            "dev": "nodemon server.js",
            "deploy": "bash deploy-render.sh"
        };
        
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
        console.log('✅ package.json 已更新');
        return true;
    } catch (error) {
        console.error('❌ 更新 package.json 失敗:', error.message);
        return false;
    }
}

// 主函數
function main() {
    console.log('🔧 開始修復 Render 環境配置...\n');
    
    const results = [
        fixApiConfig(),
        createDeployScript(),
        updatePackageJson()
    ];
    
    const successCount = results.filter(Boolean).length;
    const totalCount = results.length;
    
    console.log(`\n📊 修復結果: ${successCount}/${totalCount} 項成功`);
    
    if (successCount === totalCount) {
        console.log('🎉 所有配置已修復完成！');
        console.log('\n📝 下一步:');
        console.log('1. 提交更改到 Git');
        console.log('2. 推送到 Render');
        console.log('3. 檢查 Render 部署狀態');
    } else {
        console.log('⚠️ 部分配置修復失敗，請檢查錯誤訊息');
    }
}

// 執行主函數
main(); 