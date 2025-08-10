// routes/banking.js
// Express routes for banking chatbot, calling Python functions via persistent bridge

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Request debouncing for TTS to prevent multiple calls
const ttsRequestCache = new Map();
const TTS_DEBOUNCE_TIME = 1000; // 1 second debounce

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

// POST /api/text-to-speech - convert text to audio and return file directly
router.post('/text-to-speech', async (req, res) => {
    const { text, language } = req.body;

    if (!text || !language) {
        return res.status(400).json({ error: 'Both text and language are required' });
    }

    try {
        const result = await callPythonFunction('text_to_speech', [text, language]);

        if (result.success && result.audio_file_path) {
            // Send the audio file directly
            const fs = require('fs');
            const path = require('path');

            const audioPath = path.resolve(result.audio_file_path);

            // Check if file exists
            if (fs.existsSync(audioPath)) {
                res.setHeader('Content-Type', 'audio/wav');
                res.setHeader('Content-Disposition', 'inline');
                res.setHeader('Accept-Ranges', 'bytes');

                // Stream the audio file
                const audioStream = fs.createReadStream(audioPath);
                audioStream.pipe(res);

                // Optional: Clean up the file after sending
                audioStream.on('end', () => {
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(audioPath);
                            console.log(`Cleaned up audio file: ${audioPath}`);
                        } catch (cleanupErr) {
                            console.log(`Could not clean up audio file: ${cleanupErr.message}`);
                        }
                    }, 5000); // Delete after 5 seconds
                });

            } else {
                res.status(500).json({ error: 'Audio file not found' });
            }
        } else {
            res.status(500).json({ error: result.error || 'TTS generation failed' });
        }
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
    console.log("Language code received:", language_code);
    if (!language_code) {
        return res.status(400).json({ error: 'language_code is required' });
    }

    try {
        // Create permanent file path with original filename if provided
        const originalFilename = req.file.originalname || `audio_${Date.now()}.webm`;
        const permanentPath = path.join('uploads', originalFilename);

        // Copy the uploaded file to permanent location
        fs.copyFileSync(req.file.path, permanentPath);
        console.log(`Audio file saved permanently as: ${permanentPath}`);

        // Create output path for WAV file (for STT processing)
        const wavFilename = `${path.basename(originalFilename, path.extname(originalFilename))}.wav`;
        const wavPath = path.join('uploads', wavFilename);

        // Convert audio to WAV format using ffmpeg for better STT quality
        await new Promise((resolve, reject) => {
            console.log(`Converting ${permanentPath} to ${wavPath}`);
            ffmpeg(permanentPath)
                .audioChannels(1)           // Mono
                .audioFrequency(16000)      // 16kHz sample rate for speech recognition
                .audioCodec('pcm_s16le')    // PCM 16-bit little-endian
                .format('wav')
                .save(wavPath)
                .on('end', () => {
                    console.log('Audio conversion completed:', wavPath);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg conversion error:', err);
                    reject(err);
                })
                .on('progress', (progress) => {
                    console.log('Processing: ' + progress.percent + '% done');
                });
        });

        // Use the converted WAV file for speech-to-text
        const result = await callPythonFunction('speech_to_text', [wavPath, language_code]);

        // Clean up temporary files (keep both original webm and converted wav)
        try {
            fs.unlinkSync(req.file.path); // Original temporary uploaded file
            console.log('Temporary files cleaned up');
        } catch (cleanupErr) {
            console.warn('Cleanup error:', cleanupErr);
        }

        // Add file info to response
        const response = {
            ...result,
            savedFile: permanentPath,
            wavFile: wavPath,
            originalFilename: originalFilename
        };

        res.json(response);
    } catch (err) {
        console.error("Error in /audio-to-text:", err);
        res.status(500).json({ error: err.toString() });
    }
});

module.exports = router;