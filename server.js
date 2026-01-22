const express = require('express');
const fs = require('fs');
// 移除資料庫依賴，使用 JSON 檔案儲存
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
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const DEFAULT_SENDER_EMAIL = 'contact@echochat.com.tw';
const EMAIL_ACCOUNT = process.env.EMAIL_USER || 'echochatsup@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASS || 'skoh eqrm behq twmt';
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM || DEFAULT_SENDER_EMAIL;

// 初始化 Express 應用
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'echochat-jwt-secret-key-2024';

// 簡單快取網站內容，供公開聊天端點使用
let siteContextCache = { text: '', mtimeMs: 0 };

function extractSiteContext() {
    try {
        const indexPath = path.join(__dirname, 'public', 'index.html');
        const stat = fs.statSync(indexPath);
        if (siteContextCache.text && stat.mtimeMs === siteContextCache.mtimeMs) {
            return siteContextCache.text;
        }
        const html = fs.readFileSync(indexPath, 'utf-8');
        const parts = [];

        // meta description
        const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (metaMatch) parts.push(`網站描述: ${metaMatch[1]}`);

        // hero-slogan
        const sloganMatch = html.match(/<div class="hero-slogan">[\s\S]*?<h1>([^<]+)<\/h1>[\s\S]*?<p>([^<]+)<\/p>[\s\S]*?<\/div>/i);
        if (sloganMatch) {
            parts.push(`主標: ${sloganMatch[1]}`);
            parts.push(`說明: ${sloganMatch[2]}`);
        }

        // feature grid h3+p
        const featureSection = html.match(/<div class="feature-grid">([\s\S]*?)<\/div>/i);
        if (featureSection) {
            const features = [];
            const re = /<h3[^>]*>([^<]+)<\/h3>\s*<p[^>]*>([^<]+)<\/p>/g;
            let m;
            while ((m = re.exec(featureSection[1])) !== null) {
                features.push(`${m[1]}: ${m[2]}`);
            }
            if (features.length) parts.push(`功能重點: ${features.join('；')}`);
        }

        const context = parts.join('\n');
        siteContextCache = { text: context, mtimeMs: stat.mtimeMs };
        return context;
    } catch (err) {
        return '';
    }
}

// CORS 設定 - 允許手機端 app 與前端網站訪問
app.use(cors({
    origin: [
        // 本地
        'http://localhost:3000',
        'http://localhost:5000',
        // Render 服務
        'https://echochat-frontend.onrender.com',
        'https://echochat-api.onrender.com',
        'https://echochat.onrender.com',
        // 自訂網域
        'https://echochat.com.tw',
        'https://www.echochat.com.tw'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 電子郵件配置
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 使用 STARTTLS
    auth: {
        user: EMAIL_ACCOUNT,
        pass: EMAIL_PASSWORD // 移除空格，直接使用應用程式密碼
    },
    tls: {
        rejectUnauthorized: false
    }
});

// 生成隨機驗證碼
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 發送驗證碼電子郵件
const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: EMAIL_FROM_ADDRESS,
        to: email,
        subject: 'EchoChat - 電子郵件驗證碼',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">EchoChat 電子郵件驗證</h2>
                <p>您的驗證碼是：</p>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #667eea; border-radius: 8px; margin: 20px 0;">
                    ${code}
                </div>
                <p>此驗證碼將在10分鐘後過期。</p>
                <p>如果您沒有要求此驗證碼，請忽略此郵件。</p>
            </div>
        `
    };
    
    return transporter.sendMail(mailOptions);
};

// 發送密碼重設電子郵件
const sendPasswordResetEmail = async (email, code) => {
    const mailOptions = {
        from: EMAIL_FROM_ADDRESS,
        to: email,
        subject: 'EchoChat - 密碼重設驗證碼',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">EchoChat 密碼重設</h2>
                <p>您要求重設密碼，請使用以下驗證碼：</p>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #667eea; border-radius: 8px; margin: 20px 0;">
                    ${code}
                </div>
                <p>此驗證碼將在10分鐘後過期。</p>
                <p>如果您沒有要求重設密碼，請忽略此郵件並確保您的帳號安全。</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    此郵件由 EchoChat 系統自動發送，請勿回覆。
                </p>
            </div>
        `
    };
    
    return transporter.sendMail(mailOptions);
};

// 初始化 Vision 實體 (如果環境變數存在)
let vision = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    vision = new ImageAnnotatorClient();
}

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
        connectSrc: ["'self'", "https://echochat-api.onrender.com", "https://echochat-frontend.onrender.com", "https://echochat.onrender.com"]
      },
    },
  })
);

// 根路由重定向到首頁（必須在所有其他路由之前）
app.get('/', (req, res) => {
    console.log('📝 訪問首頁，返回 index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 添加 /index.html 路由
app.get('/index.html', (req, res) => {
    console.log('📝 訪問 index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 環境變數檢查端點（僅用於開發和測試）
app.get('/api/env-check', (req, res) => {
    const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN ? '已設置' : '未設置',
        LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET ? '已設置' : '未設置',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '已設置' : '未設置',
        JWT_SECRET: process.env.JWT_SECRET ? '已設置' : '未設置',
        PORT: process.env.PORT,
        DATA_DIR: process.env.DATA_DIR
    };
    
    // 添加詳細的 OpenAI API 金鑰檢查
    const openaiKeyStatus = {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        startsWith: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) : 'N/A',
        isValid: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.startsWith('sk-') : false
    };
    
    // 添加詳細的 JWT_SECRET 檢查
    const jwtSecretStatus = {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        isDefault: !process.env.JWT_SECRET || process.env.JWT_SECRET === 'echochat-jwt-secret-key-2024',
        value: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'N/A'
    };
    
    res.json({
        success: true,
        message: '環境變數檢查',
        envVars: envVars,
        openaiKeyStatus: openaiKeyStatus,
        jwtSecretStatus: jwtSecretStatus,
        timestamp: new Date().toISOString()
    });
});

// 測試端點 - 用於診斷認證問題
app.get('/api/test-auth', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    const testResult = {
        hasAuthHeader: !!authHeader,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        jwtSecretExists: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        timestamp: new Date().toISOString()
    };
    
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            testResult.tokenValid = true;
            testResult.decodedToken = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
                iat: decoded.iat,
                exp: decoded.exp
            };
        } catch (error) {
            testResult.tokenValid = false;
            testResult.tokenError = error.message;
        }
    }
    
    res.json({
        success: true,
        message: '認證測試結果',
        testResult: testResult
    });
});

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


