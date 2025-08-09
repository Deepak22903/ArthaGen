const express = require("express");
const router = express.Router();
const sessionController = require("../controller/sessionController");

router.post("/create", sessionController.createSession);
router.post("/message", sessionController.addMessage);
router.patch("/msg-feedback", sessionController.updateMessageFeedback);
router.patch("/session-feedback", sessionController.updateSessionFeedback);
router.patch("/preferences", sessionController.updateSessionPreferences);
router.get("/user/:userId", sessionController.getUserSessions);
router.get("/:sessionId", sessionController.getSessionById);

module.exports = router;
