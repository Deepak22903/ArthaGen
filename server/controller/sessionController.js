const Session = require("../models/session");

// 1️⃣ Create a new session
exports.createSession = async (req, res) => {
    try {
        const { userId, sessionName, language, location } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: "fail",
                message: "User ID is required"
            });
        }

        // Create session data object
        const sessionData = {
            user: userId,
            messages: []
        };

        // Add optional fields
        if (sessionName) sessionData.sessionName = sessionName;
        if (language) sessionData.language = language;
        if (location) sessionData.location = location;

        const session = await Session.create(sessionData);

        res.status(201).json({
            status: "success",
            message: "Session created successfully",
            session
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

exports.addMessage = async (req, res) => {
    try {
        const { sessionId, question, answer } = req.body;

        if (!sessionId || !question || !answer) {
            return res.status(400).json({ status: "fail", message: "Session ID, question, and answer are required" });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ status: "fail", message: "Session not found" });
        }

        // If sessionName is default, set it from first question
        if (session.sessionName === "Untitled Session" && session.messages.length === 0) {
            session.sessionName = question;
        }

        session.messages.push({ question, answer });
        await session.save();

        res.status(200).json({
            status: "success",
            message: "Message added successfully",
            session
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// 3️⃣ Update feedback for the latest answered message only
exports.updateMessageFeedback = async (req, res) => {
    try {
        let { sessionId, messageIndex, feedback } = req.body;

        if (!sessionId || feedback === undefined) {
            return res.status(400).json({
                status: "fail",
                message: "Session ID, message index, and feedback are required"
            });
        }

        if (![-1, 0, 1].includes(feedback)) {
            return res.status(400).json({
                status: "fail",
                message: "Feedback must be -1, 0, or 1"
            });
        }

        const session = await Session.findById(sessionId);
        if (messageIndex === undefined) {
            messageIndex = session.messages.length - 1;
        }
        if (!session) {
            return res.status(404).json({
                status: "fail",
                message: "Session not found"
            });
        }

        if (messageIndex < 0 || messageIndex >= session.messages.length) {
            return res.status(404).json({
                status: "fail",
                message: "Message not found"
            });
        }

        const lastIndex = session.messages.length - 1;
        if (messageIndex !== lastIndex) {
            return res.status(400).json({
                status: "fail",
                message: "You can only give feedback for the latest answered message"
            });
        }

        session.messages[messageIndex].feedback = feedback;
        await session.save();

        res.status(200).json({
            status: "success",
            message: "Message feedback updated successfully",
            session
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};


// 4️⃣ Update session-level feedback
exports.updateSessionFeedback = async (req, res) => {
    try {
        const { sessionId, sessionFeedbackRating, sessionFeedbackText } = req.body;

        if (!sessionId || !sessionFeedbackRating) {
            return res.status(400).json({
                status: "fail",
                message: "Session ID and sessionFeedbackRating are required"
            });
        }

        if (sessionFeedbackRating < 1 || sessionFeedbackRating > 5) {
            return res.status(400).json({
                status: "fail",
                message: "Session feedback rating must be between 1 and 5"
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                status: "fail",
                message: "Session not found"
            });
        }

        session.sessionFeedbackRating = sessionFeedbackRating;
        if (sessionFeedbackText) {
            session.sessionFeedbackText = sessionFeedbackText;
        }

        await session.save();

        res.status(200).json({
            status: "success",
            message: "Session feedback updated successfully",
            session
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};


// 5️⃣ Get all sessions for a user
exports.getUserSessions = async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await Session.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-messages"); // omit messages list for summary view

        res.status(200).json({
            status: "success",
            results: sessions.length,
            sessions
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};


// 6️⃣ Get one session with messages
exports.getSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId)
            .populate("user", "name mobileNo");

        if (!session) {
            return res.status(404).json({
                status: "fail",
                message: "Session not found"
            });
        }

        res.status(200).json({
            status: "success",
            session
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

// 7️⃣ Update session language and location
exports.updateSessionPreferences = async (req, res) => {
    try {
        const { sessionId, language, location } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: "fail",
                message: "Session ID is required"
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                status: "fail",
                message: "Session not found"
            });
        }

        // Update language if provided
        if (language) {
            session.language = language;
        }

        // Update location if provided (location is optional)
        if (location) {
            session.location = location;
        }

        await session.save();

        res.status(200).json({
            status: "success",
            message: "Session preferences updated successfully",
            session
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

// unanswered questions
