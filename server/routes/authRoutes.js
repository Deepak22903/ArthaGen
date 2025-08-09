const express = require('express');
const authController = require('../controller/authController');

const router = express.Router();

router.post("/send-otp", authController.sendOtp);
router.post("/login", authController.loginWithOtp);

module.exports = router;
