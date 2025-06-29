import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        userRole: {
            type: String,
            default: "user"
        },
        otp: {
            type: String,
        },
        otpExpires: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;