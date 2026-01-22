const fs = require('fs');
const path = require('path');

// 需要部署的文件列表（只包含修改過的文件）
const filesToDeploy = [
    'public/index.html',
    'public/navbar.css',
    'public/products.html',
    'public/use-cases.html',
    'public/about-us.html',
    'public/pricing.html',
    'public/features.html',
    'public/contact-us.html',
    'public/help-center.html',
    'public/faq.html',
    'public/blog.html',
    'public/news.html',
    'public/technical-support.html',
    'public/account.html',
    'public/careers.html',
    'public/privacy-policy.html',
    'public/terms-of-service.html',
    'public/cookie-policy.html',
    'public/gdpr.html',
    'public/admin.html',
    'public/platforms.html',
    'public/demo-i18n.html',
    'public/test-i18n.html'
];

console.log('🚀 開始部署導航欄修正到 Render...');
console.log('📅 部署時間:', new Date().toLocaleString('zh-TW'));
console.log('');

// 檢查文件是否存在
console.log('📝 檢查需要部署的文件：\n');
let allFilesExist = true;

filesToDeploy.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} (文件不存在)`);
        allFilesExist = false;
    }
});

console.log('');

if (!allFilesExist) {
    console.log('❌ 部分文件不存在，請檢查後再部署');
    process.exit(1);
}

console.log('✅ 所有文件都存在，準備部署');
console.log('');

console.log('📋 部署說明：');
console.log('1. 這些文件已經修正了導航欄佈局問題');
console.log('2. Logo 現在會顯示在最左邊');
console.log('3. 導航選項會顯示在中間');
console.log('4. 登入按鈕會顯示在最右邊');
console.log('5. 所有頁面都保持一致的佈局');
console.log('6. 語言選擇器只保留繁體中文選項');

console.log('');

console.log('⚠️  重要提醒：');
console.log('- 只部署了修改過的文件，不會覆蓋同事的其他修改');
console.log('- 導航欄佈局現在在所有頁面都是一致的');
console.log('- 響應式設計保持不變');
console.log('- 移除了英文和日文語言選項，只保留繁體中文');

console.log('');

console.log('🎯 修改內容：');
console.log('- 移除了 navbar-nav 上的 me-auto 和 mx-auto 類別');
console.log('- 更新了 navbar.css 中的桌面端佈局規則');
console.log('- 確保 logo、選項、登入按鈕的正確位置');
console.log('- 移除了語言選擇器中的英文和日文選項');

console.log('');

console.log('🚀 部署步驟：');
console.log('1. 確保您已經登入 Render 帳號');
console.log('2. 在 Render 控制台中選擇您的專案');
console.log('3. 上傳這些修改過的文件');
console.log('4. 觸發重新部署');

console.log('');

console.log('📁 需要上傳的文件：');
filesToDeploy.forEach(file => {
    console.log(`   - ${file}`);
});

console.log('');

console.log('✅ 部署準備完成！');
console.log('💡 提示：建議先在測試環境驗證修改效果'); 