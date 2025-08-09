const UnansweredQuestion = require("../models/unanswered");

// 1️⃣ Add a new unanswered question
exports.addUnansweredQuestion = async (req, res) => {
    try {
        const { mobileNo, question, notifyUser } = req.body;

        if (!mobileNo || !question) {
            return res.status(400).json({
                status: "fail",
                message: "Mobile number and question are required"
            });
        }

        const uq = await UnansweredQuestion.create({
            mobileNo,
            question,
            notifyUser
        });

        res.status(201).json({
            status: "success",
            message: "Unanswered question saved successfully",
            data: uq
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

// 2️⃣ Admin answers a question
exports.answerUnansweredQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminAnswer } = req.body;

        if (!adminAnswer) {
            return res.status(400).json({
                status: "fail",
                message: "Answer is required"
            });
        }

        const uq = await UnansweredQuestion.findById(id);
        if (!uq) {
            return res.status(404).json({
                status: "fail",
                message: "Question not found"
            });
        }

        uq.adminAnswer = adminAnswer;
        uq.status = "answered";
        uq.answeredAt = Date.now();
        await uq.save();

        // 🔔 Send notification here if uq.notifyUser is true
        if (uq.notifyUser) {
            // Example: trigger SMS or push notification
            console.log(`Notify ${uq.mobileNo}: Your question has been answered.`);
        }

        res.status(200).json({
            status: "success",
            message: "Question answered successfully",
            data: uq
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

// 3️⃣ Get all unanswered questions (pending)
exports.getPendingUnansweredQuestions = async (req, res) => {
    try {
        const questions = await UnansweredQuestion.find({ status: "pending" }).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            results: questions.length,
            data: questions
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

// 4️⃣ Get answered questions
exports.getAnsweredQuestions = async (req, res) => {
    try {
        const questions = await UnansweredQuestion.find({ status: "answered" }).sort({ answeredAt: -1 });

        res.status(200).json({
            status: "success",
            results: questions.length,
            data: questions
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};
