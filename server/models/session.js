const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        feedback: { type: Number, default: 0, min: -1, max: 1 },
        timestamp: { type: Date, default: Date.now },
        intent: { type: String, default: "general_inquiry" }
    },
    { _id: false }
);

const sessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        sessionName: { type: String, default: "Untitled Session" },
        language: { type: String, default: "en" }, // Language preference for the session
        location: {
            type: {
                country: { type: String, default: "Unknown" }, // Default to "Unknown" if not provided
                state: { type: String, default: "Unknown" },   // Default to "Unknown" if not provided
                city: { type: String, default: "Unknown" },    // Default to "Unknown" if not provided
                coordinates: {
                    latitude: { type: Number },
                    longitude: { type: Number }
                }
            },
            required: false // Location is optional
        },
        device: { type: String, default: "unknown" },
        messages: [messageSchema],
        sessionFeedbackRating: { type: Number, min: 1, max: 5 }, // 🌟 Added
        sessionFeedbackText: { type: String, trim: true },        // 🌟 Added
        startedAt: { type: Date, default: Date.now },
        endedAt: { type: Date }
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
