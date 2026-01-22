const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 強制推送代碼到 Render...');

// 檢查並修復 .gitignore
const gitignorePath = '.gitignore';
let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

if (gitignoreContent.includes('echochat-api/')) {
    console.log('📝 修復 .gitignore...');
    gitignoreContent = gitignoreContent.replace('echochat-api/', '# echochat-api/');
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore 已修復');
}

// 強制添加 echochat-api 目錄
console.log('📦 強制添加 echochat-api 目錄...');
try {
    execSync('git add -f echochat-api/', { stdio: 'inherit' });
    console.log('✅ echochat-api 目錄已添加');
} catch (error) {
    console.log('⚠️ 添加目錄時發生錯誤，繼續...');
}

// 提交更改
console.log('💾 提交更改...');
try {
    execSync('git commit -m "強制添加 echochat-api 目錄並修復CSP設定"', { stdio: 'inherit' });
    console.log('✅ 更改已提交');
} catch (error) {
    console.log('⚠️ 提交時發生錯誤，繼續...');
}

// 推送到 GitHub
console.log('📤 推送到 GitHub...');
try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ 代碼已推送到 GitHub');
} catch (error) {
    console.log('❌ 推送失敗:', error.message);
}

console.log('\n🎯 下一步：');
console.log('1. 前往 https://render.com');
console.log('2. 找到您的 echochat-api 專案');
console.log('3. 點擊 "Manual Deploy"');
console.log('4. 選擇 "Deploy latest commit"');
console.log('5. 等待部署完成');
console.log('6. 重新測試登入功能');

console.log('\n📋 或者手動更新：');
console.log('在 Render 控制台中編輯 server.js，將第127行改為：');
console.log('contentSecurityPolicy: false'); 