// 靜態文件服務
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
        if (!token) {
            return res.status(401).json({
                success: false,
                error: '認證令牌格式錯誤'
            });
        }

        // 檢查 JWT_SECRET 是否正確設置
        if (!process.env.JWT_SECRET) {
            console.error('⚠️ JWT_SECRET 未正確設置:', {
                hasEnvVar: !!process.env.JWT_SECRET,
                value: process.env.JWT_SECRET ? '已設置' : '未設置'
            });
            return res.status(500).json({
                success: false,
                error: '伺服器配置錯誤：JWT_SECRET 未正確設置'
            });
        }

        jwt.verify(token, JWT_SECRET, (err, staff) => {
            if (err) {
                console.error('❌ JWT 驗證失敗:', {
                    error: err.message,
                    name: err.name,
                    jwtSecretExists: !!process.env.JWT_SECRET,
                    tokenLength: token.length
                });
                
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({
                        success: false,
                        error: '認證令牌已過期，請重新登入'
                    });
                } else if (err.name === 'JsonWebTokenError') {
                    return res.status(403).json({
                        success: false,
                        error: '無效的認證令牌'
                    });
                } else {
                    return res.status(403).json({
                        success: false,
                        error: '認證令牌驗證失敗'
                    });
                }
            }
            req.staff = staff;
            next();
        });
    } catch (error) {
        console.error('認證過程發生錯誤:', error);
        return res.status(500).json({
            success: false,
            error: '認證過程發生錯誤'
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

// 簡單的 JSON 檔案儲存系統
const dataDir = process.env.NODE_ENV === 'production' ? process.env.DATA_DIR || './data' : './data';
const dataFile = path.join(dataDir, 'database.json');

// 確保資料目錄存在
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化資料結構
let database = {
    staff_accounts: [],
    user_questions: [],
    knowledge: [],
    user_states: [],
    chat_history: [],
    ai_assistant_config: [],
    email_verifications: [], // 儲存電子郵件驗證碼
    password_reset_requests: [] // 儲存密碼重設請求
};

// 載入現有資料
const loadDatabase = () => {
    try {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            const loadedData = JSON.parse(data);
            
            // 確保所有必要的欄位都存在
            database = {
                staff_accounts: loadedData.staff_accounts || [],
                user_questions: loadedData.user_questions || [],
                knowledge: loadedData.knowledge || [],
                user_states: loadedData.user_states || [],
                chat_history: loadedData.chat_history || [],
                ai_assistant_config: loadedData.ai_assistant_config || [],
                email_verifications: loadedData.email_verifications || [],
                password_reset_requests: loadedData.password_reset_requests || []
            };
        }
    } catch (error) {
        console.error('載入資料庫檔案失敗:', error.message);
    }
};

// 儲存資料
const saveDatabase = () => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(database, null, 2));
    } catch (error) {
        console.error('儲存資料庫檔案失敗:', error.message);
    }
};

// 初始化資料庫
const connectDatabase = async () => {
    try {
        loadDatabase();
        
        // 檢查管理員帳號是否存在
        const adminExists = database.staff_accounts.find(staff => staff.username === 'sunnyharry1');
        if (!adminExists) {
            console.warn('⚠️ 找不到預期的 super_admin 帳號 sunnyharry1，請執行 scripts/add-user.js 以建立安全密碼的帳號。');
        } else {
            if (adminExists.role !== 'super_admin') {
                adminExists.role = 'super_admin';
                saveDatabase();
                console.log('🔁 已自動將 sunnyharry1 升級為 super_admin。');
            } else {
                console.log('ℹ️ 管理員帳號已存在並具有 super_admin 權限');
            }
        }
        
        console.log('✅ JSON 資料庫初始化完成');
        return true;
    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error.message);
        throw error;
    }
};

// 簡單的查詢輔助函數
const findStaffByUsername = (username) => {
    return database.staff_accounts.find(staff => staff.username === username);
};

const findStaffById = (id) => {
    return database.staff_accounts.find(staff => staff.id === parseInt(id));
};

const updateStaffPassword = (id, newPassword) => {
    const staff = findStaffById(id);
    if (staff) {
        staff.password = newPassword;
        saveDatabase();
        return true;
    }
    return false;
};

const deleteStaffById = (id) => {
    const index = database.staff_accounts.findIndex(staff => staff.id === parseInt(id));
    if (index !== -1) {
        database.staff_accounts.splice(index, 1);
        saveDatabase();
        return true;
    }
    return false;
};



// API 路由

// 登入 API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: '請提供用戶名和密碼'
            });
        }

        try {
            const staff = findStaffByUsername(username);
            
            if (!staff) {
                return res.status(401).json({
                    success: false,
                    error: '用戶名或密碼錯誤'
                });
            }

            const isValidPassword = await bcrypt.compare(password, staff.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: '用戶名或密碼錯誤'
                });
            }

            // 檢查 JWT_SECRET 是否正確設置
            if (!process.env.JWT_SECRET) {
                console.error('⚠️ JWT_SECRET 未正確設置:', {
                    hasEnvVar: !!process.env.JWT_SECRET,
                    value: process.env.JWT_SECRET ? '已設置' : '未設置'
                });
                return res.status(500).json({
                    success: false,
                    error: '伺服器配置錯誤：JWT_SECRET 未正確設置'
                });
            }

            const token = jwt.sign(
                { 
                    id: staff.id, 
                    username: staff.username, 
                    name: staff.name, 
                    role: staff.role 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ 登入成功:', {
                username: staff.username,
                role: staff.role,
                jwtSecretExists: !!process.env.JWT_SECRET,
                tokenLength: token.length
            });

            res.json({
                success: true,
                token,
                user: {
                    id: staff.id,
                    username: staff.username,
                    name: staff.name,
                    role: staff.role
                }
            });
        } catch (error) {
            console.error('登入錯誤:', error);
            return res.status(500).json({
                success: false,
                error: '登入過程發生錯誤'
            });
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({
            success: false,
            error: '登入過程發生錯誤'
        });
    }
});

