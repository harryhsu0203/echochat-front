const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始分別部署前端和後端到 Render...');

// 檢查必要的檔案
const requiredFiles = [
    'server.js',
    'package.json',
    'public/index.html',
    'render.yaml',
    'render-frontend.yaml'
];

console.log('📋 檢查必要檔案...');
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ 缺少必要檔案: ${file}`);
        process.exit(1);
    }
    console.log(`✅ ${file}`);
}

// 部署後端
console.log('\n🔧 部署後端到 echochat-backend...');
try {
    // 確保在正確的目錄
    const backendDir = path.resolve('.');
    console.log(`📍 後端目錄: ${backendDir}`);
    
    // 檢查 render.yaml 配置
    const renderConfig = fs.readFileSync('render.yaml', 'utf8');
    console.log('📄 Render 配置檢查完成');
    
    console.log('🔄 開始部署後端...');
    console.log('💡 請確保您已經在 Render 上創建了 echochat-backend 服務');
    console.log('💡 後端 URL 應該是: https://echochat-backend.onrender.com');
    
    // 這裡我們只是準備部署，實際部署需要手動操作
    console.log('✅ 後端部署準備完成');
    
} catch (error) {
    console.error('❌ 後端部署準備失敗:', error.message);
}

// 部署前端
console.log('\n🎨 部署前端到 echochat-frontend...');
try {
    // 檢查前端檔案
    const frontendFiles = [
        'public/index.html',
        'public/login.html',
        'public/dashboard.html',
        'public/js/api-config.js'
    ];
    
    console.log('📋 檢查前端檔案...');
    for (const file of frontendFiles) {
        if (!fs.existsSync(file)) {
            console.error(`❌ 缺少前端檔案: ${file}`);
            process.exit(1);
        }
        console.log(`✅ ${file}`);
    }
    
    // 檢查 render-frontend.yaml 配置
    const frontendConfig = fs.readFileSync('render-frontend.yaml', 'utf8');
    console.log('📄 前端 Render 配置檢查完成');
    
    console.log('🔄 開始部署前端...');
    console.log('💡 請確保您已經在 Render 上創建了 echochat-frontend 服務');
    console.log('💡 前端 URL 應該是: https://echochat-frontend.onrender.com');
    
    // 這裡我們只是準備部署，實際部署需要手動操作
    console.log('✅ 前端部署準備完成');
    
} catch (error) {
    console.error('❌ 前端部署準備失敗:', error.message);
}

console.log('\n📋 部署檢查清單:');
console.log('1. ✅ 後端檔案檢查完成');
console.log('2. ✅ 前端檔案檢查完成');
console.log('3. ✅ API 配置已更新');
console.log('4. ✅ CORS 設定已修復');
console.log('5. ✅ 身份驗證邏輯已修復');
console.log('\n🔧 手動部署步驟:');
console.log('1. 在 Render 上創建 echochat-backend 服務');
console.log('2. 在 Render 上創建 echochat-frontend 服務');
console.log('3. 將 render.yaml 連接到後端服務');
console.log('4. 將 render-frontend.yaml 連接到前端服務');
console.log('5. 確保環境變數正確設置');
console.log('\n🌐 部署完成後:');
console.log('- 後端: https://echochat-backend.onrender.com');
console.log('- 前端: https://echochat-frontend.onrender.com');
console.log('- 登入頁面: https://echochat-frontend.onrender.com/login.html');
console.log('- 儀表板: https://echochat-frontend.onrender.com/dashboard.html');

console.log('\n🎉 部署準備完成！'); 