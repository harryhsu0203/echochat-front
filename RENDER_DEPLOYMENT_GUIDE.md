
# 🚀 EchoChat Render 部署指南

## 後端部署 (echochat-api)

### 1. 準備後端代碼
```bash
# 確保在 echochat-api 目錄中有以下文件：
- package.json (包含依賴和啟動腳本)
- server.js (主服務器文件)
- render.yaml (Render 配置)
- .gitignore
- README.md
- env.example (環境變量示例)
```

### 2. 部署到 Render
1. 前往 https://render.com
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub 倉庫
4. 設定：
   - Name: echochat-backend
   - Root Directory: echochat-api
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Plan: Free

### 3. 環境變量設定
在 Render 控制台中設定以下環境變量：
- NODE_ENV: production
- JWT_SECRET: [自動生成]
- PORT: 10000
- DATA_DIR: /opt/render/project/src/data
- LINE_CHANNEL_ACCESS_TOKEN: [您的 Line Token]
- LINE_CHANNEL_SECRET: [您的 Line Secret]
- OPENAI_API_KEY: [您的 OpenAI Key]

### 4. Persistent Disk 與資料搬移
1. 在 Render 後端服務的 **Disks** 新增磁碟並設定 Mount Path 為 `/opt/render/project/src/data`
2. 第一次掛載後，進入 Shell 或部署指令，執行：
   ```bash
   cd echochat-api
   npm install
   npm run migrate:data           # 將 ./data 內的 database.json 複製到 DATA_DIR
   ```
3. 如果需要強制覆蓋（例如磁碟上是空檔案但允許備份），可加上 `--force`：
   ```bash
   npm run migrate:data -- --force
   ```
4. 之後的 redeploy 只要保持磁碟掛載即可，自動會讀寫到 Persistent Disk，LINE 頻道、客戶帳號等資料就不會遺失。

## 前端部署

### 選項 1: Vercel (推薦)
```bash
# 使用現有的 vercel.json 配置
npm install -g vercel
vercel --prod
```

### 選項 2: Render Static Site
1. 前往 https://render.com
2. 點擊 "New +" → "Static Site"
3. 連接您的 GitHub 倉庫
4. 設定：
   - Name: echochat-frontend
   - Root Directory: ./
   - Build Command: echo "Build completed"
   - Publish Directory: public

## 部署後檢查

### 1. 檢查後端 API
```bash
curl https://echochat-api.onrender.com/api/health
```

### 2. 檢查前端
訪問您的前端 URL 並測試登入功能

### 3. 測試登入
使用以下帳號測試：
- 用戶名: sunnyharry1
- 密碼: gele1227

## 故障排除

### 如果後端返回 404
1. 檢查 render.yaml 配置
2. 確認 server.js 正確啟動
3. 檢查環境變量設定

### 如果前端無法連接後端
1. 檢查 API 配置 (public/js/api-config.js)
2. 確認 CORS 設定正確
3. 檢查網路連接

### 如果登入失敗
1. 檢查資料庫初始化
2. 確認管理員帳號存在
3. 檢查 JWT_SECRET 設定
