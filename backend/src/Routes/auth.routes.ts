import { Router } from "express";
import { googleAuth, linkWallet, getNonce, walletLogin, refreshAccessToken, logoutUser } from "../Controllers/auth.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/sessions/google").post(googleAuth);
router.route("/sessions/wallet").post(walletLogin);
router.route("/sessions/refresh").post(refreshAccessToken);
router.route("/session").delete(verifyJWT, logoutUser);
router.route("/wallets/:walletAddress/nonce").get(getNonce);
router.route("/users/me/wallet").put(verifyJWT, linkWallet);

export default router;