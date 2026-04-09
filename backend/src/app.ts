/**
 * @file app.ts
 * @description Core Express application configuration.
 * Sets up global middlewares, security configurations (CORS, payload limits),
 * and mounts the API routers for the Image Provenance system.
 * * @module app
 */
import express, {type Application} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app: Application = express()

// --- Global Middlewares ---

/**
 * @notice Cross-Origin Resource Sharing (CORS) Configuration.
 * Ensures only authorized frontend domains can interact with the API.
 * `credentials: true` is strictly required to allow cookies (e.g., HTTP-only JWTs) 
 * to be sent across different origins.
 */
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}))

/**
 * @notice Payload Parsers & Security Limits.
 * Parses incoming JSON and URL-encoded requests.
 * Limits the body size to 16kb to mitigate Denial of Service (DoS) attacks via massive payloads.
 */
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));

/**
 * @notice Static Asset Serving.
 * Exposes the 'public' directory for serving temporary assets, 
 * such as images temporarily stored by Multer before IPFS/Cloudinary upload.
 */
app.use(express.static("public"));

/**
 * @notice Cookie Parser Middleware.
 * Parses the Cookie header and populates req.cookies.
 * This is crucial for extracting the JWT token during user authentication.
 */
app.use(cookieParser());

// --- App route mounting ---

import authRouter from './Routes/auth.routes.js';
import userRouter from './Routes/user.routes.js';
import adminRouter from './Routes/admin.routes.js';
import imageRouter from './Routes/image.routes.js';
import reportRouter from './Routes/report.routes.js';

/**
 * @notice Base API Routes (Version 1).
 * Prefixing routes with `/api/v1/` ensures backward compatibility. 
 * If the API architecture changes in the future, v2 can be introduced without breaking v1 clients.
 */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/image", imageRouter);
app.use("/api/v1/reports", reportRouter);


export { app };