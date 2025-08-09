// routes/gemini.js
// Express routes for restricted Gemini usage - ONLY for intent understanding and response formatting

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Start the persistent Python bridge (reuse the same one from banking.js or create new)
console.log("Starting Gemini Python bridge (restricted mode - intent understanding & response formatting only)...");
const pyProcess = spawn('python', ['./controller/Python/py_bridge.py']);

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

// POST /api/gemini/chat - Banking chat with restricted Gemini (intent understanding + response formatting only)
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

// GET /api/gemini/health - Health check for restricted Gemini service
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Gemini Chat API - Restricted Mode',
        restriction: 'Gemini usage limited to: 1) Intent Understanding, 2) Response Formatting only',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/gemini/chat'
        ]
    });
});

module.exports = router;
