const express = require("express");
const router = express.Router();
const adminDashBoard = require("../controller/adminDashBoard");
const unansweredQuestions = require('../controller/unAnsweredQuestionsController')

router.post("/analytics", adminDashBoard.getAnalytics);

// 📌 Add new unanswered question
router.post("/unanswered", unansweredQuestions.addUnansweredQuestion);

// 📌 Admin answers a question
router.patch("/unanswered/:id/answer", unansweredQuestions.answerUnansweredQuestion);

// 📌 Get all pending unanswered questions
router.get("/unanswered/pending", unansweredQuestions.getPendingUnansweredQuestions);

// 📌 Get all answered questions
router.get("/unanswered/answered", unansweredQuestions.getAnsweredQuestions);

module.exports = router;

