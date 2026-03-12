import express from "express";
import { protect } from "../middleware/auth.js";
import {
  register,
  verifyEmail,
  login,
  getMe,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);

export default router;
