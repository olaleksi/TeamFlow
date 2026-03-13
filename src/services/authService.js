import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import { sendVerificationEmail } from './emailService.js';

// Creating authservice class for handling authorization(register & login)
class AuthService {
    static async createUser(data) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error("Email already registered");
        }

        const hashedpassword = await hashPassword(data.password);

        // Create user with hashed password
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedpassword,
                isVerified: false,
                emailToken: null,
                role: data.role || "USER" // Fix: Use "USER" to match Role enum
            }
        });

        // Generates a unique token for email verification
        const token = generateToken({ id: user.id, email: user.email }, '1d'); // Token valid for 1 day

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { emailToken: token }
        });

        sendVerificationEmail(data.email, token);

        return updatedUser; // returns updated user with emailToken for verification
    }

    // Login with verification check
    static async loginUser(email, password) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid password!");
        }

        // Generate token for login
        const token = generateToken({ id: user.id, role: user.role }, '1d');

        return { user, token };
    }

    // Method to get all users
    static async getAllUsers() {
        return await prisma.user.findMany();
    }

    // Method to find a specific user
    static async getUserByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    // Method to update a user
    static async updateUser(id, data) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }

    // Method to delete a user
    static async deleteUser(id) {
        return await prisma.user.delete({
            where: { id }
        });
    }

    // Method for email verification
    static async verifyEmail(token) {
        const user = await prisma.user.findFirst({ where: { emailToken: token } });

        if (!user) {
            throw new Error("Invalid or expired token");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                emailToken: null // Prevents reuse
            }
        });

        return user; // Return the user for controller
    }
}
export default AuthService;