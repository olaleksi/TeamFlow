import express from "express";
import {  registerUser, loginUser, verifyEmail, verifyUser } from "../controllers/userController.js";

const router = express.Router();

// User registration route
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.get("/verify-user", verifyUser);

export default router;