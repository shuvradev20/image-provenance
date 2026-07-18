import express, { type Application, type ErrorRequestHandler } from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app: Application = express()

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import authRouter from './Routes/auth.routes.js';
import userRouter from './Routes/user.routes.js';
import adminRouter from './Routes/admin.routes.js';
import imageRouter from './Routes/image.routes.js';

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/images", imageRouter);

app.use(errorHandler);
export { app };