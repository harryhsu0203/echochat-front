# EchoChat 新功能說明

## 概述

根據需求說明書，我們已經成功建置並部署了以下新功能：

1. **Gemini 系列功能**
2. **企業管理功能**
3. **系統設定功能**
4. **AI對話式機器人服務**

## 功能詳情

### 1. Gemini 系列功能

#### 主要特色
- 支援超過12種語言模型（GPT、Claude、Gemini等）
- 知識庫綁定功能
- 角色權限設定
- 第三方平台整合（Line Bot、Line OA等）
- 網頁嵌入功能
- LangGraph 整合 RAG
- 對話紀錄查詢
- 語音辨識STT與語音合成TTS功能
- 3D AVATAR人偶支援
- 啟用/停用控制

#### API端點
- `GET /api/gemini/ai-models/supported` - 獲取支援的語言模型
- `POST /api/gemini/knowledge/bind` - 知識庫綁定
- `GET /api/gemini/knowledge/bindings` - 獲取綁定關係
- `POST /api/gemini/roles` - 創建角色
- `GET /api/gemini/roles` - 獲取角色列表

#### 前端頁面
- `/gemini-features.html` - Gemini系列功能展示頁面

### 2. 企業管理功能

#### 主要特色
- 集中管理企業所有使用者帳號
- 根據職級或業務類型指派不同功能權限
- 用戶管理（新增、編輯、刪除）
- 部門管理
- 角色管理

#### API端點
- `GET /api/enterprise/users` - 獲取用戶列表
- `POST /api/enterprise/users` - 創建新用戶
- `PUT /api/enterprise/users/:id` - 更新用戶資訊
- `DELETE /api/enterprise/users/:id` - 刪除用戶
- `GET /api/enterprise/departments` - 獲取部門列表
- `GET /api/enterprise/roles` - 獲取角色列表

#### 前端頁面
- `/enterprise-management.html` - 企業管理頁面

### 3. 系統設定功能

#### 主要特色
- 角色管理（角色管理/公司設定）
- 公司設定（自訂公司名稱與Logo）
- 功能開關控制
- 系統統計

#### API端點
- `GET /api/system/settings` - 獲取系統設定
- `POST /api/system/company` - 更新公司設定
- `POST /api/system/roles` - 創建角色
- `GET /api/system/features` - 獲取功能開關狀態
- `POST /api/system/features` - 更新功能開關
- `GET /api/system/stats` - 獲取系統統計

### 4. AI對話式機器人服務

#### 主要特色
- 授權機器人管理
- 多模態輸入支援（文字、語音、文件、圖片、URL）
- 多語言回應支援
- 對話歷史記錄
- 統計數據（綜合分析/公司用量）
- 知識庫管理
- 機器人管理

#### API端點
- `GET /api/ai-chatbot/robots` - 獲取機器人列表
- `POST /api/ai-chatbot/robots` - 創建新機器人
- `POST /api/ai-chatbot/chat/multimodal` - 多模態聊天
- `GET /api/ai-chatbot/conversations` - 獲取對話歷史
- `GET /api/ai-chatbot/conversations/:id` - 獲取對話詳情
- `GET /api/ai-chatbot/stats/comprehensive` - 統計數據
- `GET /api/ai-chatbot/knowledge` - 獲取知識庫
- `POST /api/ai-chatbot/knowledge` - 新增知識庫項目

## 部署資訊

### 前端部署
- URL: https://echochat-frontend.onrender.com
- 新功能頁面：
  - https://echochat-frontend.onrender.com/gemini-features.html
  - https://echochat-frontend.onrender.com/enterprise-management.html

### 後端部署
- URL: https://echochat-api.onrender.com
- API基礎路徑: `/api`

## 使用方式

### 1. 訪問新功能頁面

```bash
# Gemini系列功能
https://echochat-frontend.onrender.com/gemini-features.html

# 企業管理
https://echochat-frontend.onrender.com/enterprise-management.html
```

### 2. 測試API端點

```bash
# 測試Gemini功能
curl https://echochat-api.onrender.com/api/gemini/ai-models/supported

# 測試企業管理
curl https://echochat-api.onrender.com/api/enterprise/users

# 測試系統設定
curl https://echochat-api.onrender.com/api/system/settings

# 測試AI聊天機器人
curl https://echochat-api.onrender.com/api/ai-chatbot/robots
```

### 3. 部署新功能

```bash
# 檢查文件
node deploy-new-features.js check

# 部署到Render
node deploy-new-features.js deploy

# 測試新功能
node deploy-new-features.js test
```

## 技術架構

### 後端技術棧
- Node.js + Express
- JSON檔案儲存（可擴展到資料庫）
- JWT身份驗證
- CORS支援
- 模組化架構

### 前端技術棧
- HTML5 + CSS3 + JavaScript
- Bootstrap 5
- Font Awesome圖示
- 響應式設計

### 新功能模組
- `gemini-features.js` - Gemini系列功能
- `enterprise-management.js` - 企業管理功能
- `system-settings.js` - 系統設定功能
- `ai-chatbot-service.js` - AI對話式機器人服務

## 注意事項

1. **身份驗證**：所有API端點都需要JWT身份驗證
2. **CORS設定**：已配置允許前端網站訪問
3. **錯誤處理**：所有API都包含完整的錯誤處理
4. **資料持久化**：目前使用JSON檔案，可根據需要擴展到資料庫
5. **安全性**：包含輸入驗證和權限控制

## 未來擴展

1. **資料庫整合**：可整合MongoDB或PostgreSQL
2. **即時通訊**：可整合WebSocket支援即時對話
3. **檔案上傳**：可擴展支援更多檔案格式
4. **多租戶**：可支援多租戶架構
5. **監控日誌**：可整合監控和日誌系統

## 聯絡資訊

如有任何問題或建議，請聯絡開發團隊。 