// 驗證用戶身份 API
app.get('/api/me', authenticateJWT, (req, res) => {
    try {
        const user = findStaffById(req.staff.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: '用戶不存在'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('獲取用戶資料錯誤:', error);
        res.status(500).json({
            success: false,
            error: '伺服器錯誤'
        });
    }
});

// 發送電子郵件驗證碼 API
app.post('/api/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: '請提供電子郵件地址'
            });
        }
        
        // 檢查電子郵件是否已存在
        const existingUser = database.staff_accounts.find(staff => staff.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: '此電子郵件已被註冊'
            });
        }
        
        // 生成驗證碼
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分鐘後過期
        
        // 儲存驗證碼（移除舊的同一電子郵件驗證碼）
        database.email_verifications = database.email_verifications.filter(
            verification => verification.email !== email
        );
        database.email_verifications.push({
            email: email,
            code: code,
            expiresAt: expiresAt.toISOString(),
            verified: false
        });
        saveDatabase();
        
        // 嘗試發送電子郵件
        try {
            console.log('📧 嘗試發送郵件到:', email);
            console.log('🔧 郵件配置:', {
                user: EMAIL_ACCOUNT,
                from: EMAIL_FROM_ADDRESS,
                pass: process.env.EMAIL_PASS ? '***已設定***' : '***未設定***'
            });
            
            await sendVerificationEmail(email, code);
            console.log('✅ 驗證碼已發送到:', email);
            
            res.json({
                success: true,
                message: '驗證碼已發送到您的電子郵件'
            });
        } catch (emailError) {
            console.log('⚠️ 電子郵件發送失敗，但驗證碼已生成:', code);
            console.error('📧 詳細錯誤信息:', emailError);
            
            // 郵件發送失敗時，返回驗證碼作為備案
            res.json({
                success: true,
                message: '驗證碼已生成（郵件服務暫時不可用）',
                code: code
            });
        }
        
    } catch (error) {
        console.error('發送驗證碼錯誤:', error);
        res.status(500).json({
            success: false,
            error: '發送驗證碼失敗，請稍後再試'
        });
    }
});

// 驗證電子郵件驗證碼 API
app.post('/api/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: '請提供電子郵件和驗證碼'
            });
        }
        
        // 尋找驗證記錄
        const verification = database.email_verifications.find(
            v => v.email === email && v.code === code && !v.verified
        );
        
        if (!verification) {
            return res.status(400).json({
                success: false,
                error: '驗證碼無效'
            });
        }
        
        // 檢查是否過期
        if (new Date() > new Date(verification.expiresAt)) {
            return res.status(400).json({
                success: false,
                error: '驗證碼已過期'
            });
        }
        
        // 標記為已驗證
        verification.verified = true;
        saveDatabase();
        
        res.json({
            success: true,
            message: '電子郵件驗證成功'
        });
        
    } catch (error) {
        console.error('驗證碼驗證錯誤:', error);
        res.status(500).json({
            success: false,
            error: '驗證失敗，請稍後再試'
        });
    }
});

// 使用者註冊 API
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, lineConfig } = req.body;
        
        // 驗證必要欄位
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: '請填寫所有必要欄位'
            });
        }
        
        // 檢查電子郵件是否已驗證
        const verification = database.email_verifications.find(
            v => v.email === email && v.verified
        );
        if (!verification) {
            return res.status(400).json({
                success: false,
                error: '請先驗證電子郵件'
            });
        }
        
        // 檢查用戶名是否已存在
        const existingUser = database.staff_accounts.find(staff => 
            staff.username === username || staff.email === email
        );
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: '用戶名或電子郵件已存在'
            });
        }
        
        // 密碼加密
        const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
            });
        });
        
        // 創建新用戶
        const newUser = {
            id: database.staff_accounts.length + 1,
            username: username,
            password: hash,
            name: username, // 預設使用用戶名作為顯示名稱
            role: 'user',
            email: email,
            created_at: new Date().toISOString(),
            line_config: {
                channel_access_token: '',
                channel_secret: '',
                webhook_url: '',
                enabled: false
            }
        };
        
        database.staff_accounts.push(newUser);
        saveDatabase();
        
        console.log('✅ 新用戶註冊成功:', username);
        
        res.json({
            success: true,
            message: '註冊成功'
        });
        
    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({
            success: false,
            error: '註冊過程發生錯誤'
        });
    }
});

// 獲取個人資料 API
app.get('/api/profile', authenticateJWT, (req, res) => {
    try {
        res.json({
            success: true,
            profile: {
                id: req.staff.id,
                username: req.staff.username,
                name: req.staff.name,
                role: req.staff.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '獲取個人資料失敗'
        });
    }
});

// 更新個人資料 API
app.post('/api/profile', authenticateJWT, (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                error: '請提供顯示名稱'
            });
        }

        // 這裡原本是使用 sqlite3，需要改為直接操作 database 物件
        // db.run("UPDATE staff SET name = ? WHERE id = ?", [name, req.staff.id], function(err) {
        //     if (err) {
        //         return res.status(500).json({
        //             success: false,
        //             error: '更新個人資料失敗'
        //         });
        //     }

        //     res.json({
        //         success: true,
        //         message: '個人資料已更新'
        //     });
        // });
        // 暫時使用內存資料庫，實際應用需要持久化
        const staff = findStaffById(req.staff.id);
        if (staff) {
            staff.name = name;
            saveDatabase();
            res.json({
                success: true,
                message: '個人資料已更新'
            });
        } else {
            res.status(404).json({
                success: false,
                error: '用戶不存在'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '更新個人資料失敗'
        });
    }
});

