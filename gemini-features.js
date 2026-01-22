// Gemini 系列功能模組
const express = require('express');
const router = express.Router();

// 支援的語言模型
const SUPPORTED_MODELS = {
    'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: '快速且經濟實惠的對話體驗',
        features: ['快速回應', '成本效益高', '支援多語言'],
        pricing: '經濟實惠',
        speed: '快速',
        max_tokens: 128000
    },
    'gpt-4o': {
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: '高級版本，提供更強大的理解和生成能力',
        features: ['高品質回應', '複雜任務處理', '創意內容生成'],
        pricing: '中等',
        speed: '中等',
        max_tokens: 128000
    },
    'claude-3-haiku': {
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        description: '快速且經濟的Claude模型',
        features: ['快速回應', '成本效益高', '安全性高'],
        pricing: '經濟實惠',
        speed: '快速',
        max_tokens: 200000
    },
    'gemini-pro': {
        name: 'Gemini Pro',
        provider: 'Google',
        description: 'Google的通用AI模型',
        features: ['多模態支援', '創意能力強', '程式碼生成'],
        pricing: '經濟實惠',
        speed: '快速',
        max_tokens: 32768
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