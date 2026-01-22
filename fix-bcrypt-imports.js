const fs = require('fs');
const path = require('path');

// 需要修復的檔案列表
const filesToFix = [
    'server.js',
    'server-https.js', 
    'server-dual.js',
    'init-admin.js',
    'setup-admin.js'
];

console.log('開始修復 bcrypt 引用...');

filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`修復檔案: ${file}`);
        
        let content = fs.readFileSync(file, 'utf8');
        
        // 替換 require 語句
        content = content.replace(
            /const bcrypt = require\('bcrypt'\);?/g,
            "const bcrypt = require('bcryptjs');"
        );
        
        // 寫回檔案
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✓ ${file} 修復完成`);
    } else {
        console.log(`⚠ ${file} 不存在，跳過`);
    }
});

console.log('\n修復完成！請執行以下命令：');
console.log('1. npm uninstall bcrypt');
console.log('2. npm install bcryptjs');
console.log('3. 重新啟動應用'); 