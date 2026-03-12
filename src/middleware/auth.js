import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// Protect routes - verify user is authenticated
const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to access this resource.",
        401,
      ),
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401),
      );
    }

    // Check if user is verified (except for verification route)
    if (!user.isVerified && req.originalUrl !== "/api/auth/verify-email") {
      return next(new AppError("Please verify your email first.", 401));
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Your token has expired. Please log in again.", 401),
      );
    }
    return next(error);
  }
});

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }
    next();
  };
};

export { protect, restrictTo };
