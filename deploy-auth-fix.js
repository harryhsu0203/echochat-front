const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 開始部署身份驗證修復...');

// 檢查是否有未提交的更改
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
        console.log('📝 發現未提交的更改，正在提交...');
        execSync('git add .');
        execSync('git commit -m "Fix authentication redirect issue - improve error handling and CORS settings"');
        console.log('✅ 更改已提交');
    } else {
        console.log('✅ 沒有未提交的更改');
    }
} catch (error) {
    console.log('⚠️ Git 操作失敗，繼續部署...');
}

// 推送到 GitHub
try {
    console.log('📤 推送到 GitHub...');
    execSync('git push origin main');
    console.log('✅ 已推送到 GitHub');
} catch (error) {
    console.error('❌ 推送到 GitHub 失敗:', error.message);
    console.log('請手動執行: git push origin main');
}

console.log('');
console.log('🎉 部署流程完成！');
console.log('');
console.log('📋 修復內容：');
console.log('1. ✅ 改進了 API 錯誤處理');
console.log('2. ✅ 修復了身份驗證檢查邏輯');
console.log('3. ✅ 更新了 CORS 設定');
console.log('4. ✅ 添加了延遲跳轉避免立即重定向');
console.log('5. ✅ 創建了調試工具');
console.log('');
console.log('🔍 測試步驟：');
console.log('1. 等待 Render 自動部署（約 2-5 分鐘）');
console.log('2. 訪問您的網站並登入');
console.log('3. 如果還有問題，訪問 /debug-auth.html 進行調試');
console.log('');
console.log('📞 如果問題持續，請：');
console.log('1. 檢查瀏覽器控制台的錯誤訊息');
console.log('2. 使用調試工具檢查 API 連接');
console.log('3. 確認前後端 URL 設定正確'); 