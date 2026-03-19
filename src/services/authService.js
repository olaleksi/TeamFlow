import {prisma} from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from './emailService.js';

// Creating authservice class for handling authorization(register & login)
class AuthService {
    static async registerUser(userData) {
        try {
            const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error("A user with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user with hashed password
        const user = await prisma.user.create({
            data: {
                    email: userData.email,
                    emailToken: null, // Initialize emailToken as null
                    password: hashedPassword,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role || "USER",
                    isVerified: false,
            }
        });


        // Generates a unique token for email verification
        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d"}); // Token valid for 7 days

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { emailToken: token }
        });

        await sendVerificationEmail(userData.email, token);

        return updatedUser; // returns updated user with emailToken for verification
        } catch (err) {
             // Logs error details in the console to know the actual issue with email sending
            console.error("SMTP/Nodemailer Error:", err);
            throw new Error("User created but verification email failed.");
        }
    }
    // Login with verification check
    static async loginUser(email, password) {
        try {
            // Finds the user by email. Throws error if not found.
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Invalid email or password");

        // STOPS UNVERIFIED USERS
        if (!user.isVerified) {
            throw new Error("Please verify your email address before logging in.");
        }

        // Compares password and ensures it matches the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new Error("Invalid email or password");

        // Generates Login Token (This one is for Session Access)
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Usually 1 day for login sessions
        );

        // Sends the user data (without the password) and the token back to the user
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token:accessToken };
        } catch (err) {
            throw new Error("Login failed: " + err.message);
        }
    }

    // Method for email verification
    static async verifyEmail(token) {
        try {
            // Verifies if the token hasn't been tampered with
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user with this token
            const user = await prisma.user.findFirst({
                where: { emailToken: token }
            });

            if (!user) {
                throw new Error("Invalid or expired verification link.");
            }

            // Updates the user: verifies them and clears the token
            return await prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    emailToken: null // Clears the token so it can't be used again
                }
            });
        } catch (err) {
            throw new Error(err.message || "Verification failed.");
        }
    }

    // Get user info by email
    static async getUserByEmail(email) {
        try {
            return await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true
            }
        });
        } catch (err) {
            throw new Error("Could not retrieve user: " + err.message);
        }
    }

    // Updates user data
    static async updateUserByEmail(email, updateData) {
        try {
            return await prisma.user.update({
                where: { email: email },
                data: updateData
            });
        } catch (err) {
            throw new Error("Could not update user: " + err.message);
        }
    }

    static async deleteUserByEmail(email) {
        try{

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error("User not found.");
            }
            return await prisma.user.delete({
                where: { email }
            });
        } catch (err) {
            throw new Error("Could not delete user: " + err.message);
        }
    }
}
export default AuthService;
