const express = require("express");
const router = express.Router();
const sessionController = require("../controller/sessionController");

router.post("/message", sessionController.addMessage);
router.patch("/msg-feedback", sessionController.updateMessageFeedback);
router.patch("/session-feedback", sessionController.updateSessionFeedback);
router.get("/user/:userId", sessionController.getUserSessions);
router.get("/:sessionId", sessionController.getSessionById);

module.exports = router;
