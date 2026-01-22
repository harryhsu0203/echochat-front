const fs = require('fs');
const path = require('path');

// 創建範例 LINE 對話數據
const createSampleData = () => {
    console.log('📝 創建範例 LINE 對話數據...');

    // 確保 data 目錄存在
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ 創建 data 目錄');
    }

    // 範例對話數據
    const sampleData = {
        staff_accounts: [
            {
                id: 1,
                username: 'sunnyharry1',
                password: '$2b$10$example.hash',
                name: '系統管理員',
                role: 'admin',
                email: 'admin@example.com',
                created_at: new Date().toISOString()
            }
        ],
        user_questions: [],
        knowledge: [],
        user_states: [],
        chat_history: [
            {
                id: 'line_conv_001',
                platform: 'line',
                messages: [
                    {
                        role: 'user',
                        content: '你好，我想詢問染髮的價格',
                        timestamp: new Date(Date.now() - 120000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '您好！歡迎詢問染髮服務。我們有不同價位的染髮套餐，請問您想要什麼顏色的染髮呢？',
                        timestamp: new Date(Date.now() - 110000).toISOString()
                    },
                    {
                        role: 'user',
                        content: '我想要染成棕色，大概要多少錢？',
                        timestamp: new Date(Date.now() - 100000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '棕色染髮的價格是 $1,500-$2,500，視髮長而定。建議您先來店裡讓設計師評估，可以給您更精確的報價喔！',
                        timestamp: new Date(Date.now() - 90000).toISOString()
                    }
                ],
                createdAt: new Date(Date.now() - 120000).toISOString(),
                updatedAt: new Date(Date.now() - 90000).toISOString()
            },
            {
                id: 'line_conv_002',
                platform: 'line',
                messages: [
                    {
                        role: 'user',
                        content: '會員卡怎麼使用?有積分嗎?',
                        timestamp: new Date(Date.now() - 300000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '您好！我們的會員卡可以累積積分，每消費 $100 可獲得 1 點積分。積分可以兌換免費服務或折扣券。請問您需要了解更多會員權益嗎？',
                        timestamp: new Date(Date.now() - 290000).toISOString()
                    },
                    {
                        role: 'user',
                        content: '好的，那我要辦一張會員卡',
                        timestamp: new Date(Date.now() - 280000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '太好了！請您到店裡填寫會員資料，我們會立即為您辦理會員卡。新會員首刷還有額外優惠喔！',
                        timestamp: new Date(Date.now() - 270000).toISOString()
                    }
                ],
                createdAt: new Date(Date.now() - 300000).toISOString(),
                updatedAt: new Date(Date.now() - 270000).toISOString()
            },
            {
                id: 'line_conv_003',
                platform: 'line',
                messages: [
                    {
                        role: 'user',
                        content: '明天下午有空嗎？急需要剪髮',
                        timestamp: new Date(Date.now() - 600000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '明天下午2點有空檔，可以為您安排！請問您大概幾點方便？',
                        timestamp: new Date(Date.now() - 590000).toISOString()
                    },
                    {
                        role: 'user',
                        content: '2點可以，謝謝！',
                        timestamp: new Date(Date.now() - 580000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '好的！已為您預約明天下午2點，請準時到店喔！',
                        timestamp: new Date(Date.now() - 570000).toISOString()
                    }
                ],
                createdAt: new Date(Date.now() - 600000).toISOString(),
                updatedAt: new Date(Date.now() - 570000).toISOString()
            },
            {
                id: 'line_conv_004',
                platform: 'line',
                messages: [
                    {
                        role: 'user',
                        content: '看了你們的髮型作品集，很喜歡！',
                        timestamp: new Date(Date.now() - 900000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '謝謝您的喜歡！請問您想要預約什麼服務呢？',
                        timestamp: new Date(Date.now() - 890000).toISOString()
                    },
                    {
                        role: 'user',
                        content: '想要剪髮+造型，可以預約明天下午嗎？',
                        timestamp: new Date(Date.now() - 880000).toISOString()
                    }
                ],
                createdAt: new Date(Date.now() - 900000).toISOString(),
                updatedAt: new Date(Date.now() - 880000).toISOString()
            },
            {
                id: 'line_conv_005',
                platform: 'line',
                messages: [
                    {
                        role: 'user',
                        content: '剪髮+染髮套餐多少錢？',
                        timestamp: new Date(Date.now() - 1200000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '剪髮+染髮套餐價格是 $2,000-$3,500，包含洗髮、剪髮、染髮和造型。歡迎預約體驗！',
                        timestamp: new Date(Date.now() - 1190000).toISOString()
                    },
                    {
                        role: 'user',
                        content: '好的，那我要預約下週二',
                        timestamp: new Date(Date.now() - 1180000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: '好的！已為您預約下週二下午2點，請準時到店喔！',
                        timestamp: new Date(Date.now() - 1170000).toISOString()
                    }
                ],
                createdAt: new Date(Date.now() - 1200000).toISOString(),
                updatedAt: new Date(Date.now() - 1170000).toISOString()
            }
        ],
        ai_assistant_config: [
            {
                assistant_name: 'AI 美髮助理',
                llm: 'gpt-4o-mini',
                use_case: 'customer-service',
                description: '我是您的專業美髮助理，很高興為您服務！'
            }
        ],
        email_verifications: [],
        password_reset_requests: []
    };

    // 寫入資料庫檔案
    const dataFile = path.join(dataDir, 'database.json');
    fs.writeFileSync(dataFile, JSON.stringify(sampleData, null, 2));
    
    console.log('✅ 範例數據已創建');
    console.log(`📁 檔案位置: ${dataFile}`);
    console.log(`📊 對話數量: ${sampleData.chat_history.length}`);
    
    // 顯示對話詳情
    console.log('\n📋 對話詳情:');
    sampleData.chat_history.forEach((conv, index) => {
        console.log(`\n對話 ${index + 1}:`);
        console.log(`  ID: ${conv.id}`);
        console.log(`  平台: ${conv.platform}`);
        console.log(`  訊息數量: ${conv.messages.length}`);
        console.log(`  建立時間: ${conv.createdAt}`);
        console.log(`  更新時間: ${conv.updatedAt}`);
        
        if (conv.messages.length > 0) {
            const lastMessage = conv.messages[conv.messages.length - 1];
            console.log(`  最新訊息: ${lastMessage.content.substring(0, 50)}...`);
        }
    });

    console.log('\n🎉 範例數據創建完成！');
    console.log('💡 現在您可以重新整理管理後台頁面來查看真實的 LINE 對話數據');
};

// 執行創建
if (require.main === module) {
    createSampleData();
}

module.exports = { createSampleData }; 