import { Router } from "express";
import { getCurrentUser, getUserPublicProfile, getUsersByWallets, updateProfile, submitKyc } from "../Controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";

const router = Router();

router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/me").patch(
    verifyJWT,
    upload.fields([
        { name: "profileImage", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    updateProfile
);
router.route("/batch").post(getUsersByWallets);
router.route("/profile/:walletAddress").get(getUserPublicProfile);
router.route("/me/kyc").post(
    verifyJWT,
    upload.fields([
        {name: "govIdImage", maxCount: 1},
        {name: "selfieWithGovId", maxCount: 1}
    ]),
    submitKyc
);

export default router;