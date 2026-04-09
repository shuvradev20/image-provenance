import { Router } from "express";
import { addNewAdmin, getAllUsers, getFlaggedImages, getPendingUsers, warnUser } from "../Controllers/admin.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/admin.middleware.js";
import { isOwner } from "../Middlewares/owner.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/add-new-admin").post(isOwner, addNewAdmin);
router.route("/pending-users").get(isAdmin, getPendingUsers);
router.route("/all-users").get(isAdmin, getAllUsers);
router.route("/flagged-images").get(isAdmin, getFlaggedImages);
router.route("/warn-user/:walletAddress").patch(isAdmin, warnUser);


export default router;