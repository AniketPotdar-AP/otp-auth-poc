import jwt from "jsonwebtoken";
import { promisify } from "util";

const verifyJWT = promisify(jwt.verify);
const signJWT = promisify(jwt.sign);

const jwtUtils = {
    generateAccessToken: async (payload) => {
        return await signJWT(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
        });
    },

    generateRefreshToken: async (payload) => {
        return await signJWT(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        });
    },

    verifyAccessToken: async (token) => {
        return await verifyJWT(token, process.env.JWT_ACCESS_SECRET);
    },

    verifyRefreshToken: async (token) => {
        return await verifyJWT(token, process.env.JWT_REFRESH_SECRET);
    },
};

export default jwtUtils;