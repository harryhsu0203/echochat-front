const express = require('express');
const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { Client, middleware } = require('@line/bot-sdk');
const axios = require('axios');
const path = require('path');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const multer = require('multer');
const { pipeline } = require('stream/promises');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// 初始化 Express 應用
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 初始化 Vision 實體
const vision = new ImageAnnotatorClient({
    keyFilename: path.join(__dirname, 'credentials', 'google-vision-credentials.json')
});

// 確保上傳目錄存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// 設置 multer
const upload = multer({ dest: 'uploads/' });

// 安全性中間件
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "data:"],
        connectSrc: ["'self'"]
      },
    },
  })
);

// 請求速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: '請求次數過多，請稍後再試'
    }
});

// 登入請求限制
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skip: (req, res) => {
        return res.statusCode === 200;
    },
    message: {
        success: false,
        error: '登入失敗次數過多，請稍後再試'
    }
});

// 中間件設置
app.use(limiter);
app.use('/api/login', loginLimiter);
app.use('/webhook', express.raw({ type: '*/*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT 身份驗證中間件
const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: '未提供認證令牌'
            });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, staff) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    error: '認證令牌無效'
                });
            }
            req.staff = staff;
            next();
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: '認證失敗'
        });
    }
};

// 角色檢查中間件
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.staff) {
            return res.status(401).json({
                success: false,
                error: '未認證'
            });
        }
        
        if (!roles.includes(req.staff.role)) {
            return res.status(403).json({
                success: false,
                error: '權限不足'
            });
        }
        next();
    };
};

// 資料庫連接
let db;
const connectDatabase = (retries = 5) => {
    return new Promise((resolve, reject) => {
        const attemptConnection = (attemptsLeft) => {
            try {
                db = new sqlite3.Database('./database.db', (err) => {
                    if (err) {
                        console.error('❌ 資料庫連接失敗:', err.message);
                        if (attemptsLeft > 0) {
                            console.log(`🔄 重試連接資料庫... (剩餘 ${attemptsLeft} 次)`);
                            setTimeout(() => attemptConnection(attemptsLeft - 1), 1000);
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log('✅ 成功連接到資料庫');
                        console.log('✅ 資料庫載入位置：', path.resolve('./database.db'));
                        resolve();
                    }
                });
            } catch (error) {
                console.error('❌ 資料庫初始化錯誤:', error);
                if (attemptsLeft > 0) {
                    setTimeout(() => attemptConnection(attemptsLeft - 1), 1000);
                } else {
                    reject(error);
                }
            }
        };
        attemptConnection(retries);
    });
};

// 資料庫查詢函數
const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// 初始化資料庫
async function initializeDatabase() {
    try {
        await connectDatabase();
        
        // 創建必要的表格
        await dbQuery(`
            CREATE TABLE IF NOT EXISTS staff_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                email TEXT,
                role TEXT DEFAULT 'staff',
                tenant_id TEXT DEFAULT 'default',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 檢查是否已有管理員帳號
        const adminExists = await dbQuery('SELECT id FROM staff_accounts WHERE username = ?', ['admin']);
        
        if (adminExists.length === 0) {
            // 創建預設管理員帳號
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await dbQuery(`
                INSERT INTO staff_accounts (username, password, name, email, role, tenant_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, ['admin', hashedPassword, '管理員', 'admin@example.com', 'admin', 'default']);
            console.log('✅ 管理員帳號已創建');
        } else {
            console.log('ℹ️ 管理員帳號已存在');
        }

        console.log('✅ 資料庫初始化完成');
    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error);
        throw error;
    }
}

// 登入 API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: '使用者名稱和密碼為必填'
            });
        }

        const users = await dbQuery('SELECT * FROM staff_accounts WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: '使用者名稱或密碼錯誤'
            });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: '使用者名稱或密碼錯誤'
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                tenant_id: user.tenant_id 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({
            success: false,
            error: '伺服器錯誤'
        });
    }
});

// 驗證當前用戶身份
app.get('/api/me', authenticateJWT, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.staff.id,
            username: req.staff.username,
            name: req.staff.name,
            role: req.staff.role
        }
    });
});

// 首頁路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 錯誤處理中間件
const errorHandler = (err, req, res, next) => {
    console.error('錯誤:', err);
    res.status(500).json({
        success: false,
        error: '伺服器內部錯誤'
    });
};

app.use(errorHandler);

// 啟動 HTTPS 伺服器
const port = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await initializeDatabase();
        
        // 讀取 SSL 證書
        const options = {
            key: fs.readFileSync('ssl/key.pem'),
            cert: fs.readFileSync('ssl/cert.pem')
        };

        // 創建 HTTPS 伺服器
        https.createServer(options, app).listen(port, () => {
            console.log(`🚀 HTTPS LINE bot server is running on https://localhost:${port}`);
            console.log(`📝 請在瀏覽器中訪問: https://localhost:${port}/login.html`);
        });
    } catch (error) {
        console.error('❌ 伺服器啟動失敗:', error);
        process.exit(1);
    }
};

startServer();

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信號，準備關閉伺服器...');
    if (db) {
        db.close(() => {
            console.log('資料庫連接已關閉');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}); 