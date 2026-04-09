import { Router } from "express";
import { getAllReports, reportImage, updateReportStatus } from "../Controllers/report.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/admin.middleware.js";


const router = Router();

router.use(verifyJWT);

router.route("/submit/:hash").post(reportImage)
router.route("/all-reports").get(isAdmin, getAllReports)
router.route("/admin/status/:reportId").patch(isAdmin, updateReportStatus)

export default router;