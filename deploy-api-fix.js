const fs = require('fs');
const path = require('path');

console.log('🔧 開始修復 API 部署問題...\n');

// 1. 檢查並修復 package.json
const packageJsonPath = path.join(__dirname, 'echochat-api', 'package.json');
if (fs.existsSync(packageJsonPath)) {
    console.log('✅ 找到 package.json');
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // 確保有正確的啟動腳本
    if (!packageJson.scripts || !packageJson.scripts.start) {
        packageJson.scripts = {
            ...packageJson.scripts,
            start: 'node server.js'
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ 已修復 package.json 啟動腳本');
    }
} else {
    console.log('❌ 找不到 package.json');
}

// 2. 檢查並創建必要的目錄
const dataDir = path.join(__dirname, 'echochat-api', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ 已創建 data 目錄');
}

// 3. 檢查並創建初始資料庫檔案
const dbPath = path.join(dataDir, 'database.json');
if (!fs.existsSync(dbPath)) {
    const initialDb = {
        staff_accounts: [],
        email_verifications: [],
        password_resets: [],
        line_configs: [],
        ai_configs: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
    console.log('✅ 已創建初始資料庫檔案');
}

// 4. 檢查並創建 credentials 目錄
const credentialsDir = path.join(__dirname, 'echochat-api', 'credentials');
if (!fs.existsSync(credentialsDir)) {
    fs.mkdirSync(credentialsDir, { recursive: true });
    console.log('✅ 已創建 credentials 目錄');
}

// 5. 檢查並創建 uploads 目錄
const uploadsDir = path.join(__dirname, 'echochat-api', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ 已創建 uploads 目錄');
}

// 6. 檢查 .gitignore
const gitignorePath = path.join(__dirname, 'echochat-api', '.gitignore');
if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `node_modules/
.env
data/
uploads/
credentials/
*.log
.DS_Store`;
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ 已創建 .gitignore');
}

// 7. 檢查 env.example
const envExamplePath = path.join(__dirname, 'echochat-api', 'env.example');
if (!fs.existsSync(envExamplePath)) {
    const envExampleContent = `# EchoChat API 環境變數
NODE_ENV=production
JWT_SECRET=your-secret-key-here
PORT=10000
DATA_DIR=/opt/render/project/src/data

# LINE Bot 設定
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret

# OpenAI 設定
OPENAI_API_KEY=your-openai-api-key

# 電子郵件設定
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password

# Google Vision 設定
GOOGLE_APPLICATION_CREDENTIALS=/opt/render/project/src/credentials/google-vision-credentials.json`;
    fs.writeFileSync(envExamplePath, envExampleContent);
    console.log('✅ 已創建 env.example');
}

console.log('\n🎉 API 部署修復完成！');
console.log('\n📋 下一步：');
console.log('1. 在 Render 後端專案中設定環境變數');
console.log('2. 重新部署後端專案');
console.log('3. 測試前端登入功能'); 