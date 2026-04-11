import { Router } from "express";
import { getAllReports, reportImage, updateReportStatus } from "../Controllers/report.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/admin.middleware.js";


const router = Router();

router.use(verifyJWT);

router.route("/").post(reportImage)
router.route("/").get(isAdmin, getAllReports)
router.route("/:reportId/status").patch(isAdmin, updateReportStatus)

export default router;