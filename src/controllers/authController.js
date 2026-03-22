import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/database.js";
import { sendVerificationEmail} from "../services/emailService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return next(new AppError("User already exists with this email", 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate email verification token
  const emailToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailToken,
      role: "USER", // Default role
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, firstName, emailToken);
  } catch (error) {
    // If email fails, still create user but log the error
    console.error("Failed to send verification email:", error);
  }

  res.status(201).json({
    status: "success",
    message:
      "User registered successfully. Please check your email to verify your account.",
    data: {
      user: newUser,
    },
  });
});

// @desc    Verify user email
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

    // Check if token exists
  if (!token) {
    return next(new AppError("Verification token is required", 400));
  }

  // Find user with this token
  const user = await prisma.user.findFirst({
    where: { emailToken: token },
  });

// If no user found, token is invalid or expired
  if (!user) {
    return next(new AppError("Invalid or expired verification token", 400));
  }

  // Update user verification status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailToken: null, // Clear the token
    },
  });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully. You can now log in.",
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find user and include password for comparison
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if email is verified
  if (!user.isVerified) {
    return next(
      new AppError("Please verify your email before logging in", 401),
    );
  }

  // Create and send token
  createSendToken(user, 200, res);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

export { register, verifyEmail, login, getMe };
