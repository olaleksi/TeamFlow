import express from "express";
import { protect, restrictTo, isOwnerOrAdmin} from "../middleware/auth.js";
import { getProfile, updateProfile, searchUser } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

// Get user profile
router.get( "/profile", getProfile);

// Update user profile
router.patch( "/profile", isOwnerOrAdmin, updateProfile);

// Search users by email (for adding to projects)
router.get("/search", restrictTo("ADMIN"), searchUser);

export default router;
