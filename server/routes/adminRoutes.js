const express = require("express");
const router = express.Router();
const adminDashBoard = require("../controller/adminDashBoard");
const unansweredQuestions = require('../controller/unAnsweredQuestionsController')

router.post("/analytics", adminDashBoard.getAnalytics);
router.post("/unanswered", unansweredQuestions.addUnansweredQuestion);
router.patch("/unanswered/:id/answer", unansweredQuestions.answerUnansweredQuestion);
router.get("/unanswered/pending", unansweredQuestions.getPendingUnansweredQuestions);
router.get("/unanswered/answered", unansweredQuestions.getAnsweredQuestions);

module.exports = router;

