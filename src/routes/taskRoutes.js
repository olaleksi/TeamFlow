import express from "express";
import { protect } from "../middleware/auth.js";
// Import controller functions
import {
  createTask,
  assignTask,
  updateTaskStatus
} from "../controllers/taskController.js";

const router = express.Router();

// protect all task routes
router.use(protect);

/*
CREATE TASK
POST /tasks
*/
router.post("/:projectId/tasks", createTask);

/*
ASSIGN TASK
PATCH /tasks/assign
*/
router.patch("/assign", assignTask);

/*
UPDATE TASK STATUS
PATCH /tasks/:id/status
*/
router.patch("/:id/updateTask", updateTaskStatus);

export default router;