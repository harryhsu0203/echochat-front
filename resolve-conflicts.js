const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔄 開始解決剩餘的 Git 衝突...');
console.log('');

// 需要解決衝突的文件
const conflictFiles = [
    'server.js',
    'public/navbar.css',
    'public/login.html',
    'public/register.html',
    'public/dashboard.html',
    'public/forgot-password.html',
    'public/platforms.html',
    'public/admin.js',
    'public/js/i18n.js',
    'data/database.json',
    '.gitignore'
];

console.log('📋 解決策略：');
console.log('1. 保留 Render 版本的新功能');
console.log('2. 保留本地版本的導航欄修改');
console.log('3. 保留本地版本的語言選擇器優化');
console.log('4. 合併兩個版本的配置設定');
console.log('');

console.log('⚠️  注意：server.js 有大量衝突，建議手動解決');
console.log('');

console.log('🚀 建議步驟：');
console.log('');
console.log('1. 手動解決 server.js 衝突：');
console.log('   - 保留 CORS 設定');
console.log('   - 保留忘記密碼功能');
console.log('   - 保留所有現有功能');
console.log('');
console.log('2. 解決其他文件衝突：');
console.log('   - 保留本地導航欄修改');
console.log('   - 保留 Render 新功能');
console.log('');
console.log('3. 提交解決的衝突：');
console.log('   git add .');
console.log('   git commit -m "Resolve merge conflicts"');
console.log('');
console.log('4. 恢復本地修改：');
console.log('   git stash pop');
console.log('');
console.log('5. 重新應用導航欄修改');
console.log('');

// 檢查衝突文件
conflictFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} (文件不存在)`);
    }
});

console.log('');
console.log('💡 提示：建議先備份當前工作目錄');
console.log('   cp -r . ../EchoChat_backup_$(date +%Y%m%d_%H%M%S)'); 