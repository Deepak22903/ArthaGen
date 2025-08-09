// routes/gemini.js
// Express routes for simple Gemini chat (text to text only)

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Start the persistent Python bridge (reuse the same one from banking.js or create new)
console.log("Starting Gemini Python bridge...");
const pyProcess = spawn('../../BoM/venv/Scripts/python.exe', ['./controller/Python/py_bridge.py']);

// Log any Python-side errors
pyProcess.stderr.on('data', (data) => {
    console.error('Gemini Python bridge error:', data.toString());
});

pyProcess.on('exit', (code) => {
    console.log(`Gemini Python bridge exited with code ${code}`);
});

/**
 * Call a Python function via the persistent bridge
 * @param {string} func - Python function name
 * @param {Array} args - Arguments to pass
 * @returns {Promise<object>} - Python function result
 */
function callPythonFunction(func, args = []) {
    return new Promise((resolve, reject) => {
        const listener = (data) => {
            const message = data.toString().trim();

            // Ignore log lines that are not JSON
            if (!message.startsWith("{") && !message.startsWith("[")) {
                console.log("PYTHON LOG:", message);
                return;
            }

            try {
                const result = JSON.parse(message);
                pyProcess.stdout.removeListener('data', listener);
                resolve(result);
            } catch (err) {
                reject(new Error(`Failed to parse Python response: ${err.message}\nData: ${message}`));
            }
        };

        pyProcess.stdout.on('data', listener);
        pyProcess.stdin.write(JSON.stringify({ func, args }) + "\n");
    });
}

// POST /api/gemini/chat - Simple text chat with Gemini
router.post('/chat', async (req, res) => {
    const { message, session_id } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required and cannot be empty' });
    }

    try {
        const result = await callPythonFunction('simple_gemini_chat', [message.trim(), session_id]);
        res.json(result);
    } catch (err) {
        console.error("Error in /gemini/chat:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// POST /api/gemini/chat-context - Chat with conversation context
router.post('/chat-context', async (req, res) => {
    const { message, session_id } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required and cannot be empty' });
    }

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID is required for contextual chat' });
    }

    try {
        const result = await callPythonFunction('contextual_gemini_chat', [message.trim(), session_id]);
        res.json(result);
    } catch (err) {
        console.error("Error in /gemini/chat-context:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// GET /api/gemini/conversation/:session_id - Get conversation history
router.get('/conversation/:session_id', async (req, res) => {
    const { session_id } = req.params;

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const result = await callPythonFunction('get_gemini_conversation', [session_id]);
        res.json(result);
    } catch (err) {
        console.error("Error in /gemini/conversation:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// DELETE /api/gemini/conversation/:session_id - Clear conversation history
router.delete('/conversation/:session_id', async (req, res) => {
    const { session_id } = req.params;

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const result = await callPythonFunction('clear_gemini_conversation', [session_id]);
        res.json(result);
    } catch (err) {
        console.error("Error in /gemini/clear-conversation:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// GET /api/gemini/health - Health check for Gemini service
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Gemini Chat API',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/gemini/chat',
            'POST /api/gemini/chat-context',
            'GET /api/gemini/conversation/:session_id',
            'DELETE /api/gemini/conversation/:session_id'
        ]
    });
});

module.exports = router;
