const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = `Duplicate field value entered: ${Object.keys(err.keyValue)} already exists.`;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Not authorized, token failed';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Not authorized, token expired';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };