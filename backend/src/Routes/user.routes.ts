import { Router } from "express";
import { getCurrentUser, getUserPublicProfile, getUsersByWallets, updateProfile } from "../Controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";
const router = Router();

router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/profile/:walletAddress").get(getUserPublicProfile);
router.route("/multiple-profiles").post(getUsersByWallets)
router.route("/update-profile").patch(verifyJWT, upload.single("profileImage"), updateProfile)


export default router;