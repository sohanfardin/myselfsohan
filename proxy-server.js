const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// API Key from environment variable (set this on Render dashboard)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Health check endpoint (required by Render)
app.get('/', (req, res) => {
    res.json({ status: 'SohanOS AI Proxy is running ✅' });
});

// Proxy endpoint for OpenAI
app.post('/api/chat', async (req, res) => {
    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }
    try {
        const { messages, temperature, max_tokens } = req.body;

        console.log('[Proxy] Received request:', { messages });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 300
            })
        });

        const data = await response.json();
        console.log('[Proxy] OpenAI Response:', response.status);

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[Proxy] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🚀 SohanOS AI Proxy Server Running     ║
║                                           ║
║   Port: ${PORT}                              ║
║   Status: ✅ Ready                         ║
║                                           ║
║   Your frontend can now call:             ║
║   http://localhost:${PORT}/api/chat          ║
╚═══════════════════════════════════════════╝
    `);
});
