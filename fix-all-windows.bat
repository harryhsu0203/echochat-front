@echo off
echo ========================================
echo Windows 相容性完整修復腳本
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist "package.json" (
    echo ✗ 請在專案根目錄執行此腳本
    pause
    exit /b 1
)

echo 正在修復 Windows 相容性問題...

:: 停止現有進程
echo 停止現有進程...
pm2 stop echochat >nul 2>&1
pm2 delete echochat >nul 2>&1

:: 執行 JavaScript 修復腳本
echo 修復 bcrypt 引用...
node fix-bcrypt-imports.js

:: 備份原始 package.json
echo 備份原始 package.json...
copy package.json package.json.backup

:: 替換為 Windows 優化版本
echo 替換為 Windows 優化版本...
copy package-windows.json package.json

:: 清理舊的依賴
echo 清理舊的依賴...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo ✓ 已刪除 node_modules
)

if exist "package-lock.json" (
    del package-lock.json
    echo ✓ 已刪除 package-lock.json
)

:: 清理 npm 快取
echo 清理 npm 快取...
npm cache clean --force
echo ✓ npm 快取已清理

:: 重新安裝依賴
echo 重新安裝依賴...
npm install
if %errorLevel% == 0 (
    echo ✓ 依賴安裝成功
) else (
    echo ✗ 依賴安裝失敗
    pause
    exit /b 1
)

:: 初始化資料庫
echo 初始化資料庫...
npm run init-db
if %errorLevel% == 0 (
    echo ✓ 資料庫初始化成功
) else (
    echo ⚠ 資料庫初始化失敗，可能需要手動執行
)

:: 創建管理員帳號
echo 創建管理員帳號...
npm run init-admin
if %errorLevel% == 0 (
    echo ✓ 管理員帳號創建成功
) else (
    echo ⚠ 管理員帳號創建失敗，可能需要手動執行
)

:: 重新啟動應用
echo 重新啟動應用...
pm2 start server.js --name "echochat"
if %errorLevel% == 0 (
    echo ✓ 應用啟動成功
) else (
    echo ✗ 應用啟動失敗
    pause
    exit /b 1
)

:: 設定開機自動啟動
echo 設定開機自動啟動...
pm2 startup
pm2 save

echo.
echo ========================================
echo 修復完成！
echo ========================================
echo.
echo 主要變更：
echo - 將 bcrypt 替換為 bcryptjs (純 JavaScript 實現)
echo - 修復了所有檔案中的 bcrypt 引用
echo - 重新安裝了所有依賴
echo.
echo 應用狀態:
pm2 status
echo.
echo 測試資訊：
echo - 本地訪問: http://localhost:3000
echo - 管理員帳號: admin
echo - 管理員密碼: admin123
echo.
echo 如果仍有問題，請：
echo 1. 重新啟動電腦
echo 2. 檢查 Node.js 版本 (建議 18+ LTS)
echo 3. 確保以管理員身份執行
echo.
pause 