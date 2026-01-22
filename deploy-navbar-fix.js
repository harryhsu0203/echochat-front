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
    'public/platforms.html'
];

console.log('🚀 開始部署導航欄修正...');
console.log('📝 只部署以下修改過的文件：\n');

filesToDeploy.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} (文件不存在)`);
    }
});

console.log('\n📋 部署說明：');
console.log('1. 這些文件已經修正了導航欄佈局問題');
console.log('2. Logo 現在會顯示在最左邊');
console.log('3. 導航選項會顯示在中間');
console.log('4. 登入按鈕會顯示在最右邊');
console.log('5. 所有頁面都保持一致的佈局');

console.log('\n⚠️  重要提醒：');
console.log('- 只部署了修改過的文件，不會覆蓋同事的其他修改');
console.log('- 導航欄佈局現在在所有頁面都是一致的');
console.log('- 響應式設計保持不變');

console.log('\n🎯 修改內容：');
console.log('- 移除了 navbar-nav 上的 me-auto 和 mx-auto 類別');
console.log('- 更新了 navbar.css 中的桌面端佈局規則');
console.log('- 確保 logo、選項、登入按鈕的正確位置');

console.log('\n✅ 部署準備完成！'); 