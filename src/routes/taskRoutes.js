import express from "express";

// Import controller functions
import {
  createTask,
  assignTask,
  updateTaskStatus
} from "../controllers/taskController.js";

const router = express.Router();

/*
CREATE TASK
POST /tasks
*/
router.post("/", createTask);

/*
ASSIGN TASK
PATCH /tasks/assign
*/
router.patch("/assign", assignTask);

/*
UPDATE TASK STATUS
PATCH /tasks/:id/status
*/
router.patch("/:id/status", updateTaskStatus);

export default router;