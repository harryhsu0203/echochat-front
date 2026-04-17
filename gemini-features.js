// Gemini 系列功能模組
const express = require('express');
const router = express.Router();

// 支援的語言模型
const SUPPORTED_MODELS = {
    'gpt-5.3': {
        name: 'GPT-5.3',
        provider: 'OpenAI',
        description: '專案統一使用之對話模型',
        features: ['高準確度', '自然語氣', '多語言支援'],
        pricing: '依用量計費',
        speed: '快速',
        max_tokens: 128000
    }
};

// 獲取支援的語言模型列表
router.get('/ai-models/supported', (req, res) => {
    res.json({
        success: true,
        models: SUPPORTED_MODELS
    });
});

// 知識庫綁定功能
router.post('/knowledge/bind', (req, res) => {
    const { knowledgeIds, assistantId } = req.body;
    
    if (!knowledgeIds || !Array.isArray(knowledgeIds)) {
        return res.status(400).json({
            success: false,
            error: '請提供有效的知識庫ID列表'
        });
    }

    // 這裡應該連接到資料庫
    const binding = {
        id: `binding_${Date.now()}`,
        assistantId: assistantId || 'default',
        knowledgeIds: knowledgeIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '知識庫綁定成功',
        binding: binding
    });
});

// 角色權限設定
router.post('/roles', (req, res) => {
    const { name, permissions, description } = req.body;
    
    if (!name || !permissions) {
        return res.status(400).json({
            success: false,
            error: '請提供角色名稱和權限'
        });
    }

    const role = {
        id: `role_${Date.now()}`,
        name: name.trim(),
        permissions: permissions,
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '角色創建成功',
        role: role
    });
});

module.exports = router; 