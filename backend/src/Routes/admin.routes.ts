import { Router } from "express";
import { addNewAdmin, getAllUsers, getFlaggedImages, getPendingUsers, warnUser } from "../Controllers/admin.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, isAdmin)

router.route("/add-new-admin").post(addNewAdmin);
router.route("/pending-users").get(getPendingUsers)
router.route("all-users").get(getAllUsers)
router.route("flagged-images").get(getFlaggedImages)
router.route("/warn-user/:walletAddress").patch(warnUser);


export default router;