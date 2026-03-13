import AuthService from "../services/authService.js";
import { validateEmail, validatePassword } from "../middleware/validation.js";

// Registers new user
export async function register(req, res) {
    try {
        const { email, password: inputPassword, firstName, lastName, role } = req.body;
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        if (!inputPassword || !validatePassword(inputPassword)) {
            return res.status(400).json({ error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" });
        }
        if (!firstName || firstName.length < 2) {
            return res.status(400).json({ error: "First name must be at least 2 characters" });
        }
        if (!lastName || lastName.length < 2) {
            return res.status(400).json({ error: "Last name must be at least 2 characters" });
        }
        if (role && !['ADMIN', 'USER'].includes(role)) {
            return res.status(400).json({ error: "Role must be 'ADMIN' or 'USER'" });
        }

        const user = await AuthService.createUser(req.body);

        const { password, emailToken, ...sanitizedUser } = user; // Hides sensitive info

        res.status(201).json({
            success: true,
            message: "User registered. Please verify your email.",
            user: sanitizedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Login already registered user
export async function login(req, res) {
    try {

        const { email, password } = req.body;

        if (!email || !validateEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).json({ error: "Password cannot be empty and must be at least 8 characters with uppercase, lowercase, number, and special character" });
        }
        
        const { user, token } = await AuthService.loginUser(email, password);

        const { password: _, emailToken, ...sanitizedUser } = user; // Hides sensitive info(e.g., password)
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: sanitizedUser,
            token
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Logic to send verification email and verify user email
export async function verifyEmail(req,res) {
    try {
        const {token} = req.params;

        await AuthService.verifyEmail(token);

        res.json({message: "Email verified successfully"});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
}


// Verification of user
export async function verifyUser(req, res) {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }
        const user = await AuthService.verifyEmail(token);

        const { password, emailToken, ...sanitizedUser } = user;
        res.status(200).json({ // Fix to 200
            message: "Account verified",
            user: sanitizedUser
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}