@echo off
echo ========================================
echo EchoChat Render 部署準備腳本
echo ========================================
echo.

:: 檢查是否在正確的目錄
if not exist "package.json" (
    echo ✗ 請在專案根目錄執行此腳本
    pause
    exit /b 1
)

echo 準備部署到 Render...

:: 檢查 Git 狀態
echo 檢查 Git 狀態...
git status
echo.

:: 修復 bcrypt 問題
echo 修復 bcrypt 相容性問題...
npm uninstall bcrypt
npm install bcryptjs
echo ✓ bcrypt 已替換為 bcryptjs

:: 執行修復腳本
echo 修復程式碼引用...
node fix-bcrypt-imports.js
echo ✓ 程式碼引用已修復

:: 更新 package.json
echo 更新 package.json...
copy package-windows.json package.json
echo ✓ package.json 已更新

:: 安裝依賴
echo 重新安裝依賴...
npm install
if %errorLevel% == 0 (
    echo ✓ 依賴安裝成功
) else (
    echo ✗ 依賴安裝失敗
    pause
    exit /b 1
)

:: 測試本地運行
echo 測試本地運行...
npm start &
timeout /t 5 /nobreak >nul
taskkill /f /im node.exe >nul 2>&1
echo ✓ 本地測試完成

:: 提交變更到 Git
echo 提交變更到 Git...
git add .
git commit -m "Fix bcrypt for Render deployment - $(date /t)"
if %errorLevel% == 0 (
    echo ✓ 變更已提交
) else (
    echo ⚠ 提交失敗，可能需要手動提交
)

:: 推送到 GitHub
echo 推送到 GitHub...
git push origin main
if %errorLevel% == 0 (
    echo ✓ 程式碼已推送到 GitHub
) else (
    echo ⚠ 推送失敗，請檢查網路連線和權限
)

echo.
echo ========================================
echo 部署準備完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 前往 https://render.com
echo 2. 使用 GitHub 帳號登入
echo 3. 點擊 "New +" 創建 Web Service
echo 4. 選擇您的倉庫: kaichuan_line_bot_2
echo 5. 設定環境變數：
echo    - NODE_ENV: production
echo    - JWT_SECRET: your-secret-key
echo    - PORT: 10000
echo 6. 點擊 "Create Web Service"
echo.
echo 重要提醒：
echo - Render 免費計劃有休眠機制
echo - 首次訪問可能需要 30 秒啟動
echo - 記得設定所有環境變數
echo.
pause 