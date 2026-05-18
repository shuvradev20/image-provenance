import { Router } from "express";
import { adminLogin, 
    createAdmin, 
    refreshAdminToken,
    adminLogout,
    getUsers,
    getPendingKycUsers,
    approveKyc,
    rejectKyc
} from "../Controllers/admin.controller.js";
import { verifyAdmin, isSuperAdmin } from "../Middlewares/adminAuth.middleware.js";

const router = Router();

router.route("/sessions").post(adminLogin);
router.route("/sessions/refresh").post(refreshAdminToken);
router.route("/").post(verifyAdmin, isSuperAdmin, createAdmin);
router.use(verifyAdmin);
router.route("/sessions").delete(adminLogout);
router.route("/users").get(getUsers);
router.route("users/pending-kyc").get(getPendingKycUsers);
router.route("/kyc-approvals").post(approveKyc);
router.route("/kyc-rejections").post(rejectKyc);

export default router;