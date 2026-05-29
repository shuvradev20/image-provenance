import { Router } from "express";
import { googleAuth, linkWallet, getNonce, walletLogin, submitKyc, refreshAccessToken, logoutUser } from "../Controllers/auth.controller.js";
import { uploadLocal } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/sessions/google").post(googleAuth);
router.route("/sessions/wallet").post(walletLogin);
router.route("/sessions/refresh").post(refreshAccessToken);
router.route("/session").delete(verifyJWT, logoutUser);
router.route("/wallets/:walletAddress/nonce").get(getNonce);
router.route("/users/me/wallet").put(verifyJWT, linkWallet);
router.route("/users/me/kyc").post(
    verifyJWT,
    uploadLocal.fields([
        {name: "nidImage", maxCount: 1},
        {name: "selfieWithNid", maxCount: 1}
    ]),
    submitKyc
);

export default router;