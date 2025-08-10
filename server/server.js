require('dotenv').config();
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const conversionRouter = require('./routes/conversionRoutes');
const geminiRouter = require('./routes/gemini');
const authRouter = require('./routes/authRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const adminRouter = require('./routes/adminRoutes');
// You can configure it further if needed, e.g., app.use(cors({ origin: 'http://example.com' }));
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());                         // 👈 Handles JSON req bodies
app.use(express.urlencoded({ extended: true })); // 👈 Handles form data
app.use(cookieParser());

// Serve static files (including gemini_test.html)
app.use(express.static('.'));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use((req, res, next) => {
    console.log("HI i am middleware 😀");
    next();
});

// For those routes:
app.use('/api', conversionRouter);
app.use('/api/auth', authRouter);
app.use('/api/session', sessionRouter);
app.use('/api/admin', adminRouter);
app.use('/api/gemini', geminiRouter);
app.post('/api/voice-chat', upload.single('audio'), conversionRouter);
app.post('/api/convert-audio', upload.single('audio'), conversionRouter);
app.post('/api/audio-info', upload.single('audio'), conversionRouter);
// app.use("/api/v1/temp", tempRouter);

app.get("/", (request, response) => {
    response.json({
        message: "server running fine",
    });
});

const PORT = process.env.PORT || 8001;
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("connection success👌");
    })
    .catch((error) =>
        console.log(`${error} ${process.env.PORT} did not connect`)
    );

app.listen(PORT, () => {
    console.log(`Server Port: ${PORT}`);
});
