require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// Vercel 프론트엔드에서 오는 API 요청을 허용하기 위한 CORS 설정
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 테스트용 엔드포인트
app.get('/api/test', (req, res) => {
    res.send('AI Server is running on Vercel!');
});

// 채팅 응답 API
app.post('/api/chat', async (req, res) => {
    try {
        const messages = req.body.messages;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages 배열이 필요합니다." });
        }

        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: messages
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({ response: aiResponse });

    } catch (error) {
        console.error("❌ OpenAI API 오류:", error);
        
        if (error.status === 401) {
            return res.status(401).json({
                error: "OpenAI 인증 오류. API 키를 확인해주세요."
            });
        }

        res.status(500).json({
            error: "서버 내부 오류 발생",
            info: error.message
        });
    }
});

// [핵심 변경] app.listen(...)을 삭제하고, Vercel이 서버를 실행할 수 있도록 app을 내보냅니다.
module.exports = app;