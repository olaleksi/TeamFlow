import express from "express";
import {
  getProjectLogs,
  getTaskLogs
} from "../controllers/activityLogController.js";

const router = express.Router();

router.get("/project/:projectId", getProjectLogs);
router.get("/task/:taskId", getTaskLogs);

export default router;