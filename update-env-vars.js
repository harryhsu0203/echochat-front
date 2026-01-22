const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 開始更新環境變數...');

// 生成安全的 JWT_SECRET
const generateJWTSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

// 讀取現有的 .env 檔案
const envFile = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8');
    console.log('✅ 找到現有的 .env 檔案');
} else {
    console.log('⚠️ 未找到 .env 檔案，將創建新的');
    envContent = `# EchoChat 環境變數設定
# 請將以下值替換為您的實際設定

# OpenAI API 金鑰 (必需)
# 請前往 https://platform.openai.com/api-keys 獲取您的 API 金鑰
OPENAI_API_KEY=your_openai_api_key_here

# JWT 密鑰 (必需)
JWT_SECRET=your_super_secret_jwt_key_here_2024

# 伺服器端口 (可選，預設為 3000)
PORT=3000

# LINE Bot 設定 (可選)
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# 資料目錄 (可選)
DATA_DIR=./data

# 環境模式 (可選)
NODE_ENV=development`;
}

// 更新 JWT_SECRET
const newJWTSecret = generateJWTSecret();
const jwtSecretRegex = /JWT_SECRET=.*/;
if (jwtSecretRegex.test(envContent)) {
    envContent = envContent.replace(jwtSecretRegex, `JWT_SECRET=${newJWTSecret}`);
    console.log('✅ 已更新 JWT_SECRET');
} else {
    envContent += `\n# JWT 密鑰 (必需)\nJWT_SECRET=${newJWTSecret}`;
    console.log('✅ 已添加 JWT_SECRET');
}

// 檢查 OpenAI API 金鑰
const openaiKeyRegex = /OPENAI_API_KEY=.*/;
if (openaiKeyRegex.test(envContent)) {
    const currentKey = envContent.match(/OPENAI_API_KEY=(.*)/)[1];
    if (currentKey === 'your_openai_api_key_here') {
        console.log('⚠️ OpenAI API 金鑰仍為預設值，請手動更新');
        console.log('   請前往 https://platform.openai.com/api-keys 獲取您的 API 金鑰');
        console.log('   然後將 .env 檔案中的 OPENAI_API_KEY 更新為實際的金鑰');
    } else {
        console.log('✅ OpenAI API 金鑰已設置');
    }
} else {
    envContent += `\n# OpenAI API 金鑰 (必需)\nOPENAI_API_KEY=your_openai_api_key_here`;
    console.log('⚠️ 已添加 OpenAI API 金鑰欄位，請手動更新');
}

// 寫入更新後的 .env 檔案
fs.writeFileSync(envFile, envContent);
console.log('✅ 已更新 .env 檔案');

// 顯示更新摘要
console.log('\n📋 更新摘要:');
console.log(`- JWT_SECRET: ${newJWTSecret.substring(0, 10)}...`);
console.log('- OpenAI API 金鑰: 需要手動更新');
console.log('- 其他設定: 保持不變');

console.log('\n💡 下一步:');
console.log('1. 請前往 https://platform.openai.com/api-keys 獲取您的 API 金鑰');
console.log('2. 將 .env 檔案中的 OPENAI_API_KEY 更新為實際的金鑰');
console.log('3. 重新啟動伺服器');
console.log('4. 清除瀏覽器快取並重新登入');

console.log('\n🎯 環境變數更新完成！'); 