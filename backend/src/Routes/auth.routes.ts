import { Router } from "express";
import { registerUser, getNonce, verifySignature, logoutUser, refreshAccessToken } from "../Controllers/auth.controller.js";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "nidImage", maxCount: 1},
        {name: "selfieWithNid", maxCount: 1}
    ]),
    registerUser
);

router.route("/nonce/:walletAddress").get(getNonce);
router.route("/login").post(verifySignature);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;