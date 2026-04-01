import express, {type Application} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app: Application = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import authRouter from './Routes/auth.routes.js';
import userRouter from './Routes/user.routes.js';
import adminRouter from './Routes/admin.routes.js';
import imageRouter from './Routes/image.routes.js';
import reportRouter from './Routes/report.routes.js';

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/image", imageRouter);
app.use("api/v1/reports", reportRouter);


export { app };