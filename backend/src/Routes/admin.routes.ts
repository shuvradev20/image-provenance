import { Router } from "express";
import { adminLogin, 
    createAdmin, 
    getCurrentAdmin,
    getAdminDashboardStats,
    refreshAdminToken,
    adminLogout,
    getUsers,
    getPendingKycUsers,
    approveKyc,
    rejectKyc,
    getAdmins,
    deleteAdmin,
    getUserById
} from "../Controllers/admin.controller.js";
import { verifyAdmin, isSuperAdmin } from "../Middlewares/adminAuth.middleware.js";

const router = Router();

router.route("/sessions").post(adminLogin);
router.route("/sessions/refresh").post(refreshAdminToken);
router.use(verifyAdmin);
router.route("/me").get(getCurrentAdmin);
router.route("/sessions").delete(adminLogout);
router.route("/dashboard-stats").get(getAdminDashboardStats);
router.route("/pending-kyc").get(getPendingKycUsers);
router.route("/users").get(getUsers);
router.route("/users/:id").get(getUserById);
router.route("/approve-kyc").post(approveKyc);
router.route("/reject-kyc").post(rejectKyc);
router.route("/create").post(isSuperAdmin, createAdmin);
router.route("/list").get(isSuperAdmin, getAdmins);
router.route("/:id").delete(isSuperAdmin, deleteAdmin);

export default router;