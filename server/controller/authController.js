const User = require("../models/user");
const Session = require("../models/session");

// Generate random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1️⃣ Send OTP
exports.sendOtp = async (req, res) => {
    try {
        const { name, mobileNo } = req.body;

        if (!mobileNo || !name) {
            return res.status(400).json({ status: "fail", message: "Mobile number and name are required" });
        }

        // Check if user exists, else create
        console.log(`Checking user for mobile number: ${mobileNo}`);
        let user = await User.findOne({ mobileNo });
        console.log(`Checking user for mobile number: ${mobileNo}`);
        if (!user) {
            user = await User.create({ name: name || "Guest", mobileNo });
        }

        // Generate OTP
        const otp = generateOtp();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins

        user.mobileOtp = otp;
        user.mobileOtpExpires = otpExpires;
        await user.save();

        // Send OTP (here we just log it, but you can integrate Twilio, MSG91, etc.)
        console.log(`✅ OTP for ${mobileNo}: ${otp}`);

        res.status(200).json({
            status: "success",
            message: "OTP sent successfully",
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// 2️⃣ Login with OTP
exports.loginWithOtp = async (req, res) => {
    try {
        const { mobileNo, otp, language, location } = req.body;

        if (!mobileNo || !otp) {
            return res.status(400).json({ status: "fail", message: "Mobile number and OTP are required" });
        }

        const user = await User.findOne({ mobileNo });
        if (!user) {
            return res.status(404).json({ status: "fail", message: "User not found" });
        }

        // Validate OTP
        if (user.mobileOtp !== otp || Date.now() > user.mobileOtpExpires) {
            return res.status(400).json({ status: "fail", message: "Invalid or expired OTP" });
        }

        // Clear OTP
        user.mobileOtp = undefined;
        user.mobileOtpExpires = undefined;
        await user.save();

        // Check for existing active session (no endedAt)
        let session = await Session.findOne({ user: user._id, endedAt: { $exists: false } });

        if (!session) {
            // Create session data object
            const sessionData = {
                user: user._id,
                messages: []
            };

            // Add language if provided (defaults to 'en' as per model)
            if (language) {
                sessionData.language = language;
            }

            // Add location if provided (optional as per model)
            if (location) {
                sessionData.location = location;
            }

            // Create a new chat session
            session = await Session.create(sessionData);
        }

        res.status(200).json({
            status: "success",
            message: "Login successful",
            userId: user._id,
            sessionId: session._id,
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
