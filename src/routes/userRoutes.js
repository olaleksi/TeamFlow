import express from "express";
import { protect } from "../middleware/auth.js";
import { getProfile, updateProfile, searchUser } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

// Get user profile
router.get( "/profile", getProfile);

// Update user profile
router.patch( "/profile", updateProfile);

// Search users by email (for adding to projects)
router.get("/search", searchUser);

export default router;
