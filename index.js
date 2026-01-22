require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();
const lineClient = new Client(config);

// 載入資料庫
const loadDatabase = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'database.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('載入資料庫檔案失敗:', error.message);
    return {
      ai_assistant_config: {
        name: 'AI 助理',
        model: 'gpt-4o-mini',
        useCase: '一般客服',
        description: '我是您的智能客服助理，很高興為您服務！'
      }
    };
  }
};

app.post('/webhook', middleware(config), async (req, res) => {
  const events = req.body.events;
  const results = await Promise.all(events.map(handleEvent));
  res.json(results);
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text;

  try {
    const reply = await getGPTReply(userMessage);

    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: reply
    });

  } catch (err) {
    console.error('GPT 錯誤：', err);
    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，AI 暫時無法回覆，請稍後再試～'
    });
  }
}

async function getGPTReply(userInput) {
  // 載入資料庫獲取 AI 配置
  const data = loadDatabase();
  const aiConfig = data.ai_assistant_config || {
    name: 'AI 助理',
    model: 'gpt-4o-mini',
    useCase: '一般客服',
    description: '我是您的智能客服助理，很高興為您服務！'
  };

  // 構建系統提示詞
  const systemPrompt = `你是 ${aiConfig.name}，${aiConfig.description}。你的使用場景是：${aiConfig.useCase}。請根據用戶的問題提供專業、友善且有用的回應。`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: aiConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      max_tokens: 1000,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content.trim();
}

app.listen(3000, () => {
  console.log('KAICHUAN Line Bot 已啟動於 http://localhost:3000');
});
