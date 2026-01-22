# 🚨 緊急CSP修復指南

## 問題描述
Render上的CSP設定仍然限制連接，導致前端無法連接到後端API。

## 立即解決方案

### 方法1：在Render控制台手動修復（推薦）

1. **前往Render控制台**
   - 訪問 https://render.com
   - 登入您的帳號
   - 找到 `echochat-api` 專案

2. **手動編輯server.js**
   - 點擊 "Environment" 標籤
   - 找到 `server.js` 文件
   - 點擊編輯按鈕

3. **修復CSP設定**
   - 找到第127行附近的helmet設定
   - 將以下代碼：
   ```javascript
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
   ```
   
   **改為：**
   ```javascript
   app.use(
     helmet({
       contentSecurityPolicy: false
     })
   );
   ```

4. **保存並重新部署**
   - 點擊保存按鈕
   - 等待自動重新部署
   - 或者點擊 "Manual Deploy"

### 方法2：使用本地測試

如果無法立即修復Render，可以使用本地測試：

1. **啟動本地API服務器**
   ```bash
   cd echochat-api
   npm install
   node server.js
   ```

2. **修改前端API配置**
   在 `public/js/api-config.js` 中，將生產環境改為本地：
   ```javascript
   production: 'http://localhost:3000/api',
   ```

3. **測試登入**
   - 訪問 http://localhost:8000/public/login.html
   - 使用帳號：`sunnyharry1`，密碼：`gele1227`

### 方法3：臨時禁用CSP（僅用於測試）

在Render控制台中，完全移除helmet中間件：

```javascript
// 註釋掉或移除這行
// app.use(helmet({...}));
```

## 驗證修復

修復完成後，檢查以下：

1. **檢查CSP設定**
   ```bash
   curl -I https://echochat-api.onrender.com/api/health | grep content-security-policy
   ```
   應該沒有 `connect-src 'self'` 限制

2. **測試登入**
   - 訪問登入頁面
   - 檢查瀏覽器控制台
   - 應該沒有CSP錯誤

3. **使用調試工具**
   - 訪問 http://localhost:8000/public/test-login-debug.html
   - 點擊測試按鈕

## 注意事項

- 這個修復是臨時的，僅用於解決CSP問題
- 在生產環境中，應該設定正確的CSP而不是完全禁用
- 修復完成後，請重新設定適當的CSP規則

## 聯繫支持

如果問題持續存在，請：
1. 檢查Render部署日誌
2. 確認環境變量設定
3. 重新部署整個專案 