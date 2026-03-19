import jwt from 'jsonwebtoken';
import { hasAccess } from '../utils/authUtils.js';
// protects routes

export const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token exists in the Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from string "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user info to the request object so controllers can use it
            req.user = decoded;

            next(); // Move to the actual controller
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401).json({ error: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ error: "Not authorized, no token provided" });
    }
};

// Restricts access to certain roles (e.g., ADMIN only)
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // If 'protect' failed or was skipped, it won't set req.user.
        if (!req.user) {
            return res.status(401).json({
                status: "fail",
                message: "You are not logged in. Please log in to get access."
            });
        }
        // Check if the user's role is in the allowedRoles array
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "fail",
                message: "You do not have permission to perform this action"
            });
        }

        next();
    };
};

// Checks if the user is an admin or the owner of the resource (like their own profile)
export const isOwnerOrAdmin = (req, res, next) => {
    // Get the email from the URL (e.g., /profile/user@test.com)
    const { email } = req.params;

    // Always check if req.user exists before accessing its properties to avoid crashes
    if (!req.user) {
        return res.status(401).json({
            status: "fail",
            message: "Authentication required."
        });
    }

    // Run the logic from our Utils to check if the requester has access to this resource
    if (hasAccess(req.user, email)) {
        return next(); // Permission granted, move to controller
    }

    // Permission denied
    return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to manage this account."
    });
};