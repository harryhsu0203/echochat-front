@echo off
echo ========================================
echo 修復 bcrypt 模組問題
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist "package.json" (
    echo ✗ 請在專案根目錄執行此腳本
    pause
    exit /b 1
)

echo 正在修復 bcrypt 模組問題...

:: 停止 PM2 進程（如果正在運行）
echo 停止現有進程...
pm2 stop echochat >nul 2>&1
pm2 delete echochat >nul 2>&1

:: 刪除 node_modules 和 package-lock.json
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

:: 特別重建 bcrypt
echo 重建 bcrypt 模組...
npm rebuild bcrypt
if %errorLevel% == 0 (
    echo ✓ bcrypt 重建成功
) else (
    echo ⚠ bcrypt 重建失敗，嘗試替代方案
)

:: 如果 bcrypt 仍有問題，嘗試使用 bcryptjs
echo 檢查是否需要使用 bcryptjs 替代...
npm list bcrypt >nul 2>&1
if %errorLevel% != 0 (
    echo 安裝 bcryptjs 作為替代...
    npm uninstall bcrypt
    npm install bcryptjs
    echo ✓ 已安裝 bcryptjs
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
echo 應用狀態:
pm2 status
echo.
echo 如果問題仍然存在，請嘗試：
echo 1. 重新啟動電腦
echo 2. 檢查 Node.js 版本是否為 LTS
echo 3. 確保以管理員身份執行
echo.
pause 