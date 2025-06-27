import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/dbConfig.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
    windowMs: (process.env.AUTH_LIMIT_TIME || 15) * 60 * 1000,
    max: process.env.AUTH_LIMIT,
    message: `Too many requests from this IP, please try again after ${process.env.AUTH_LIMIT_TIME || 15
        } minutes`,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
