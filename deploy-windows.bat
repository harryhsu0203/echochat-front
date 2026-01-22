@echo off
echo ========================================
echo EchoChat Windows 11 自動部署腳本
echo ========================================
echo.

:: 檢查是否以管理員身份執行
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ 管理員權限確認
) else (
    echo ✗ 請以管理員身份執行此腳本
    pause
    exit /b 1
)

:: 檢查 Node.js 是否已安裝
echo 檢查 Node.js 安裝...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Node.js 已安裝
    node --version
) else (
    echo ✗ Node.js 未安裝，請先安裝 Node.js
    echo 下載地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 檢查 Git 是否已安裝
echo 檢查 Git 安裝...
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Git 已安裝
    git --version
) else (
    echo ✗ Git 未安裝，請先安裝 Git
    echo 下載地址: https://git-scm.com/
    pause
    exit /b 1
)

:: 創建專案目錄
echo.
echo 創建專案目錄...
if not exist "C:\EchoChat" (
    mkdir "C:\EchoChat"
    echo ✓ 創建目錄 C:\EchoChat
) else (
    echo ✓ 目錄 C:\EchoChat 已存在
)

:: 切換到專案目錄
cd /d "C:\EchoChat"

:: 檢查是否已克隆專案
if exist ".git" (
    echo ✓ 專案已存在，更新程式碼...
    git pull origin main
) else (
    echo 克隆專案...
    git clone https://github.com/IAN1215/kaichuan_line_bot_2.git .
    if %errorLevel% == 0 (
        echo ✓ 專案克隆成功
    ) else (
        echo ✗ 專案克隆失敗
        pause
        exit /b 1
    )
)

:: 安裝依賴
echo.
echo 安裝 Node.js 依賴...
npm install
if %errorLevel% == 0 (
    echo ✓ 依賴安裝成功
) else (
    echo ✗ 依賴安裝失敗
    pause
    exit /b 1
)

:: 安裝 PM2
echo.
echo 安裝 PM2 進程管理器...
npm install -g pm2
if %errorLevel% == 0 (
    echo ✓ PM2 安裝成功
) else (
    echo ✗ PM2 安裝失敗
    pause
    exit /b 1
)

:: 創建必要的目錄
echo.
echo 創建必要目錄...
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "credentials" mkdir credentials
echo ✓ 目錄創建完成

:: 創建環境變數檔案
echo.
echo 創建環境變數檔案...
if not exist ".env" (
    echo NODE_ENV=production > .env
    echo JWT_SECRET=your-super-secret-jwt-key-here >> .env
    echo PORT=3000 >> .env
    echo GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-credentials.json >> .env
    echo ✓ .env 檔案創建完成
) else (
    echo ✓ .env 檔案已存在
)

:: 初始化資料庫
echo.
echo 初始化資料庫...
npm run init-db
if %errorLevel% == 0 (
    echo ✓ 資料庫初始化成功
) else (
    echo ⚠ 資料庫初始化失敗，可能需要手動執行
)

:: 創建管理員帳號
echo.
echo 創建管理員帳號...
npm run init-admin
if %errorLevel% == 0 (
    echo ✓ 管理員帳號創建成功
) else (
    echo ⚠ 管理員帳號創建失敗，可能需要手動執行
)

:: 啟動應用
echo.
echo 啟動 EchoChat 應用...
pm2 start server.js --name "echochat"
if %errorLevel% == 0 (
    echo ✓ 應用啟動成功
) else (
    echo ✗ 應用啟動失敗
    pause
    exit /b 1
)

:: 設定開機自動啟動
echo.
echo 設定開機自動啟動...
pm2 startup
pm2 save
if %errorLevel% == 0 (
    echo ✓ 開機自動啟動設定成功
) else (
    echo ⚠ 開機自動啟動設定失敗
)

:: 顯示狀態
echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 應用狀態:
pm2 status
echo.
echo 應用日誌:
pm2 logs echochat --lines 5
echo.
echo 本地訪問地址: http://localhost:3000
echo 管理員帳號: admin
echo 管理員密碼: admin123
echo.
echo 常用命令:
echo - 查看狀態: pm2 status
echo - 查看日誌: pm2 logs echochat
echo - 重啟應用: pm2 restart echochat
echo - 停止應用: pm2 stop echochat
echo.
echo 請記得:
echo 1. 設定防火牆規則
echo 2. 設定路由器端口轉發
echo 3. 申請 SSL 憑證
echo 4. 定期備份資料庫
echo.
pause 