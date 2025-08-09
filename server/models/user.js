const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please tell us your name!"],
        },
        mobileNo: {
            type: String,
            required: [true, "Please provide your email"],
            unique: true,
        },
        mobileOtp: {
            type: String,
            default: "default.png",
        },
        mobileOtp: String,
        mobileOtpExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
