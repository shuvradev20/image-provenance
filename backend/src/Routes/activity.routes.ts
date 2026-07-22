import { Router } from "express";
import { getActivityLogs, getActivityStats } from "../Controllers/activity.controller.js";

const router = Router();

router.route("/logs").get(getActivityLogs);
router.route("/stats").get(getActivityStats);

export default router;