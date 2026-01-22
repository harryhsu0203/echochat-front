// AI對話式機器人服務模組
const express = require('express');
const router = express.Router();

// 獲取授權機器人列表
router.get('/robots', (req, res) => {
    const robots = [
        {
            id: 'robot_1',
            name: '設計師 Rainy',
            type: 'knowledge',
            status: 'active',
            description: '美髮設計師助理，協助客戶預約和提供美髮資訊',
            created_at: '2024-01-01T00:00:00.000Z',
            last_updated: '2024-01-15T10:30:00.000Z'
        },
        {
            id: 'robot_2',
            name: '客服小助手',
            type: 'general',
            status: 'active',
            description: '一般客服助理，處理常見問題',
            created_at: '2024-01-05T00:00:00.000Z',
            last_updated: '2024-01-14T15:20:00.000Z'
        }
    ];

    res.json({
        success: true,
        robots: robots
    });
});

// 創建新機器人
router.post('/robots', (req, res) => {
    const { name, type, description, config } = req.body;
    
    if (!name || !type) {
        return res.status(400).json({
            success: false,
            error: '請提供機器人名稱和類型'
        });
    }

    const robot = {
        id: `robot_${Date.now()}`,
        name: name.trim(),
        type: type,
        status: 'active',
        description: description || '',
        config: config || {},
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '機器人創建成功',
        robot: robot
    });
});

// 多模態聊天 API
router.post('/chat/multimodal', (req, res) => {
    const { message, files, images, urls, conversationId, robotId } = req.body;
    
    if (!message && !files && !images && !urls) {
        return res.status(400).json({
            success: false,
            error: '請提供至少一種輸入內容'
        });
    }

    // 構建多模態輸入內容
    let multimodalContent = message || '';
    
    if (files && files.length > 0) {
        multimodalContent += '\n\n附件文件：' + files.map(f => f.name).join(', ');
    }
    
    if (images && images.length > 0) {
        multimodalContent += '\n\n圖片：' + images.length + ' 張';
    }
    
    if (urls && urls.length > 0) {
        multimodalContent += '\n\n連結：' + urls.join(', ');
    }

    // 模擬AI回應
    const aiReply = `感謝您的訊息！我已經收到了您的${message ? '文字訊息' : ''}${files && files.length > 0 ? '和附件文件' : ''}${images && images.length > 0 ? '和圖片' : ''}${urls && urls.length > 0 ? '和連結' : ''}。我會盡快為您處理。`;

    const response = {
        success: true,
        reply: aiReply,
        conversationId: conversationId || `conv_${Date.now()}`,
        robotId: robotId || 'default',
        timestamp: new Date().toISOString()
    };

    res.json(response);
});

// 獲取對話歷史
router.get('/conversations', (req, res) => {
    const { robotId, limit = 50, offset = 0 } = req.query;
    
    const conversations = [
        {
            id: 'conv_1',
            robotId: 'robot_1',
            title: '美髮預約諮詢',
            lastMessage: '請問您想要預約什麼時候呢？',
            messageCount: 15,
            createdAt: '2024-01-15T09:00:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
            status: 'active'
        },
        {
            id: 'conv_2',
            robotId: 'robot_2',
            title: '產品諮詢',
            lastMessage: '我們的產品都有品質保證',
            messageCount: 8,
            createdAt: '2024-01-14T14:00:00.000Z',
            updatedAt: '2024-01-14T15:20:00.000Z',
            status: 'closed'
        }
    ];

    res.json({
        success: true,
        conversations: conversations,
        total: conversations.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
});

// 獲取單個對話詳情
router.get('/conversations/:id', (req, res) => {
    const { id } = req.params;
    
    const conversation = {
        id: id,
        robotId: 'robot_1',
        title: '美髮預約諮詢',
        messages: [
            {
                id: 'msg_1',
                role: 'user',
                content: '你好，我想要預約美髮服務',
                timestamp: '2024-01-15T09:00:00.000Z'
            },
            {
                id: 'msg_2',
                role: 'assistant',
                content: '您好！很高興為您服務。請問您想要預約什麼時候呢？',
                timestamp: '2024-01-15T09:01:00.000Z'
            },
            {
                id: 'msg_3',
                role: 'user',
                content: '我想預約下週二下午',
                timestamp: '2024-01-15T09:02:00.000Z'
            },
            {
                id: 'msg_4',
                role: 'assistant',
                content: '好的！下週二下午有空檔。請問您想要什麼服務呢？',
                timestamp: '2024-01-15T09:03:00.000Z'
            }
        ],
        createdAt: '2024-01-15T09:00:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        status: 'active'
    };

    res.json({
        success: true,
        conversation: conversation
    });
});

// 統計數據 API
router.get('/stats/comprehensive', (req, res) => {
    const stats = {
        conversations: {
            total: 2500,
            this_month: 450,
            active: 120,
            avg_duration: '15分鐘'
        },
        messages: {
            total: 15000,
            this_month: 2800,
            avg_per_conversation: 6
        },
        robots: {
            total: 5,
            active: 3,
            popular: [
                {
                    name: '設計師 Rainy',
                    conversation_count: 1200,
                    satisfaction_rate: '95%'
                },
                {
                    name: '客服小助手',
                    conversation_count: 800,
                    satisfaction_rate: '92%'
                }
            ]
        },
        usage: {
            daily_active_users: 150,
            monthly_active_users: 1200,
            peak_hours: ['10:00-12:00', '14:00-16:00', '19:00-21:00']
        }
    };

    res.json({
        success: true,
        stats: stats
    });
});

// 知識庫管理 API
router.get('/knowledge', (req, res) => {
    const knowledge = [
        {
            id: 'kb_1',
            title: '美髮服務介紹',
            content: '我們提供剪髮、染髮、燙髮等各種美髮服務...',
            category: '服務介紹',
            tags: ['美髮', '服務', '介紹'],
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-15T00:00:00.000Z'
        },
        {
            id: 'kb_2',
            title: '預約流程說明',
            content: '預約流程分為以下步驟：1. 選擇服務 2. 選擇時間 3. 確認預約...',
            category: '預約流程',
            tags: ['預約', '流程', '說明'],
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-14T00:00:00.000Z'
        }
    ];

    res.json({
        success: true,
        knowledge: knowledge,
        total: knowledge.length
    });
});

// 新增知識庫項目
router.post('/knowledge', (req, res) => {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({
            success: false,
            error: '請提供標題和內容'
        });
    }

    const knowledgeItem = {
        id: `kb_${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        category: category || '未分類',
        tags: tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    res.json({
        success: true,
        message: '知識庫項目新增成功',
        knowledge: knowledgeItem
    });
});

module.exports = router; 