// 修改密碼 API
app.post('/api/change-password', authenticateJWT, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: '請提供舊密碼和新密碼'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: '新密碼長度至少需要6個字元'
            });
        }

        try {
            const staff = findStaffById(req.staff.id);
            
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    error: '用戶不存在'
                });
            }

            const isValidPassword = await bcrypt.compare(oldPassword, staff.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: '舊密碼錯誤'
                });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const updated = updateStaffPassword(req.staff.id, hashedNewPassword);

            if (updated) {
                res.json({
                    success: true,
                    message: '密碼已成功修改'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: '修改密碼失敗'
                });
            }
        } catch (error) {
            console.error('修改密碼錯誤:', error);
            return res.status(500).json({
                success: false,
                error: '修改密碼失敗'
            });
        }
    } catch (error) {
        console.error('修改密碼錯誤:', error);
        res.status(500).json({
            success: false,
            error: '修改密碼失敗'
        });
    }
});

// 刪除帳號 API
app.post('/api/delete-account', authenticateJWT, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                error: '請提供密碼'
            });
        }

        try {
            const staff = findStaffById(req.staff.id);
            
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    error: '用戶不存在'
                });
            }

            const isValidPassword = await bcrypt.compare(password, staff.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: '密碼錯誤'
                });
            }

            const deleted = deleteStaffById(req.staff.id);

            if (deleted) {
                res.json({
                    success: true,
                    message: '帳號已成功刪除'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: '帳號不存在'
                });
            }
        } catch (error) {
            console.error('刪除帳號錯誤:', error);
            res.status(500).json({
                success: false,
                error: '刪除帳號失敗'
            });
        }
    } catch (error) {
        console.error('刪除帳號錯誤:', error);
        res.status(500).json({
            success: false,
            error: '刪除帳號失敗'
        });
    }
});

// 忘記密碼 API - 發送驗證碼
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: '請提供電子郵件地址'
            });
        }

        // 查找用戶
        const user = database.staff_accounts.find(staff => staff.email === email);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: '找不到此電子郵件地址的帳號'
            });
        }

        // 生成驗證碼
        const verificationCode = generateVerificationCode();
        
        // 儲存驗證碼到資料庫（包含過期時間）
        const resetRequest = {
            email: email,
            code: verificationCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分鐘後過期
            createdAt: new Date().toISOString()
        };

        // 移除舊的驗證碼
        database.password_reset_requests = database.password_reset_requests.filter(
            req => req.email !== email
        );
        
        // 添加新的驗證碼
        database.password_reset_requests.push(resetRequest);
        saveDatabase();

        // 發送驗證碼電子郵件
        try {
            await sendPasswordResetEmail(email, verificationCode);
            
            console.log('✅ 密碼重設驗證碼已發送給:', email);
            
            res.json({
                success: true,
                message: '驗證碼已發送到您的電子郵件'
            });
        } catch (emailError) {
            console.error('發送密碼重設郵件失敗:', emailError);
            res.status(500).json({
                success: false,
                error: '發送驗證碼失敗，請稍後再試'
            });
        }
    } catch (error) {
        console.error('忘記密碼錯誤:', error);
        res.status(500).json({
            success: false,
            error: '處理請求失敗'
        });
    }
});

// 重設密碼 API
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                error: '請提供所有必要資訊'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: '新密碼長度至少需要6個字元'
            });
        }

        // 查找驗證碼請求
        const resetRequest = database.password_reset_requests.find(
            req => req.email === email && req.code === code
        );

        if (!resetRequest) {
            return res.status(400).json({
                success: false,
                error: '驗證碼錯誤或已過期'
            });
        }

        // 檢查驗證碼是否過期
        if (new Date() > new Date(resetRequest.expiresAt)) {
            // 移除過期的驗證碼
            database.password_reset_requests = database.password_reset_requests.filter(
                req => req.email !== email
            );
            saveDatabase();
            
            return res.status(400).json({
                success: false,
                error: '驗證碼已過期，請重新申請'
            });
        }

        // 查找用戶
        const user = database.staff_accounts.find(staff => staff.email === email);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: '找不到此電子郵件地址的帳號'
            });
        }

        // 更新密碼
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        user.updated_at = new Date().toISOString();
        
        // 移除已使用的驗證碼
        database.password_reset_requests = database.password_reset_requests.filter(
            req => req.email !== email
        );
        
        saveDatabase();

        console.log('✅ 密碼重設成功:', email);
        
        res.json({
            success: true,
            message: '密碼重設成功'
        });
    } catch (error) {
        console.error('重設密碼錯誤:', error);
        res.status(500).json({
            success: false,
            error: '重設密碼失敗'
        });
    }
});

// AI 助理配置 API
// 獲取 AI 助理配置
app.get('/api/ai-assistant-config', authenticateJWT, (req, res) => {
    try {
        // 獲取第一個配置，如果沒有則返回預設值
        const config = database.ai_assistant_config[0] || {
            assistant_name: '設計師 Rainy',
            llm: 'gpt-4o-mini',
            use_case: 'customer-service',
            description: 'OBJECTIVE(目標任務):\n你的目標是客戶服務與美容美髮發行錄，創造一個良好的對話體驗，讓客戶感到舒適，願意分享他們的真實想法及需求。\n\nSTYLE(風格/個性):\n你的個性是很健談並且很直率人保學會存在，樂於創造一個放鬆和友好的氣圍。\n\nTONE(語調):\n親性、溫柔、深情人心。',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        res.json({
            success: true,
            config: config
        });
    } catch (error) {
        console.error('獲取 AI 助理配置錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取配置失敗'
        });
    }
});

// 更新 AI 助理配置
app.post('/api/ai-assistant-config', authenticateJWT, (req, res) => {
    try {
        const { assistant_name, llm, use_case, description } = req.body;
        
        // 驗證必要欄位
        if (!assistant_name || !llm || !use_case) {
            return res.status(400).json({
                success: false,
                error: '請填寫所有必要欄位'
            });
        }
        
        const config = {
            assistant_name: assistant_name.trim(),
            llm: llm.trim(),
            use_case: use_case.trim(),
            description: description ? description.trim() : '',
            updated_at: new Date().toISOString()
        };
        
        // 如果是第一個配置，添加創建時間
        if (database.ai_assistant_config.length === 0) {
            config.created_at = new Date().toISOString();
        } else {
            config.created_at = database.ai_assistant_config[0].created_at;
        }
        
        // 更新或創建配置（只保留一個配置）
        database.ai_assistant_config = [config];
        saveDatabase();
        
        console.log('✅ AI 助理配置已更新:', config.assistant_name);
        
        res.json({
            success: true,
            message: 'AI 助理配置已成功更新',
            config: config
        });
    } catch (error) {
        console.error('更新 AI 助理配置錯誤:', error);
        res.status(500).json({
            success: false,
            error: '更新配置失敗'
        });
    }
});

