const mongoose = require("mongoose");

const unansweredQuestionSchema = new mongoose.Schema(
    {
        mobileNo: {
            type: String,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        notifyUser: {
            type: Boolean,
            default: false
        },
        adminAnswer: {
            type: String
        },
        status: {
            type: String,
            enum: ["pending", "answered"],
            default: "pending"
        },
        askedAt: {
            type: Date,
            default: Date.now
        },
        answeredAt: {
            type: Date
        }
    },
    { timestamps: true }
);

const UnansweredQuestion = mongoose.model("UnansweredQuestion", unansweredQuestionSchema);
module.exports = UnansweredQuestion;
