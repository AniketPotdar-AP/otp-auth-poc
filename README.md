# OTP-Based Authentication POC

## Overview

This project integrates a Secure Backend Implementation with JWT, Rate Limiting, and Express Validations

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)

![Express](https://img.shields.io/badge/Express-5.x-blue)

![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)

![JWT](https://img.shields.io/badge/JWT-Auth-orange)

## Table of Contents
- [Features](#Features)
- [Installation](#Installation)
- [Usage](#Usage)
- [API](#API)
- [Project Structure](#Project Structure)
- [Dependencies](#Dependencies)

## Features
- ✅ OTP Generation & Verification (Mocked)
- ✅ JWT Token Rotation (Access + Refresh Tokens)
- ✅ Secure HTTP-only Cookie Storage
- ✅ Rate Limiting Middleware
- ✅ Express Request Validation
- ✅ MongoDB User Storage
- ✅ Error Handling Middleware
- ✅ Helmet.js Security Headers


## Installation

 - Clone the repository:
   ```sh
   git clone https://github.com/AniketPotdar-AP/Gemini_chatbot_backend.git
   ```
- Install dependencies:

   ```sh
   npm install
   ```

## Usage

- Start the server:

   ```sh
   npm run start
   ```

## API

### **POST /api/auth/send-otp**

- **Request Body:**
  ```json
  {
    "phoneNumber": ""
  }
  ```
- **Response:**
  ```json
  {
    "message": "OTP sent",
    "details": {
        "Status": "Success",
        "Details": ""
    }
  }

### **POST /api/auth/verify-otp**

- **Request Body:**
  ```json
  {
    "phoneNumber": "",
    "otp": ""
  }
  ```
- **Response:**
  ```json
  {
     "message": "Authentication successful"
  }

## Project Structure

```
├── config/
│ └── dbConfig.js # MongoDB connection
├── controller/
│ ├── authController.js # Auth logic
│ └── otpController.js # OTP handling
├── middleware/
│ ├── asyncHandler.js # Async errors
│ ├── authMiddleware.js # JWT verification
│ └── errorMiddleware.js # Error handling
├── models/
│ └── userModel.js # User schema
├── routes/
│ └── authRoutes.js # All auth endpoints
├── utils/
│ └── jwtUtils.js # JWT helpers
├── package.json
└── server.js # Main app
```

## Dependencies

### Core Dependencies
| Package | Purpose |
|---------|---------|
| [express](https://expressjs.com/) |  Web framework |
| [mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT token handling |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variables |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | Cookie handling |
| [helmet](https://helmetjs.github.io/) | Security headers |
| [express-rate-limit](https://github.com/nfriedly/express-rate-limit) |  Rate limiting |
| [express-validator](https://express-validator.github.io/) | Request validation |
| [cors](https://github.com/expressjs/cors) | Cross-Origin Resource Sharing |
| [axios](https://axios-http.com/) | HTTP requests (if used for OTP delivery) |

### Development Dependencies
| Package | Purpose |
|---------|---------|
| [nodemon](https://nodemon.io/) |  Development server reloading |
