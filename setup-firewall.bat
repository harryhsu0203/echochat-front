@echo off
echo ========================================
echo Windows 防火牆設定腳本
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

echo 設定 Windows 防火牆規則...

:: 刪除舊的規則（如果存在）
netsh advfirewall firewall delete rule name="EchoChat HTTP" >nul 2>&1
netsh advfirewall firewall delete rule name="EchoChat HTTPS" >nul 2>&1
netsh advfirewall firewall delete rule name="EchoChat Node.js" >nul 2>&1

:: 新增 HTTP 規則 (端口 80)
netsh advfirewall firewall add rule name="EchoChat HTTP" dir=in action=allow protocol=TCP localport=80
if %errorLevel% == 0 (
    echo ✓ HTTP 規則 (端口 80) 新增成功
) else (
    echo ✗ HTTP 規則新增失敗
)

:: 新增 HTTPS 規則 (端口 443)
netsh advfirewall firewall add rule name="EchoChat HTTPS" dir=in action=allow protocol=TCP localport=443
if %errorLevel% == 0 (
    echo ✓ HTTPS 規則 (端口 443) 新增成功
) else (
    echo ✗ HTTPS 規則新增失敗
)

:: 新增應用程式規則 (Node.js)
netsh advfirewall firewall add rule name="EchoChat Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe"
if %errorLevel% == 0 (
    echo ✓ Node.js 應用程式規則新增成功
) else (
    echo ⚠ Node.js 應用程式規則新增失敗，可能需要手動設定
)

:: 新增端口 3000 規則
netsh advfirewall firewall add rule name="EchoChat Port 3000" dir=in action=allow protocol=TCP localport=3000
if %errorLevel% == 0 (
    echo ✓ 端口 3000 規則新增成功
) else (
    echo ✗ 端口 3000 規則新增失敗
)

echo.
echo ========================================
echo 防火牆設定完成！
echo ========================================
echo.
echo 已設定的規則:
echo - HTTP (端口 80)
echo - HTTPS (端口 443)
echo - Node.js 應用程式
echo - EchoChat (端口 3000)
echo.
echo 請記得:
echo 1. 設定路由器端口轉發
echo 2. 檢查外部網路連線
echo 3. 測試網站訪問
echo.
pause 