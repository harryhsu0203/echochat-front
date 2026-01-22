const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// 中間件
app.use(cors());
app.use(express.json());

console.log('🚀 啟動代理服務器...');

// 代理健康檢查
app.post('/api/proxy/health', async (req, res) => {
    try {
        const { url } = req.body;
        console.log('🔍 代理健康檢查:', url);
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('❌ 代理健康檢查失敗:', error.message);
        res.status(500).json({ error: '代理請求失敗' });
    }
});

// 通用代理
app.post('/api/proxy', async (req, res) => {
    try {
        const { url, method = 'GET', headers = {}, body } = req.body;
        console.log('🔍 代理請求:', { url, method });
        
        const config = {
            method: method.toLowerCase(),
            url: url,
            headers: headers,
            data: body
        };
        
        const response = await axios(config);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('❌ 代理請求失敗:', error.message);
        res.status(500).json({ error: '代理請求失敗' });
    }
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`✅ 代理服務器運行在 http://localhost:${PORT}`);
    console.log('📝 使用方式:');
    console.log('1. 前端會自動嘗試直接連接');
    console.log('2. 如果直接連接失敗，會使用代理');
    console.log('3. 代理會繞過CSP限制');
});

// 錯誤處理
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未處理的Promise拒絕:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ 未捕獲的異常:', error);
}); 