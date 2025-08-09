const express = require("express");
const router = express.Router();
const unansweredController = require("../controller/unAnsweredQuestionsController");

// 📌 Add new unanswered question
router.post("/", unansweredController.addUnansweredQuestion);

// 📌 Admin answers a question
router.patch("/:id/answer", unansweredController.answerUnansweredQuestion);

// 📌 Get all pending unanswered questions
router.get("/pending", unansweredController.getPendingUnansweredQuestions);

// 📌 Get all answered questions
router.get("/answered", unansweredController.getAnsweredQuestions);

module.exports = router;
