import { Router } from "express";
import { addNewAdmin, getAllUsers, getFlaggedImages, getPendingUsers, warnUser } from "../Controllers/admin.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/admin.middleware.js";
import { isOwner } from "../Middlewares/owner.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/admins").post(isOwner, addNewAdmin);
router.route("/users/pending").get(isAdmin, getPendingUsers);
router.route("/users").get(isAdmin, getAllUsers);
router.route("/images/flagged").get(isAdmin, getFlaggedImages);
router.route("/users/:walletAddress/warning").patch(isAdmin, warnUser);


export default router;