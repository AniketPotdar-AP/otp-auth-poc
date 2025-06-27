import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";
import { validationResult } from "express-validator";
import User from "../models/userModel.js";
import jwtUtils from "../utils/jwtUtils.js";
import asyncHandler from "../middleware/asyncHandler.js";

dotenv.config();

const generateOtp = () => {
    const defaultOtpLength = 6
    const otpLength = parseInt(process.env.OTP_LIMIT) || defaultOtpLength;
    const min = Math.pow(10, otpLength - 1);
    const max = Math.pow(10, otpLength) - 1;
    const actualMin = otpLength === 1 ? 0 : min;
    return crypto.randomInt(actualMin, max + 1).toString();
};

const authenticateAndRespond = async (user, res, req) => {
    if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
    }

    const accessToken = await jwtUtils.generateAccessToken({
        userId: user._id,
        role: user.userRole,
    });

    const refreshToken = await jwtUtils.generateRefreshToken({
        userId: user._id,
        role: user.userRole,
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: parseInt(process.env.JWT_ACCESS_EXPIRES_IN_MIN || '15') * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MIN || '10080') * 60 * 1000,
    });

    return res.status(200).json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isVerified: user.isVerified,
        userRole: user.userRole,
        message: "Authentication successful",
    });
};

const sendOtp = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const sendUrl = `${process.env.OTP_URL}/${process.env.OTP_API_KEY}/SMS/${phoneNumber}/AUTOGEN/${process.env.OTP_TEMPLATE}`;

    if (!phoneNumber) {
        return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (process.env.NODE_ENV === "development") {
        try {
            let user = await User.findOne({ phoneNumber });
            if (!user) {
                return res
                    .status(404)
                    .json({ message: "User not found. Please register first." });
            }
            const otp = generateOtp();
            const ttl = parseInt(process.env.OTP_TTL_MIN || 3) * 60 * 1000;
            const expires = Date.now() + ttl;

            user.otp = otp;
            user.otpExpires = new Date(expires);
            await user.save();

            res.status(200).json({
                message: "OTP sent successfully. Please check your phone.",
                otp
            });
        } catch (error) {
            console.log("Something went wrong", error);
        }
    } else {
        try {
            let user = await User.findOne({ phoneNumber });
            if (!user) {
                return res
                    .status(404)
                    .json({ message: "User not found. Please register first." });
            }
            const response = await axios.post(sendUrl);
            if (user) {
                res.status(200).json({ message: "OTP sent", details: response.data });
            }
        } catch (err) {
            console.error("Error in Sending OTP:", err);
            next(err);
        }
    }
});

const verifyOtp = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, otp } = req.body;
    const verifyUrl = `${process.env.OTP_URL}/${process.env.OTP_API_KEY}/SMS/VERIFY3/${phoneNumber}/${otp}`;

    if (!phoneNumber || !otp) {
        return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (process.env.NODE_ENV === "development") {
        try {
            const user = await User.findOne({ phoneNumber });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
                user.otp = undefined;
                user.otpExpires = undefined;
                await user.save();
                return res
                    .status(400)
                    .json({
                        message: "OTP expired or not sent. Please request a new one.",
                    });
            }

            if (user.otp === otp) {
                user.otp = undefined;
                user.otpExpires = undefined;
                await user.save();

                return res
                    .status(200)
                    .json({
                        message: "OTP Verified Successfully",
                        user: user
                    });

            } else {
                return res
                    .status(400)
                    .json({ message: "Incorrect OTP. Please try again." });
            }

        } catch (err) {
            console.error("Error in verifyOtp:", err.message);
            next(err);
        }
    } else {
        try {
            const user = await User.findOne({ phoneNumber });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const response = await axios.post(verifyUrl);
            if (response.status !== 200 || response.data.Status !== "Success") {
                return res.status(400).json({ message: "Invalid OTP" });
            }

            return authenticateAndRespond(user, res, req);
        } catch (err) {
            console.error("Error in verifyOtp:", err.message);
            next(err);
        }
    }
});

export { sendOtp, verifyOtp };