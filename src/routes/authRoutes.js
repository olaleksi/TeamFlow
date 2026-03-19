import express from "express";
import {  register, login, verifyEmail } from "../controllers/authController.js";

const router = express.Router();


/** ----PUBLIC ROUTES ---- (No token required)
   Mainly User registration route 
*/
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

export default router;