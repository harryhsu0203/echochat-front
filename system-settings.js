// 系統設定功能模組
const express = require('express');
const router = express.Router();

// 獲取系統設定
router.get('/settings', (req, res) => {
    const settings = {
        company: {
            name: 'EchoChat',
            logo: '/images/logo.png',
            description: '智能客服系統',
            contact_info: {
                email: 'support@echochat.com',
                phone: '+886-2-1234-5678',
                address: '台北市信義區信義路五段7號'
            }
        },
        roles: [
            {
                id: 'role_1',
                name: '客服專員',
                permissions: ['chat', 'knowledge', 'conversations'],
                description: '處理客戶對話和知識庫管理'
            },
            {
                id: 'role_2',
                name: '客服主管',
                permissions: ['chat', 'knowledge', 'conversations', 'users', 'reports'],
                description: '管理客服團隊和查看報表'
            },
            {
                id: 'role_3',
                name: '系統管理員',
                permissions: ['chat', 'knowledge', 'conversations', 'users', 'reports', 'settings'],
                description: '系統設定和用戶管理'
            }
        ],
        features: {
            ai_models: ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'gemini-pro'],
            knowledge_base: true,
            multi_modal: true,
            voice_recognition: true,
            voice_synthesis: true,
            avatar_3d: true,
            line_integration: true,
            web_embedding: true
        }
    };

    res.json({
        success: true,
        settings: settings
    });
});

// 更新公司設定
router.post('/company', (req, res) => {
    const { name, logo, description, contact_info } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            error: '請提供公司名稱'
        });
    }

    const companySettings = {
        name: name.trim(),
        logo: logo || '',
        description: description || '',
        contact_info: contact_info || {},
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '公司設定更新成功',
        settings: companySettings
    });
});

// 更新角色設定
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

// 獲取功能開關狀態
router.get('/features', (req, res) => {
    const features = {
        ai_models: {
            enabled: true,
            supported: ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'gemini-pro'],
            default: 'gpt-4o-mini'
        },
        knowledge_base: {
            enabled: true,
            max_files: 5000,
            max_tokens: 5000000
        },
        multi_modal: {
            enabled: true,
            supported_types: ['text', 'image', 'file', 'url']
        },
        voice_recognition: {
            enabled: true,
            supported_languages: ['zh-TW', 'en-US', 'ja-JP']
        },
        voice_synthesis: {
            enabled: true,
            supported_languages: ['zh-TW', 'en-US', 'ja-JP']
        },
        avatar_3d: {
            enabled: false,
            supported_models: ['default', 'custom']
        },
        line_integration: {
            enabled: true,
            webhook_url: '/api/webhook/line'
        },
        web_embedding: {
            enabled: true,
            embed_code: '<script src="/js/embed.js"></script>'
        }
    };

    res.json({
        success: true,
        features: features
    });
});

// 更新功能開關
router.post('/features', (req, res) => {
    const { feature, enabled, settings } = req.body;
    
    if (!feature) {
        return res.status(400).json({
            success: false,
            error: '請指定要更新的功能'
        });
    }

    res.json({
        success: true,
        message: `功能 ${feature} 更新成功`,
        feature: feature,
        enabled: enabled,
        settings: settings
    });
});

// 獲取系統統計
router.get('/stats', (req, res) => {
    const stats = {
        users: {
            total: 150,
            active: 120,
            new_this_month: 25
        },
        conversations: {
            total: 2500,
            this_month: 450,
            avg_response_time: '2.5s'
        },
        knowledge: {
            total_items: 1250,
            categories: 15,
            usage_this_month: 8500
        },
        system: {
            uptime: '99.9%',
            last_backup: '2024-01-15T10:00:00.000Z',
            storage_used: '75%'
        }
    };

    res.json({
        success: true,
        stats: stats
    });
});

module.exports = router; 