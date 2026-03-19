import AuthService from "../services/authService.js";
import { validateEmail, validatePassword } from "../middleware/validation.js";

// Registers new user
export async function register(req, res) {
    try {
        // Extracts fields needed for registration from req.body.
        const { email, password: inputPassword, firstName, lastName, role } = req.body;

        // RUN VALIDATIONS FIRST (Before calling the service)
        if (!email) return res.status(400).json({ error: "Email is missing" });

        // Pass the extracted variables to the Service, not the whole req.body
        const user = await AuthService.registerUser({
            email,
            password: inputPassword,
            firstName,
            lastName,
            role
        });

        // Sanitize and Respond
        const { password, emailToken, ...sanitizedUser } = user;

        return res.status(201).json({
            success: true,
            user: sanitizedUser
        });

    } catch (err) {
        // If it's a "User exists" error, send 400. Otherwise, send 500.
        const statusCode = err.message.includes("exists") ? 400 : 500;
        res.status(statusCode).json({ error: err.message });
        }
    }

//  Login user with token generation and verification check

export async function login(req, res) {
    try {

        const { email, password } = req.body;

        const result = await AuthService.loginUser(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

// Logic to send verification email and verify user email
export async function verifyEmail(req,res) {
    try {
        const {token} = req.query; // Retrieves token from query parameters
        if (!token) {
            return res.status(400).json({ error: "Token is missing" });
        }

        await AuthService.verifyEmail(token);

        res.json({message: "Email verified successfully"});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}