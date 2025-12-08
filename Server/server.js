require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 8080; // [변경] 배포용 포트로 8080 권장 (원하면 3001 유지 가능)

app.use(cors());
app.use(express.json());

// [추가] React 빌드 결과물(build 폴더)을 정적 파일로 제공
// 주의: React 빌드 폴더명이 'build'라면 아래 'build'를 'build'로 바꾸세요.
app.use(express.static(path.join(__dirname, 'build')));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// [삭제 또는 변경] 루트('/') 요청 시 "AI Server is running"이 뜨면 React 앱이 안 뜹니다.
// 테스트가 필요하면 주소를 바꾸거나 삭제하세요.
app.get('/api/test', (req, res) => {
    res.send('AI Server is running!');
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

// [추가] 그 외 모든 요청('*')은 React의 index.html로 보냄 (새로고침 시 404 방지)
// 이 코드는 반드시 API 라우트들보다 밑에 있어야 합니다.
app.get(function(req, res, next) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
});