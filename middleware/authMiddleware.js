import User from "../models/userModel.js";
import jwtUtils from "../utils/jwtUtils.js";
import asyncHandler from "./asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    let accessToken = req.cookies.jwt;
    let refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
        res.status(401);
        throw new Error("Not authorized, no tokens provided.");
    }

    try {
        let decoded;

        if (accessToken) {
            try {
                decoded = await jwtUtils.verifyAccessToken(accessToken);
            } catch (error) {
                if (error.name === "TokenExpiredError" && refreshToken) {
                    console.log(
                        "Access token expired, attempting to refresh with refresh token..."
                    );
                } else {
                    res.status(401);
                    throw new Error("Not authorized, invalid access token.");
                }
            }
        }

        if (!decoded && refreshToken) {
            try {
                decoded = await jwtUtils.verifyRefreshToken(refreshToken);
                const user = await User.findById(decoded.userId);

                if (!user || user.refreshToken !== refreshToken) {
                    if (user && user.refreshToken) {
                        user.refreshToken = undefined;
                        await user.save();
                    }
                    res.status(403);
                    throw new Error(
                        "Invalid or revoked refresh token. Please log in again."
                    );
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

                accessToken = newAccessToken;
                decoded = await jwtUtils.verifyAccessToken(newAccessToken);

                console.log("Tokens refreshed successfully in protect middleware.");
            } catch (refreshError) {
                console.error(
                    "Refresh token verification failed:",
                    refreshError.message
                );
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
                res.status(403);
                throw new Error("Session expired. Please log in again.");
            }
        }

        if (!decoded) {
            res.status(401);
            throw new Error(
                "Not authorized, token verification failed for both access and refresh tokens."
            );
        }

        const user = await User.findById(decoded.userId).select(
            "-password -otp -otpExpires -refreshToken"
        );

        if (!user) {
            res.status(401);
            throw new Error("Not authorized, user not found.");
        }

        req.user = user;
        req.token = accessToken;

        next();
    } catch (error) {
        console.error("Authentication Middleware Error:", error.message);
        throw error;
    }
});

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.userRole) {
            return res.status(401).json({
                success: false,
                message: "Authentication required (user role not found).",
            });
        }

        if (!roles.includes(req.user.userRole)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions.",
            });
        }

        next();
    };
};

export default {
    protect,
    authorize,
};
