// routes/gemini.js
// Express routes for restricted Gemini usage - ONLY for intent understanding and response formatting

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Helper function to aggressively clean text for safe transmission
function cleanUnicodeText(text) {
    if (typeof text !== 'string') return String(text);

    try {
        // More aggressive approach: use replacer function to handle all problematic characters
        return text
            .split('')
            .filter(char => {
                const code = char.charCodeAt(0);
                // Remove all surrogate characters (both high and low)
                return !(code >= 0xD800 && code <= 0xDFFF);
            })
            .join('')
            .normalize('NFC')
            .trim();
    } catch (e) {
        console.error('Unicode cleaning error:', e);
        // Ultimate fallback: keep only basic characters + Devanagari
        return text.replace(/[^\u0000-\u007F\u0900-\u097F]/g, '').trim();
    }
}

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

        // Clean args before sending
        const cleanedArgs = args.map(arg =>
            typeof arg === 'string' ? cleanUnicodeText(arg) : arg
        ); pyProcess.stdin.write(JSON.stringify({ func, args: cleanedArgs }) + "\n");
    });
}

// POST /api/gemini/chat - Banking chat with restricted Gemini (intent understanding + response formatting only)
router.post('/chat', async (req, res) => {
    const { message, session_id, language } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required and cannot be empty' });
    }

    try {
        // Clean the message to remove any invalid Unicode characters
        const cleanMessage = cleanUnicodeText(message.trim());

        // Use default language if not provided
        const selectedLanguage = language || 'en';

        console.log('Original message:', JSON.stringify(message));
        console.log('Cleaned message:', JSON.stringify(cleanMessage));
        console.log('Selected language:', selectedLanguage);

        const result = await callPythonFunction('simple_gemini_chat', [cleanMessage, session_id, selectedLanguage]);
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
