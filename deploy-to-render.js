const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 開始部署到 Render...');

// 檢查當前分支
try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 當前分支: ${currentBranch}`);
    
    if (currentBranch !== 'main') {
        console.log('⚠️ 警告：建議在 main 分支上部署');
    }
} catch (error) {
    console.error('❌ 無法獲取當前分支:', error.message);
}

// 檢查遠端倉庫
try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`🌐 遠端倉庫: ${remoteUrl}`);
} catch (error) {
    console.error('❌ 無法獲取遠端倉庫:', error.message);
}

// 檢查必要檔案
const requiredFiles = [
    'server.js',
    'package.json',
    'render.yaml',
    'render-frontend.yaml',
    'public/index.html',
    'public/login.html',
    'public/dashboard.html',
    'public/js/api-config.js'
];

console.log('\n📋 檢查必要檔案...');
let allFilesExist = true;

for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ 缺少檔案: ${file}`);
        allFilesExist = false;
    }
}

if (!allFilesExist) {
    console.error('\n❌ 缺少必要檔案，無法部署');
    process.exit(1);
}

console.log('\n✅ 所有必要檔案檢查完成');

// 檢查最近的提交
try {
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    console.log(`📝 最近提交: ${lastCommit}`);
} catch (error) {
    console.error('❌ 無法獲取最近提交:', error.message);
}

console.log('\n🔧 部署配置檢查...');

// 檢查 render.yaml
try {
    const renderConfig = fs.readFileSync('render.yaml', 'utf8');
    if (renderConfig.includes('echochat-backend')) {
        console.log('✅ render.yaml 配置正確');
    } else {
        console.log('⚠️ render.yaml 可能需要更新');
    }
} catch (error) {
    console.error('❌ 無法讀取 render.yaml:', error.message);
}

// 檢查 render-frontend.yaml
try {
    const frontendConfig = fs.readFileSync('render-frontend.yaml', 'utf8');
    if (frontendConfig.includes('echochat-frontend')) {
        console.log('✅ render-frontend.yaml 配置正確');
    } else {
        console.log('⚠️ render-frontend.yaml 可能需要更新');
    }
} catch (error) {
    console.error('❌ 無法讀取 render-frontend.yaml:', error.message);
}

console.log('\n📋 部署步驟指南:');
console.log('1. 登入 Render 控制台: https://dashboard.render.com');
console.log('2. 創建後端服務 (echochat-backend):');
console.log('   - 類型: Web Service');
console.log('   - 環境: Node');
console.log('   - 構建命令: npm install');
console.log('   - 啟動命令: npm start');
console.log('   - 使用 render.yaml 配置');
console.log('');
console.log('3. 創建前端服務 (echochat-frontend):');
console.log('   - 類型: Static Site');
console.log('   - 構建命令: echo "Frontend build completed"');
console.log('   - 發布目錄: public');
console.log('   - 使用 render-frontend.yaml 配置');
console.log('');
console.log('4. 設置環境變數:');
console.log('   NODE_ENV=production');
console.log('   JWT_SECRET=your-secret-key');
console.log('   PORT=10000');
console.log('   DATA_DIR=/opt/render/project/src/data');
console.log('');
console.log('🌐 部署完成後的 URL:');
console.log('- 後端: https://echochat-backend.onrender.com');
console.log('- 前端: https://echochat-frontend.onrender.com');
console.log('- 登入頁面: https://echochat-frontend.onrender.com/login.html');
console.log('- 儀表板: https://echochat-frontend.onrender.com/dashboard.html');
console.log('');
console.log('🧪 部署完成後測試:');
console.log('node test-auth-fix.js');
console.log('');
console.log('🎉 代碼已推送到 GitHub，可以開始在 Render 上部署了！');

// 檢查是否有未提交的更改
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
        console.log('\n⚠️ 發現未提交的更改:');
        console.log(status);
        console.log('建議先提交更改再部署');
    } else {
        console.log('\n✅ 所有更改已提交');
    }
} catch (error) {
    console.error('❌ 無法檢查 git 狀態:', error.message);
} 