// routes/banking.js
// Express routes for banking chatbot, calling Python functions via persistent bridge

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Start the persistent Python bridge
console.log("Starting persistent Python bridge...");
const pyProcess = spawn('python', ['./controller/Python/py_bridge.py']);

// Log any Python-side errors
pyProcess.stderr.on('data', (data) => {
    console.error('Python bridge error:', data.toString());
});

pyProcess.on('exit', (code) => {
    console.log(`Python bridge exited with code ${code}`);
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


// POST /api/chat - process chatbot message
router.post('/chat', async (req, res) => {
    const { message, language, session_id } = req.body;

    if (!message || !language) {
        return res.status(400).json({ error: 'Message and language are required' });
    }

    try {
        const result = await callPythonFunction('process_query', [message, language, session_id]);
        res.json(result);
    } catch (err) {
        console.error("Error in /chat:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// POST /api/text-to-speech - convert text to audio
router.post('/text-to-speech', async (req, res) => {
    const { text, language } = req.body;

    if (!text || !language) {
        return res.status(400).json({ error: 'Both text and language are required' });
    }

    try {
        const result = await callPythonFunction('text_to_speech', [text, language]);
        res.json(result);
    } catch (err) {
        console.error("Error in /text-to-speech:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// POST /api/speech-to-text - convert audio to text
router.post('/speech-to-text', async (req, res) => {
    const { audio_file_path, language_code } = req.body;

    if (!audio_file_path || !language_code) {
        return res.status(400).json({ error: 'Both audio_file_path and language_code are required' });
    }

    try {
        const result = await callPythonFunction('speech_to_text', [audio_file_path, language_code]);
        res.json(result);
    } catch (err) {
        console.error("Error in /speech-to-text:", err);
        res.status(500).json({ error: err.toString() });
    }
});

// POST /api/audio-to-text - convert uploaded audio file to text
router.post('/audio-to-text', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { language_code } = req.body;
    if (!language_code) {
        return res.status(400).json({ error: 'language_code is required' });
    }

    try {
        const result = await callPythonFunction('speech_to_text', [req.file.path, language_code]);
        res.json(result);
    } catch (err) {
        console.error("Error in /audio-to-text:", err);
        res.status(500).json({ error: err.toString() });
    }
});

module.exports = router;