// 重置 AI 助理配置為預設值
app.post('/api/ai-assistant-config/reset', authenticateJWT, (req, res) => {
    try {
        const defaultConfig = {
            assistant_name: '設計師 Rainy',
            llm: 'gpt-4o-mini',
            use_case: 'customer-service',
            description: 'OBJECTIVE(目標任務):\n你的目標是客戶服務與美容美髮發行錄，創造一個良好的對話體驗，讓客戶感到舒適，願意分享他們的真實想法及需求。\n\nSTYLE(風格/個性):\n你的個性是很健談並且很直率人保學會存在，樂於創造一個放鬆和友好的氣圍。\n\nTONE(語調):\n親性、溫柔、深情人心。',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // 重置為預設配置
        database.ai_assistant_config = [defaultConfig];
        saveDatabase();
        
        console.log('✅ AI 助理配置已重置為預設值');
        
        res.json({
            success: true,
            message: 'AI 助理配置已重置為預設值',
            config: defaultConfig
        });
    } catch (error) {
        console.error('重置 AI 助理配置錯誤:', error);
        res.status(500).json({
            success: false,
            error: '重置配置失敗'
        });
    }
});

// 獲取所有可用的 AI 模型資訊
app.get('/api/ai-models', authenticateJWT, (req, res) => {
    try {
        const models = {
            'gpt-4o-mini': {
                name: 'GPT-4o Mini',
                provider: 'OpenAI',
                description: '快速且經濟實惠的對話體驗，適合一般客服需求',
                features: ['快速回應', '成本效益高', '支援多語言', '適合日常對話'],
                pricing: '經濟實惠',
                speed: '快速',
                max_tokens: 128000,
                supported_languages: ['中文', '英文', '日文', '韓文', '法文', '德文', '西班牙文']
            },
            'gpt-4o': {
                name: 'GPT-4o',
                provider: 'OpenAI',
                description: '高級版本，提供更強大的理解和生成能力',
                features: ['高品質回應', '複雜任務處理', '創意內容生成', '深度理解'],
                pricing: '中等',
                speed: '中等',
                max_tokens: 128000,
                supported_languages: ['中文', '英文', '日文', '韓文', '法文', '德文', '西班牙文']
            },
            'gpt-4-turbo': {
                name: 'GPT-4 Turbo',
                provider: 'OpenAI',
                description: '平衡效能和速度的優化版本',
                features: ['平衡效能', '快速處理', '高品質輸出', '廣泛應用'],
                pricing: '中等',
                speed: '快速',
                max_tokens: 128000,
                supported_languages: ['中文', '英文', '日文', '韓文', '法文', '德文', '西班牙文']
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                provider: 'OpenAI',
                description: '經典版本，穩定可靠且成本較低',
                features: ['穩定可靠', '成本較低', '快速回應', '廣泛支援'],
                pricing: '經濟實惠',
                speed: '快速',
                max_tokens: 16385,
                supported_languages: ['中文', '英文', '日文', '韓文', '法文', '德文', '西班牙文']
            },
            'gpt-3.5-turbo-16k': {
                name: 'GPT-3.5 Turbo 16K',
                provider: 'OpenAI',
                description: '支援更長對話的擴展版本',
                features: ['長對話支援', '大上下文', '穩定效能', '適合複雜對話'],
                pricing: '中等',
                speed: '中等',
                max_tokens: 16385,
                supported_languages: ['中文', '英文', '日文', '韓文', '法文', '德文', '西班牙文']
            }
        };
        
        res.json({
            success: true,
            models: models
        });
    } catch (error) {
        console.error('獲取 AI 模型資訊錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取模型資訊失敗'
        });
    }
});

// AI 聊天 API 端點 - 使用配置的 AI 模型生成回應
app.post('/api/chat', authenticateJWT, async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: '請提供有效的訊息內容'
            });
        }

        // 載入資料庫
        loadDatabase();
        
        // 獲取 AI 助理配置
        const aiConfig = database.ai_assistant_config[0] || {
            assistant_name: 'AI 助理',
            llm: 'gpt-4o-mini',
            use_case: 'customer-service',
            description: '我是您的智能客服助理，很高興為您服務！'
        };

        // 構建系統提示詞
        const systemPrompt = `你是 ${aiConfig.assistant_name}，${aiConfig.description}。你的使用場景是：${aiConfig.use_case}。請根據用戶的問題提供專業、友善且有用的回應。`;

        // 準備對話歷史
        let conversationHistory = [];
        if (conversationId && database.chat_history) {
            const existingConversation = database.chat_history.find(conv => conv.id === conversationId);
            if (existingConversation && existingConversation.messages) {
                conversationHistory = existingConversation.messages.slice(-10); // 保留最近10條訊息
            }
        }

        // 構建完整的對話訊息
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        // 調用 OpenAI API
        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: aiConfig.llm,
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiReply = openaiResponse.data.choices[0].message.content.trim();

        // 更新對話歷史
        const newMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        const aiMessage = {
            role: 'assistant',
            content: aiReply,
            timestamp: new Date().toISOString()
        };

        // 保存對話歷史
        if (!database.chat_history) {
            database.chat_history = [];
        }

        let conversation;
        if (conversationId) {
            conversation = database.chat_history.find(conv => conv.id === conversationId);
        }

        if (!conversation) {
            conversation = {
                id: conversationId || `conv_${Date.now()}`,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            database.chat_history.push(conversation);
        }

        conversation.messages.push(newMessage, aiMessage);
        conversation.updatedAt = new Date().toISOString();

        // 保存到資料庫
        saveDatabase();

        res.json({
            success: true,
            reply: aiReply,
            conversationId: conversation.id,
            model: aiConfig.llm,
            assistantName: aiConfig.assistant_name
        });

    } catch (error) {
        console.error('AI 聊天錯誤:', error);
        
        // 檢查是否為 OpenAI API 錯誤
        if (error.response && error.response.status === 401) {
            console.error('OpenAI API 金鑰錯誤:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            return res.status(500).json({
                success: false,
                error: 'OpenAI API 金鑰無效或已過期',
                details: '請檢查您的 OpenAI API 金鑰是否正確設置'
            });
        } else if (error.response && error.response.status === 429) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API 請求頻率過高，請稍後再試'
            });
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(500).json({
                success: false,
                error: '無法連接到 OpenAI 服務，請檢查網路連接'
            });
        } else if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API 金鑰未設置',
                details: '請在環境變數中設置 OPENAI_API_KEY'
            });
        } else if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API 金鑰未正確設置',
                details: '請將 your_openai_api_key_here 替換為實際的 API 金鑰'
            });
        }

        res.status(500).json({
            success: false,
            error: 'AI 回應生成失敗，請稍後再試',
            details: error.message
        });
    }
});

