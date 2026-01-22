@echo off
echo ========================================
echo EchoChat 系統監控腳本
echo ========================================
echo.

:: 設定顏色
color 0A

:: 檢查 PM2 是否安裝
pm2 --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ PM2 已安裝
) else (
    echo ✗ PM2 未安裝，請先執行 deploy-windows.bat
    pause
    exit /b 1
)

:: 檢查應用狀態
echo.
echo ========================================
echo 應用狀態檢查
echo ========================================
pm2 status

:: 檢查系統資源
echo.
echo ========================================
echo 系統資源使用情況
echo ========================================
echo CPU 使用率:
wmic cpu get loadpercentage /value | find "LoadPercentage"

echo.
echo 記憶體使用情況:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value

echo.
echo 磁碟空間:
wmic logicaldisk get size,freespace,caption /format:table

:: 檢查網路連線
echo.
echo ========================================
echo 網路連線檢查
echo ========================================
echo 本地 IP 地址:
ipconfig | findstr "IPv4"

echo.
echo 端口使用情況:
netstat -an | findstr ":3000"

:: 檢查日誌
echo.
echo ========================================
echo 最近應用日誌 (最後 10 行)
echo ========================================
pm2 logs echochat --lines 10

:: 檢查資料庫檔案
echo.
echo ========================================
echo 資料庫檔案檢查
echo ========================================
if exist "database.db" (
    echo ✓ 資料庫檔案存在
    for %%A in (database.db) do echo 檔案大小: %%~zA bytes
) else (
    echo ✗ 資料庫檔案不存在
)

if exist "backups" (
    echo ✓ 備份目錄存在
    dir backups /b | find /c /v "" >nul 2>&1
    if %errorLevel% == 0 (
        echo 備份檔案數量: 
        dir backups /b | find /c /v ""
    ) else (
        echo 備份目錄為空
    )
) else (
    echo ✗ 備份目錄不存在
)

:: 檢查上傳目錄
echo.
echo ========================================
echo 上傳目錄檢查
echo ========================================
if exist "uploads" (
    echo ✓ 上傳目錄存在
    dir uploads /b | find /c /v "" >nul 2>&1
    if %errorLevel% == 0 (
        echo 上傳檔案數量:
        dir uploads /b | find /c /v ""
    ) else (
        echo 上傳目錄為空
    )
) else (
    echo ✗ 上傳目錄不存在
)

:: 提供操作選項
echo.
echo ========================================
echo 操作選項
echo ========================================
echo 1. 重啟應用
echo 2. 查看完整日誌
echo 3. 執行資料庫備份
echo 4. 檢查更新
echo 5. 退出
echo.
set /p choice="請選擇操作 (1-5): "

if "%choice%"=="1" (
    echo 重啟應用...
    pm2 restart echochat
    echo ✓ 應用已重啟
    pause
    goto :eof
)

if "%choice%"=="2" (
    echo 顯示完整日誌...
    pm2 logs echochat
    pause
    goto :eof
)

if "%choice%"=="3" (
    echo 執行資料庫備份...
    npm run backup
    echo ✓ 備份完成
    pause
    goto :eof
)

if "%choice%"=="4" (
    echo 檢查程式碼更新...
    git fetch
    git status
    echo.
    echo 如需更新，請執行: git pull origin main
    pause
    goto :eof
)

if "%choice%"=="5" (
    echo 退出監控...
    exit /b 0
)

echo 無效選擇，請重新執行腳本
pause 