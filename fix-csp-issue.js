const fs = require('fs');
const path = require('path');

console.log('🔧 修復 CSP 問題...');

const serverPath = path.join(__dirname, 'echochat-api', 'server.js');

if (!fs.existsSync(serverPath)) {
    console.log('❌ echochat-api/server.js 不存在');
    process.exit(1);
}

let content = fs.readFileSync(serverPath, 'utf8');

// 檢查是否已經修復
if (content.includes('contentSecurityPolicy: false')) {
    console.log('✅ CSP 已經被禁用');
} else {
    // 修復 CSP 設定
    const oldCSP = /helmet\(\{[^}]*contentSecurityPolicy[^}]*\}/s;
    const newCSP = `helmet({
    contentSecurityPolicy: false
  })`;
    
    if (oldCSP.test(content)) {
        content = content.replace(oldCSP, newCSP);
        fs.writeFileSync(serverPath, content);
        console.log('✅ CSP 已修復');
    } else {
        console.log('❌ 找不到 CSP 設定');
    }
}

console.log('📝 請手動提交更改：');
console.log('git add -f echochat-api/server.js');
console.log('git commit -m "修復CSP問題：暫時禁用CSP以解決前端連接問題"');
console.log('git push origin main'); 