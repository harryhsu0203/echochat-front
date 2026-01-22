@echo off
echo ========================================
echo    EchoChat 部署到 Render 雲端平台
echo ========================================
echo.

echo [1/5] 檢查 Git 狀態...
git status
echo.

echo [2/5] 添加所有更改...
git add .
echo.

echo [3/5] 提交更改...
git commit -m "更新 AI 聊天功能：修復資料庫問題、調整介面、新增多語言支援"
echo.

echo [4/5] 推送到 GitHub...
git push origin main
echo.

echo [5/5] 部署完成！
echo.
echo ✅ 您的更改已推送到 GitHub
echo 🔄 Render 將自動檢測更改並重新部署
echo 🌐 請等待 2-3 分鐘讓部署完成
echo.
echo 📝 部署檢查清單：
echo   1. 確認 GitHub 倉庫已更新
echo   2. 檢查 Render 控制台部署狀態
echo   3. 測試線上功能是否正常
echo.
pause 