import express from "express";
import { body } from "express-validator";
import {
    refreshAccessToken,
    logoutUser,
} from "../controller/authController.js";
import { sendOtp, verifyOtp } from "../controller/otpController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const validateSendOtp = [
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("en-IN")
        .withMessage("Invalid Phone number format"),
];

const validateVerifyOtp = [
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("en-IN")
        .withMessage("Invalid Phone number format"),
    body("otp")
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: process.env.OTP_LIMIT, max: process.env.OTP_LIMIT })
        .withMessage(`OTP must be ${process.env.OTP_LIMIT} digits`)
        .isNumeric()
        .withMessage("OTP must be numeric"),
];

router.post("/send-otp", validateSendOtp, sendOtp);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);

export default router;
