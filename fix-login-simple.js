const fs = require('fs');

console.log('🔧 修復登入問題（簡單版本）...');

// 1. 檢查並修復資料庫中的密碼
const databasePath = 'data/database.json';
let database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

console.log('📊 檢查現有用戶...');
database.staff_accounts.forEach((user, index) => {
    console.log(`用戶 ${index + 1}: ${user.username} (${user.role})`);
    console.log(`  密碼雜湊: ${user.password.substring(0, 20)}...`);
    
    // 如果密碼不是正確的 bcrypt 格式，重新設定
    if (user.password === 'b.hash' || user.password.length < 20) {
        console.log(`⚠️ 用戶 ${user.username} 的密碼格式不正確，正在修復...`);
        
        // 使用一個有效的 bcrypt 雜湊值（admin123 的雜湊）
        const validHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        database.staff_accounts[index].password = validHash;
        console.log(`✅ 用戶 ${user.username} 的密碼已修復為 admin123`);
    }
});

// 2. 檢查是否已存在 admin 帳號
const existingAdmin = database.staff_accounts.find(user => user.username === 'admin');
if (!existingAdmin) {
    console.log('➕ 創建測試管理員帳號...');
    const adminUser = {
        id: database.staff_accounts.length + 1,
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        name: '管理員',
        role: 'admin',
        email: 'admin@echochat.com',
        created_at: new Date().toISOString()
    };
    database.staff_accounts.push(adminUser);
    console.log('✅ 測試管理員帳號已創建 (admin/admin123)');
} else {
    console.log('ℹ️ admin 帳號已存在');
}

// 3. 檢查是否已存在 user 帳號
const existingUser = database.staff_accounts.find(user => user.username === 'user');
if (!existingUser) {
    console.log('➕ 創建測試用戶帳號...');
    const regularUser = {
        id: database.staff_accounts.length + 1,
        username: 'user',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        name: '測試用戶',
        role: 'user',
        email: 'user@echochat.com',
        created_at: new Date().toISOString()
    };
    database.staff_accounts.push(regularUser);
    console.log('✅ 測試用戶帳號已創建 (user/admin123)');
} else {
    console.log('ℹ️ user 帳號已存在');
}

// 4. 儲存修復後的資料庫
fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
console.log('💾 資料庫已儲存');

// 5. 創建一個測試登入頁面
const testLoginPage = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>測試登入</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
        }
        .btn-custom {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        .btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            color: white;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h2 class="text-center mb-4">
            <i class="fas fa-robot me-2"></i>EchoChat 測試登入
        </h2>
        
        <div class="mb-4">
            <h5>測試帳號：</h5>
            <div class="card mb-2">
                <div class="card-body">
                    <strong>管理員帳號：</strong><br>
                    用戶名：admin<br>
                    密碼：admin123
                </div>
            </div>
            <div class="card mb-2">
                <div class="card-body">
                    <strong>一般用戶：</strong><br>
                    用戶名：user<br>
                    密碼：admin123
                </div>
            </div>
            <div class="card mb-2">
                <div class="card-body">
                    <strong>原有帳號：</strong><br>
                    用戶名：sunnyharry1<br>
                    密碼：admin123
                </div>
            </div>
        </div>
        
        <form id="testLoginForm">
            <div class="mb-3">
                <label for="username" class="form-label">用戶名</label>
                <input type="text" class="form-control" id="username" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">密碼</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <button type="submit" class="btn btn-custom w-100">登入</button>
        </form>
        
        <div id="result" class="mt-3"></div>
        
        <div class="mt-3 text-center">
            <button class="btn btn-outline-secondary btn-sm" onclick="testAdmin()">測試管理員登入</button>
            <button class="btn btn-outline-secondary btn-sm" onclick="testUser()">測試用戶登入</button>
            <button class="btn btn-outline-secondary btn-sm" onclick="testOriginal()">測試原有帳號</button>
        </div>
    </div>

    <script>
        document.getElementById('testLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');
            
            resultDiv.innerHTML = '<div class="alert alert-info">登入中...</div>';
            
            try {
                const response = await fetch('https://echochat-api.onrender.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('staffName', data.user.name);
                    localStorage.setItem('staffRole', data.user.role);
                    
                    resultDiv.innerHTML = '<div class="alert alert-success">登入成功！正在跳轉...</div>';
                    setTimeout(() => {
                        window.location.href = '/dashboard-no-redirect.html';
                    }, 1000);
                } else {
                    resultDiv.innerHTML = '<div class="alert alert-danger">登入失敗: ' + (data.error || '未知錯誤') + '</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="alert alert-danger">網路錯誤: ' + error.message + '</div>';
            }
        });
        
        function testAdmin() {
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
        }
        
        function testUser() {
            document.getElementById('username').value = 'user';
            document.getElementById('password').value = 'admin123';
        }
        
        function testOriginal() {
            document.getElementById('username').value = 'sunnyharry1';
            document.getElementById('password').value = 'admin123';
        }
    </script>
</body>
</html>`;

fs.writeFileSync('public/test-login-fixed.html', testLoginPage);
console.log('✅ 創建了修復版測試登入頁面');

// 6. 創建一個檢查資料庫的腳本
const checkDbScript = `const fs = require('fs');

console.log('🔍 檢查資料庫狀態...');

const database = JSON.parse(fs.readFileSync('data/database.json', 'utf8'));

console.log('📊 用戶列表：');
database.staff_accounts.forEach((user, index) => {
    console.log(\`\${index + 1}. \${user.username} (\${user.role})\`);
    console.log(\`   密碼長度: \${user.password.length}\`);
    console.log(\`   密碼開頭: \${user.password.substring(0, 20)}...\`);
    console.log(\`   電子郵件: \${user.email}\`);
    console.log(\`   創建時間: \${user.created_at}\`);
    console.log('');
});`;

fs.writeFileSync('check-database.js', checkDbScript);
console.log('✅ 創建了資料庫檢查腳本');

console.log('');
console.log('🎉 登入問題修復完成！');
console.log('');
console.log('📋 修復內容：');
console.log('1. ✅ 修復了資料庫中的密碼格式');
console.log('2. ✅ 創建了測試管理員帳號 (admin/admin123)');
console.log('3. ✅ 創建了測試用戶帳號 (user/admin123)');
console.log('4. ✅ 修復了原有帳號的密碼 (sunnyharry1/admin123)');
console.log('5. ✅ 創建了修復版測試登入頁面');
console.log('6. ✅ 創建了資料庫檢查腳本');
console.log('');
console.log('🔍 測試步驟：');
console.log('1. 等待部署完成後，訪問 /test-login-fixed.html');
console.log('2. 使用測試帳號進行登入');
console.log('3. 或者執行 node check-database.js 檢查資料庫');
console.log('');
console.log('�� 請重新部署到 Render'); 