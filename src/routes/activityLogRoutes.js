import express from "express";
import {
  getProjectLogs,
  getTaskLogs
} from "../controllers/activityLogController.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

// protect all routes so only logged in users can have acces 
router.use(protect);

router.get("/project/:projectId", getProjectLogs);
router.get("/task/:taskId", getTaskLogs);

export default router;