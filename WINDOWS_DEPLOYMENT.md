# EchoChat Windows 11 伺服器部署指南

## 🖥️ 系統需求

### 硬體需求
- **CPU**: 雙核心以上
- **記憶體**: 最少 4GB RAM，建議 8GB
- **硬碟**: 最少 50GB 可用空間
- **網路**: 穩定的寬頻連線

### 軟體需求
- Windows 11 (最新版本)
- Node.js 18+ LTS
- Git
- PM2 (進程管理器)

## 📋 安裝步驟

### 1. 安裝 Node.js
1. 前往 https://nodejs.org/
2. 下載 LTS 版本
3. 執行安裝程式，使用預設設定
4. 驗證安裝：
```bash
node --version
npm --version
```

### 2. 安裝 Git
1. 前往 https://git-scm.com/
2. 下載並安裝 Git for Windows
3. 驗證安裝：
```bash
git --version
```

### 3. 安裝 PM2
```bash
npm install -g pm2
```

### 4. 下載專案
```bash
# 創建專案目錄
mkdir C:\EchoChat
cd C:\EchoChat

# 克隆專案
git clone https://github.com/IAN1215/kaichuan_line_bot_2.git .

# 安裝依賴
npm install
```

## 🔧 環境設定

### 1. 創建環境變數檔案
在專案根目錄創建 `.env` 檔案：
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-credentials.json
```

### 2. 設定資料庫
```bash
# 初始化資料庫
npm run init-db

# 創建管理員帳號
npm run init-admin
```

### 3. 創建必要的目錄
```bash
# 創建上傳目錄
mkdir uploads
mkdir backups
mkdir credentials
```

## 🚀 啟動伺服器

### 方法 1: 使用 PM2 (推薦)
```bash
# 啟動應用
pm2 start server.js --name "echochat"

# 設定開機自動啟動
pm2 startup
pm2 save

# 查看狀態
pm2 status
pm2 logs echochat
```

### 方法 2: 直接啟動
```bash
npm start
```

## 🌐 網路配置

### 1. 防火牆設定
1. 開啟 Windows Defender 防火牆
2. 點擊「進階設定」
3. 新增輸入規則：
   - 規則類型：端口
   - 協議：TCP
   - 端口：3000
   - 動作：允許連線
   - 套用至：所有網路

### 2. 路由器設定
1. 登入路由器管理介面
2. 找到「端口轉發」或「Port Forwarding」
3. 新增規則：
   - 外部端口：80, 443
   - 內部 IP：您的 Windows 11 IP
   - 內部端口：3000
   - 協議：TCP

### 3. 取得外部 IP
```bash
# 在命令提示字元中執行
ipconfig
```

## 🔒 SSL 憑證設定

### 使用 Let's Encrypt (免費)
1. 安裝 Certbot for Windows
2. 取得 SSL 憑證：
```bash
certbot certonly --standalone -d yourdomain.com
```

### 更新 server.js 支援 HTTPS
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/privkey.pem'),
  cert: fs.readFileSync('path/to/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

## 📊 監控和維護

### 1. 系統監控
```bash
# 查看 PM2 狀態
pm2 monit

# 查看系統資源
pm2 status

# 查看日誌
pm2 logs echochat --lines 100
```

### 2. 自動備份
創建備份腳本 `backup.bat`：
```batch
@echo off
cd /d C:\EchoChat
npm run backup
echo Backup completed at %date% %time%
```

### 3. 設定工作排程器
1. 開啟「工作排程器」
2. 創建基本工作
3. 設定每日執行備份腳本

## 🔧 故障排除

### 常見問題

#### 1. 端口被占用
```bash
# 查看端口使用情況
netstat -ano | findstr :3000

# 終止佔用端口的程序
taskkill /PID [PID] /F
```

#### 2. 權限問題
- 以系統管理員身份執行命令提示字元
- 檢查檔案權限

#### 3. 防火牆阻擋
- 檢查 Windows Defender 防火牆設定
- 確保 Node.js 已加入防火牆例外清單

#### 4. 網路連線問題
```bash
# 測試本地連線
curl http://localhost:3000

# 測試外部連線
curl http://your-external-ip:3000
```

## 📈 效能優化

### 1. 記憶體優化
```bash
# 設定 Node.js 記憶體限制
pm2 start server.js --name "echochat" --max-memory-restart 1G
```

### 2. 日誌輪轉
```bash
# 設定 PM2 日誌輪轉
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. 自動重啟
```bash
# 設定自動重啟策略
pm2 start server.js --name "echochat" --restart-delay 3000
```

## 🔄 更新部署

### 1. 更新程式碼
```bash
# 拉取最新程式碼
git pull origin main

# 安裝新依賴
npm install

# 重啟應用
pm2 restart echochat
```

### 2. 資料庫遷移
```bash
# 備份現有資料庫
npm run backup

# 執行資料庫更新
npm run init-db
```

## 📞 支援和維護

### 日常維護檢查清單
- [ ] 檢查系統更新
- [ ] 檢查磁碟空間
- [ ] 檢查記憶體使用量
- [ ] 檢查網路連線
- [ ] 檢查應用日誌
- [ ] 執行資料庫備份

### 監控工具建議
- **系統監控**: Windows 工作管理員
- **網路監控**: Resource Monitor
- **應用監控**: PM2 Dashboard
- **日誌監控**: PM2 Logs

## 🎯 測試清單

部署完成後，請測試以下功能：
- [ ] 網站可以正常訪問
- [ ] 管理員登入功能正常
- [ ] 檔案上傳功能正常
- [ ] 資料庫操作正常
- [ ] SSL 憑證正常
- [ ] 外部網路可以訪問

## 📞 緊急聯絡

如果遇到問題：
1. 檢查 PM2 日誌：`pm2 logs echochat`
2. 檢查系統事件檢視器
3. 重新啟動服務：`pm2 restart echochat`
4. 重新啟動電腦（最後手段）

---

**注意**: 請確保您的 Windows 11 保持最新更新，並定期檢查安全性更新。 