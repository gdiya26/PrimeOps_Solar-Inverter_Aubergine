const express = require('express');
const router = express.Router();

// Proxy chat endpoint to the Python ML/LLM backend
router.post('/', async (req, res) => {
    try {
        const { query, history, session_id } = req.body;
        
        if (!query) {
            return res.status(400).json({ status: 'error', message: 'Query is required' });
        }

        const response = await fetch('http://127.0.0.1:8001/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, history: history || [], session_id: session_id || null })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`FastAPI responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        res.status(200).json({
            status: 'success',
            reply: data.reply,
            session_id: data.session_id
        });
    } catch (error) {
        console.error('Error proxying chat request to FastAPI:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to communicate with AI Backend'
        });
    }
});

module.exports = router;
