import dotenv from "dotenv";
import User from "../models/userModel.js";
import jwtUtils from "../utils/jwtUtils.js";
import asyncHandler from "../middleware/asyncHandler.js";

dotenv.config();

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
        return res.status(401).json({ message: "No refresh token provided." });
    }

    try {
        const decoded = await jwtUtils.verifyRefreshToken(refreshTokenFromCookie);

        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshTokenFromCookie) {
            if (user && user.refreshToken) {
                user.refreshToken = undefined;
                await user.save();
            }
            return res
                .status(403)
                .json({ message: "Invalid or revoked refresh token." });
        }

        const newAccessToken = await jwtUtils.generateAccessToken({
            userId: user._id,
            role: user.userRole,
        });
        const newRefreshToken = await jwtUtils.generateRefreshToken({
            userId: user._id,
            role: user.userRole,
        });

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("jwt", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: parseInt(process.env.JWT_ACCESS_EXPIRES_IN_MIN || '15') * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_MIN || '10080') * 60 * 1000,
        });

        return res
            .status(200)
            .json({ message: "Access token refreshed successfully." });
    } catch (err) {
        console.error("Error refreshing token:", err.message);
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        });
        return res
            .status(403)
            .json({
                message: "Invalid or expired refresh token. Please log in again.",
            });
    }
});

const logoutUser = asyncHandler(async (req, res, next) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
    });

    if (req.user && req.user._id) {
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }
    }

    res.status(200).json({ message: "User logged out successfully" });
});

export { refreshAccessToken, logoutUser };