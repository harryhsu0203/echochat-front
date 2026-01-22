const fs = require('fs');
const path = require('path');

console.log('🔄 開始統整本地版本和 Render 版本...');
console.log('');

// 需要統整的文件列表
const filesToMerge = [
    'server.js',
    'package.json',
    'render.yaml',
    'Procfile',
    'public/index.html',
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

console.log('📋 統整策略：');
console.log('1. 保留 Render 版本的新功能 (忘記密碼、LINE API 設定、國際化)');
console.log('2. 保留本地版本的導航欄佈局修正');
console.log('3. 保留本地版本的語言選擇器優化');
console.log('4. 合併兩個版本的配置設定');
console.log('');

console.log('🎯 統整步驟：');
console.log('1. 解決 Git 衝突');
console.log('2. 保留本地導航欄修改');
console.log('3. 整合 Render 新功能');
console.log('4. 測試統整後的版本');
console.log('');

console.log('⚠️  注意事項：');
console.log('- 這個過程會保留兩個版本的最佳功能');
console.log('- 確保導航欄佈局正確');
console.log('- 確保所有新功能正常運作');
console.log('');

console.log('✅ 準備開始統整...');
console.log('');

// 檢查文件是否存在
filesToMerge.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} (文件不存在)`);
    }
});

console.log('');
console.log('🚀 請按照以下步驟進行統整：');
console.log('');
console.log('1. 解決 Git 衝突：');
console.log('   git add .');
console.log('   git commit -m "Merge local and render versions"');
console.log('');
console.log('2. 恢復本地修改：');
console.log('   git stash pop');
console.log('');
console.log('3. 重新應用導航欄修改');
console.log('');
console.log('4. 測試統整後的版本'); 