// 首頁公開聊天端點：不需登入，使用網站內容作為上下文
app.post('/api/public-chat', async (req, res) => {
    try {
        const { message } = req.body || {};
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, error: '請提供有效的訊息內容' });
        }

        const context = extractSiteContext();
        const systemPrompt = `你是本網站的客服助理。請根據以下網站內容提供準確、簡潔且友善的回答。若內容未涵蓋，請以一般說明回覆，並引導使用者透過頁腳聯繫我們。\n\n【網站內容】\n${context}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ];

        // 若未設定 OPENAI_API_KEY，使用降級回覆，避免 500
        if (!process.env.OPENAI_API_KEY) {
            const fallback =
                (context && `根據本站資訊：\n${context}\n\n若需要更多協助，請透過頁腳的「聯繫我們」與我們聯絡。`) ||
                '目前系統開發測試中，如需協助請透過頁腳的「聯繫我們」與我們聯絡。';
            return res.json({ success: true, reply: fallback });
        }

        const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: process.env.PUBLIC_CHAT_MODEL || 'gpt-4o-mini',
            messages,
            max_tokens: 600,
            temperature: 0.7
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiReply = openaiResponse.data.choices?.[0]?.message?.content?.trim() || '目前無法提供回覆，請稍後再試。';
        res.json({ success: true, reply: aiReply });
    } catch (error) {
        console.error('公開聊天錯誤:', error.response?.data || error.message);
        // 提供更具體的錯誤提示但不洩漏敏感資訊
        const errMsg = error.response?.status === 401
            ? 'OpenAI 金鑰無效，已切換為一般說明回覆。'
            : '服務暫時不可用，已切換為一般說明回覆。';
        const context = extractSiteContext();
        const fallback =
            (context && `根據本站資訊：\n${context}\n\n${errMsg}`) ||
            `${errMsg}`;
        res.json({ success: true, reply: fallback });
    }
});

// 健康檢查與金鑰狀態端點（協助部署確認）
app.get('/api/public-chat/status', (req, res) => {
    res.json({
        success: true,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        model: process.env.PUBLIC_CHAT_MODEL || 'gpt-4o-mini'
    });
});

// 獲取對話歷史 API 端點
app.get('/api/conversations', authenticateJWT, (req, res) => {
    try {
        loadDatabase();
        const conversations = database.chat_history || [];
        
        // 為每個對話添加統計資訊
        const conversationsWithStats = conversations.map(conv => ({
            ...conv,
            messageCount: conv.messages ? conv.messages.length : 0,
            lastMessage: conv.messages && conv.messages.length > 0 
                ? conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...'
                : '無訊息'
        }));

        res.json({
            success: true,
            conversations: conversationsWithStats
        });
    } catch (error) {
        console.error('獲取對話歷史錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取對話歷史失敗'
        });
    }
});

// 獲取特定對話的詳細訊息
app.get('/api/conversations/:conversationId', authenticateJWT, (req, res) => {
    try {
        const { conversationId } = req.params;
        loadDatabase();
        
        const conversation = database.chat_history.find(conv => conv.id === conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: '對話不存在'
            });
        }

        res.json({
            success: true,
            conversation: conversation
        });
    } catch (error) {
        console.error('獲取對話詳情錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取對話詳情失敗'
        });
    }
});

// 刪除對話
app.delete('/api/conversations/:conversationId', authenticateJWT, (req, res) => {
    try {
        const { conversationId } = req.params;
        loadDatabase();
        
        const conversationIndex = database.chat_history.findIndex(conv => conv.id === conversationId);
        
        if (conversationIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '對話不存在'
            });
        }

        database.chat_history.splice(conversationIndex, 1);
        saveDatabase();

        res.json({
            success: true,
            message: '對話已成功刪除'
        });
    } catch (error) {
        console.error('刪除對話錯誤:', error);
        res.status(500).json({
            success: false,
            error: '刪除對話失敗'
        });
    }
});

// LINE 配置 API
app.get('/api/line-config', authenticateJWT, (req, res) => {
    try {
        loadDatabase();
        const user = database.staff_accounts.find(staff => staff.id === req.staff.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: '用戶不存在'
            });
        }

        res.json({
            success: true,
            line_config: user.line_config || {
                channel_access_token: '',
                channel_secret: '',
                webhook_url: '',
                enabled: false
            }
        });
    } catch (error) {
        console.error('獲取 LINE 配置錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取 LINE 配置失敗'
        });
    }
});

// 更新 LINE 配置 API
app.post('/api/line-config', authenticateJWT, (req, res) => {
    try {
        const { channel_access_token, channel_secret, webhook_url, enabled } = req.body;
        loadDatabase();
        
        const userIndex = database.staff_accounts.findIndex(staff => staff.id === req.staff.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '用戶不存在'
            });
        }

        // 更新 LINE 配置
        database.staff_accounts[userIndex].line_config = {
            channel_access_token: channel_access_token || '',
            channel_secret: channel_secret || '',
            webhook_url: webhook_url || '',
            enabled: enabled || false
        };

        saveDatabase();

        console.log('✅ LINE 配置更新成功:', req.staff.username);

        res.json({
            success: true,
            message: 'LINE 配置更新成功'
        });
    } catch (error) {
        console.error('更新 LINE 配置錯誤:', error);
        res.status(500).json({
            success: false,
            error: '更新 LINE 配置失敗'
        });
    }
});

// LINE Webhook 端點
app.post('/api/webhook/line/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        loadDatabase();
        
        const user = database.staff_accounts.find(staff => staff.id == userId);
        
        if (!user || !user.line_config || !user.line_config.enabled) {
            return res.status(404).json({
                success: false,
                error: '用戶或 LINE 配置不存在'
            });
        }

        const { channel_access_token, channel_secret } = user.line_config;
        
        if (!channel_access_token || !channel_secret) {
            return res.status(400).json({
                success: false,
                error: 'LINE 配置不完整'
            });
        }

        // 建立 LINE 客戶端
        const lineClient = new Client({
            channelAccessToken: channel_access_token,
            channelSecret: channel_secret
        });

        // 處理 LINE 事件
        const events = req.body.events;
        
        Promise.all(events.map(async (event) => {
            if (event.type === 'message' && event.message.type === 'text') {
                const userMessage = event.message.text;
                
                // 調用 AI 聊天 API
                try {
                    const aiResponse = await axios.post(`${req.protocol}://${req.get('host')}/api/chat`, {
                        message: userMessage,
                        conversationId: `line_${event.source.userId}_${Date.now()}`
                    }, {
                        headers: {
                            'Authorization': `Bearer ${req.headers.authorization}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (aiResponse.data.success) {
                        // 回覆 LINE 用戶
                        await lineClient.replyMessage(event.replyToken, {
                            type: 'text',
                            text: aiResponse.data.reply
                        });
                    }
                } catch (error) {
                    console.error('LINE AI 回應錯誤:', error);
                    // 回覆預設訊息
                    await lineClient.replyMessage(event.replyToken, {
                        type: 'text',
                        text: '抱歉，我現在無法回應，請稍後再試。'
                    });
                }
            }
        }));

        res.json({ success: true });
    } catch (error) {
        console.error('LINE Webhook 錯誤:', error);
        res.status(500).json({
            success: false,
            error: 'LINE Webhook 處理失敗'
        });
    }
});

// 統計數據 API
app.get('/api/stats', authenticateJWT, async (req, res) => {
    try {
        // 計算真實的統計數據
        const totalUsers = database.user_questions.length;
        const totalMessages = database.chat_history.length;
        const knowledgeItems = database.knowledge.length;
        
        // 計算平均回應時間（基於最近的對話）
        let avgResponseTime = 2.3; // 預設值
        if (database.chat_history.length > 0) {
            const recentMessages = database.chat_history.slice(-100); // 最近100條訊息
            const responseTimes = recentMessages
                .filter(msg => msg.responseTime)
                .map(msg => msg.responseTime);
            
            if (responseTimes.length > 0) {
                avgResponseTime = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1);
            }
        }
        
        // 計算用戶活躍度（最近7天）
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentUsers = database.user_questions.filter(user => {
            const userDate = new Date(user.created_at || user.timestamp || now);
            return userDate >= sevenDaysAgo;
        }).length;
        
        // 計算知識庫使用統計
        const knowledgeUsage = database.knowledge.reduce((acc, item) => {
            acc.totalItems++;
            if (item.usage_count) acc.totalUsage += item.usage_count;
            return acc;
        }, { totalItems: 0, totalUsage: 0 });
        
        const stats = {
            success: true,
            data: {
                totalUsers: totalUsers,
                totalMessages: totalMessages,
                knowledgeItems: knowledgeItems,
                avgResponseTime: avgResponseTime + 's',
                recentUsers: recentUsers,
                knowledgeUsage: knowledgeUsage.totalUsage,
                lastUpdated: new Date().toISOString()
            }
        };
        
        res.json(stats);
    } catch (error) {
        console.error('獲取統計數據錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取統計數據失敗'
        });
    }
});

// 用戶活躍度趨勢 API
app.get('/api/stats/activity', authenticateJWT, async (req, res) => {
    try {
        const now = new Date();
        const days = [];
        const activityData = [];
        
        // 生成最近7天的數據
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('zh-TW', { weekday: 'short' });
            days.push(dateStr);
            
            // 計算當天的活躍用戶數
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            
            const dayUsers = database.user_questions.filter(user => {
                const userDate = new Date(user.created_at || user.timestamp || now);
                return userDate >= dayStart && userDate < dayEnd;
            }).length;
            
            activityData.push(dayUsers);
        }
        
        res.json({
            success: true,
            data: {
                labels: days,
                datasets: [{
                    label: '活躍用戶',
                    data: activityData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    } catch (error) {
        console.error('獲取活躍度數據錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取活躍度數據失敗'
        });
    }
});

// 最近活動 API
app.get('/api/stats/recent-activity', authenticateJWT, async (req, res) => {
    try {
        const now = new Date();
        const activities = [];
        
        // 從各種數據源生成活動
        const recentUsers = database.user_questions.slice(-5);
        const recentMessages = database.chat_history.slice(-5);
        const recentKnowledge = database.knowledge.slice(-5);
        
        // 用戶註冊活動
        recentUsers.forEach(user => {
            activities.push({
                type: 'user_register',
                icon: 'fas fa-user-plus',
                color: 'bg-success',
                text: `新用戶註冊: ${user.username || '匿名用戶'}`,
                time: formatTimeAgo(new Date(user.created_at || user.timestamp || now))
            });
        });
        
        // 訊息活動
        recentMessages.forEach(msg => {
            activities.push({
                type: 'message',
                icon: 'fas fa-comment',
                color: 'bg-primary',
                text: `新訊息: ${msg.content ? msg.content.substring(0, 30) + '...' : '訊息內容'}`,
                time: formatTimeAgo(new Date(msg.timestamp || now))
            });
        });
        
        // 知識庫活動
        recentKnowledge.forEach(item => {
            activities.push({
                type: 'knowledge',
                icon: 'fas fa-brain',
                color: 'bg-warning',
                text: `知識庫更新: ${item.question ? item.question.substring(0, 30) + '...' : '知識項目'}`,
                time: formatTimeAgo(new Date(item.created_at || now))
            });
        });
        
        // 按時間排序並取前10個
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        res.json({
            success: true,
            data: activities.slice(0, 10)
        });
    } catch (error) {
        console.error('獲取最近活動錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取最近活動失敗'
        });
    }
});

// 格式化時間為相對時間
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-TW');
}

// 帳號管理 API 端點

// 獲取所有帳號 (需要管理員權限)
app.get('/api/accounts', authenticateJWT, checkRole(['admin']), (req, res) => {
    try {
        const accounts = database.staff_accounts.map(account => ({
            id: account.id,
            username: account.username,
            name: account.name,
            role: account.role,
            email: account.email,
            created_at: account.created_at,
            updated_at: account.updated_at
        }));

        res.json({
            success: true,
            accounts: accounts,
            total: accounts.length
        });
    } catch (error) {
        console.error('獲取帳號列表錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取帳號列表失敗'
        });
    }
});

// 創建新帳號 (需要管理員權限)
app.post('/api/accounts', authenticateJWT, checkRole(['admin']), async (req, res) => {
    try {
        const { username, password, name, role, email } = req.body;

        // 驗證必填欄位
        if (!username || !password || !name) {
            return res.status(400).json({
                success: false,
                error: '請填寫所有必填欄位'
            });
        }

        // 檢查用戶名是否已存在
        const existingUser = database.staff_accounts.find(staff => staff.username === username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: '用戶名已存在'
            });
        }

        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);

        // 創建新帳號
        const newAccount = {
            id: Math.max(...database.staff_accounts.map(a => a.id), 0) + 1,
            username: username,
            password: hashedPassword,
            name: name,
            role: role || 'staff',
            email: email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        database.staff_accounts.push(newAccount);
        saveDatabase();

        res.json({
            success: true,
            message: '帳號創建成功',
            account: {
                id: newAccount.id,
                username: newAccount.username,
                name: newAccount.name,
                role: newAccount.role,
                email: newAccount.email,
                created_at: newAccount.created_at
            }
        });
    } catch (error) {
        console.error('創建帳號錯誤:', error);
        res.status(500).json({
            success: false,
            error: '創建帳號失敗'
        });
    }
});

// 更新帳號 (需要管理員權限)
app.put('/api/accounts/:id', authenticateJWT, checkRole(['admin']), async (req, res) => {
    try {
        const accountId = parseInt(req.params.id);
        const { username, password, name, role, email } = req.body;

        const accountIndex = database.staff_accounts.findIndex(a => a.id === accountId);
        if (accountIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '帳號不存在'
            });
        }

        const account = database.staff_accounts[accountIndex];

        // 檢查用戶名是否已被其他帳號使用
        const existingUser = database.staff_accounts.find(staff => 
            staff.username === username && staff.id !== accountId
        );
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: '用戶名已存在'
            });
        }

        // 更新帳號資訊
        account.username = username || account.username;
        account.name = name || account.name;
        account.role = role || account.role;
        account.email = email || account.email;
        account.updated_at = new Date().toISOString();

        // 如果提供了新密碼，則更新密碼
        if (password) {
            account.password = await bcrypt.hash(password, 10);
        }

        database.staff_accounts[accountIndex] = account;
        saveDatabase();

        res.json({
            success: true,
            message: '帳號更新成功',
            account: {
                id: account.id,
                username: account.username,
                name: account.name,
                role: account.role,
                email: account.email,
                updated_at: account.updated_at
            }
        });
    } catch (error) {
        console.error('更新帳號錯誤:', error);
        res.status(500).json({
            success: false,
            error: '更新帳號失敗'
        });
    }
});

// 刪除帳號 (需要管理員權限)
app.delete('/api/accounts/:id', authenticateJWT, checkRole(['admin']), (req, res) => {
    try {
        const accountId = parseInt(req.params.id);

        const accountIndex = database.staff_accounts.findIndex(a => a.id === accountId);
        if (accountIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '帳號不存在'
            });
        }

        const account = database.staff_accounts[accountIndex];

        // 防止刪除自己的帳號
        if (account.id === req.staff.id) {
            return res.status(400).json({
                success: false,
                error: '不能刪除自己的帳號'
            });
        }

        database.staff_accounts.splice(accountIndex, 1);
        saveDatabase();

        res.json({
            success: true,
            message: '帳號刪除成功'
        });
    } catch (error) {
        console.error('刪除帳號錯誤:', error);
        res.status(500).json({
            success: false,
            error: '刪除帳號失敗'
        });
    }
});

// 獲取單個帳號 (需要管理員權限)
app.get('/api/accounts/:id', authenticateJWT, checkRole(['admin']), (req, res) => {
    try {
        const accountId = parseInt(req.params.id);

        const account = database.staff_accounts.find(a => a.id === accountId);
        if (!account) {
            return res.status(404).json({
                success: false,
                error: '帳號不存在'
            });
        }

        res.json({
            success: true,
            account: {
                id: account.id,
                username: account.username,
                name: account.name,
                role: account.role,
                email: account.email,
                created_at: account.created_at,
                updated_at: account.updated_at
            }
        });
    } catch (error) {
        console.error('獲取帳號錯誤:', error);
        res.status(500).json({
            success: false,
            error: '獲取帳號失敗'
        });
    }
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'EchoChat API 服務運行中',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        status: 'healthy'
    });
});

// 根路由 - 健康檢查
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'EchoChat API 服務運行中',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 錯誤處理中間件
const errorHandler = (err, req, res, next) => {
    console.error('❌ 伺服器錯誤:', err);
    res.status(500).json({
        success: false,
        error: '伺服器內部錯誤'
    });
};

// 啟動伺服器
const startServer = async () => {
    try {
        // 連接資料庫
        await connectDatabase();
        console.log('✅ 資料庫初始化完成');
        
        // 設置錯誤處理
        app.use(errorHandler);
        
        // 啟動伺服器
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log('🚀 HTTP server is running on port', PORT);
            console.log('📝 請在瀏覽器中訪問: http://localhost:' + PORT + '/login.html');
        });
        
    } catch (error) {
        console.error('❌ 啟動伺服器失敗:', error.message);
        process.exit(1);
    }
};

// 啟動應用
startServer(); 