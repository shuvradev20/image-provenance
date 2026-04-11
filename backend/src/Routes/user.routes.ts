import { Router } from "express";
import { getCurrentUser, getUserPublicProfile, getUsersByWallets, updateProfile } from "../Controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";
const router = Router();

router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/me").patch(verifyJWT, upload.single("profileImage"), updateProfile)
router.route("/batch").post(getUsersByWallets)
router.route("/:walletAddress").get(getUserPublicProfile);


export default router;