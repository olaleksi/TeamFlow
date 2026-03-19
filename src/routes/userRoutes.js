import express from "express";

const router = express.Router();

import { protect, isOwnerOrAdmin, restrictTo } from '../middleware/auth.js';
import { getUserProfile, updateUser, deleteUser, getAllUsers } from '../controllers/userController.js';

router.get('/test-route', (req, res) => res.json({ message: "The router is working!" }));
// ---- PRIVATE ROUTES ---- (Token required)
router.get('/user-profile/:email', protect, isOwnerOrAdmin, getUserProfile);
router.patch('/update-user/:email', protect, isOwnerOrAdmin, updateUser);
router.delete('/delete-user/:email', protect, isOwnerOrAdmin, deleteUser);

// ---- ADMIN ONLY ---- (Token required + ADMIN role)
router.get('/all-users', protect, restrictTo('ADMIN'), getAllUsers);

export default router;
