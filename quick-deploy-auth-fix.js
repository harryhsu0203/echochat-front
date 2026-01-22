const { execSync } = require('child_process');

console.log('🚀 快速部署身份驗證修復...');

try {
    // 提交更改
    console.log('📝 提交更改...');
    execSync('git add .');
    execSync('git commit -m "Complete auth fix - relaxed authentication and removed auto-redirect"');
    console.log('✅ 更改已提交');
    
    // 推送到 GitHub
    console.log('📤 推送到 GitHub...');
    execSync('git push origin main');
    console.log('✅ 已推送到 GitHub');
    
    console.log('');
    console.log('🎉 部署完成！');
    console.log('');
    console.log('📋 修復內容：');
    console.log('1. ✅ 創建了寬鬆身份驗證檢查（只檢查 token 存在）');
    console.log('2. ✅ 移除了 API 配置中的自動重定向');
    console.log('3. ✅ 修改儀表板使用寬鬆身份驗證');
    console.log('4. ✅ 創建了測試工具頁面');
    console.log('');
    console.log('🔍 測試步驟：');
    console.log('1. 等待 Render 部署完成（約 2-5 分鐘）');
    console.log('2. 訪問您的網站 + /clear-token.html 清除資料');
    console.log('3. 訪問您的網站 + /test-login.html 測試登入');
    console.log('4. 如果測試成功，再嘗試正常登入');
    console.log('');
    console.log('💡 如果還有問題：');
    console.log('- 檢查瀏覽器控制台（F12）的錯誤訊息');
    console.log('- 使用 /debug-auth.html 進行詳細診斷');
    console.log('- 確認前後端 URL 設定正確');
    
} catch (error) {
    console.error('❌ 部署失敗:', error.message);
    console.log('請手動執行以下命令：');
    console.log('git add .');
    console.log('git commit -m "Complete auth fix"');
    console.log('git push origin main');
} 