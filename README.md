# OTP-Based Authentication POC

## Overview

This project demonstrates a secure OTP (One-Time Password) based authentication system built with Node.js and Express. It serves as a production-ready proof-of-concept for implementing modern authentication best practices with:

#### Key Functionalities
- OTP Generation & Verification: Secure one-time password flow via email/SMS (mock implementation)
- Token-Based Authentication: JWT-based access/refresh token system
- Enhanced Security: Tokens stored in HTTP-only
- Automatic token rotation via refresh tokens
- Rate limiting to prevent brute force attacks
- Robust Validation: Comprehensive request validation using express-validator
- Database Integration: MongoDB storage for user data and OTP records

## Table of Contents
- [Features](#Features)
- [Installation](#Installation)
- [Usage](#Usage)
- [API Endpoints](#API)
- [Project Structure](#Structure)
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
   git clone https://github.com/AniketPotdar-AP/otp-auth-poc.git
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

## Structure

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
