import express from "express";
import { protect } from "../middleware/auth.js";
// Import controller functions
import {
  createTask,
  assignTask,
  updateTaskStatus,
  getMyAssignedTasks,
  getProjectTasks,
  deleteTask,
  getTask
} from "../controllers/taskController.js";

const router = express.Router();

// protect all task routes
router.use(protect);



/*
CREATE TASK
POST /tasks
*/
// router.post("/:projectId/tasks", createTask);


// Get current user's tasks
router.get("/assigned/me", getMyAssignedTasks);

/*
ASSIGN TASK
PATCH /tasks/assign
*/
router.patch("/:taskId/assign", assignTask);

/*
UPDATE TASK STATUS
PATCH /:tasks/status
*/
router.patch("/:taskId/status", updateTaskStatus);


// get task by id
router.get("/:taskId", getTask)

// Delete the task
router.delete("/:taskId",deleteTask);



export default router;