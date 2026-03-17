import express from "express";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getMyProjects,
  getProjectById,
  removeProjectMember,
  updateProject,
  updateProjectMemberRole,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

import {
  createTask,
  assignTask,
  updateTaskStatus,
} from "../controllers/taskController.js";

const router = express.Router();

router.use(protect);


router.post("/", createProject);

router.get("/", getMyProjects);

router.get("/:projectId", getProjectById);

router.patch("/:projectId", updateProject);

router.delete("/:projectId", deleteProject);

router.post("/:projectId/members", addProjectMember);

router.patch("/:projectId/members/:memberId", updateProjectMemberRole);

router.delete("/:projectId/members/:memberId", removeProjectMember);

// Project tasks
router.post('/:projectId/tasks', createTask);
router.post('/:projectId/tasks', assignTask);
router.post('/:projectId/tasks', updateTaskStatus);


export default router;
