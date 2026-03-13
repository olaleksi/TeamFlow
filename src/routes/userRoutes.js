import express from "express";
import { auth } from "../middleware/auth.js"; // Assuming auth middleware exists
import { restrictAccess } from "../middleware/validation.js";
import { getUserProfile, getAllUsers, updateUser, deleteUser, getUserRole, getUserStatus } from "../controllers/userController";

const router = express.Router();

// Get user profile
router.get("/user-profile/:email", auth, getUserProfile);

// Get all users (admin only)
router.get("/all-users", auth, restrictAccess("ADMIN"), getAllUsers); // Example for admin-only

// Update user (admin only)
router.patch("/update-user/:id", auth, updateUser);

// Delete user (admin only)
router.delete("/delete-user/:id", auth, restrictAccess("ADMIN"), deleteUser);

// Get user role
router.get("/user-role/:id", auth, getUserRole);

// Get user verification status
router.get("/user-status/:id", auth, getUserStatus);