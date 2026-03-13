import AuthService from "../services/authService";
import { restrictAccess } from "../middleware/validation.js";

// Gets user info by User email
export async function getUserProfile(req, res) {
    try {
        // Denies access if not admin or user
        if (req.user.role !== "ADMIN" && req.user.id !== user.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const user = await AuthService.getUserByEmail(req.params.email);

        const { password, emailToken, ...sanitizedUser } = user; //Hides sensitive info

        res.status(200).json({
            success: true,
            user: sanitizedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Gets all user (admin only)
export async function getAllUsers(req, res) {
    try {

        // Restrict access to admin only (before DB call)
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Access denied" });
        }

        const users = await AuthService.getAllUsers(); // DB call

        const sanitizedUsers = users.map(({ password, emailToken, ...user }) => user); // Hides sensitive info

        res.status(200).json({
            success: true,
            users: sanitizedUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update user (admin or user themselves)
export async function updateUser(req, res) {
    try {
        //  Denies update access if not user or admin
        if (req.user.role !== "ADMIN" && req.user.id !== user.id) {
            return res.status(403).json({ error: "Operation requested denied" });
        }

        const user = await AuthService.updateUser(req.params.id, req.body);

        const { password, emailToken, ...sanitizedUser } = user;

        res.status(200).json({
            success: true,
            user: sanitizedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Delete user (admin only)
export async function deleteUser(req, res) {
    try {

        // Restricts unauthorized user
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to perform the requested operation" });
        }

        // Prevents admin from deleying themselves
        if (req.params.id === req.params.id) {
            return res.status(400).json({ error: "Admin can't delete themselves" });
        }

        const user = await AuthService.deleteUser(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}



// Get user role by user ID
export async function getUserRole(req, res) {
    try {
        const user = await AuthService.findById(req.params.id);
        if(!user) {
            return res.status(404).json({error: "User not found"});
        }

        res.json({role: user.role});
        } catch (err) {
            res.status(400).json({error: err.message});
    }
};

// Get user verification status
export async function getUserStatus(req, res) {
    try {
        const user = await AuthService.findById(req.params.id);
        if(!user) {
            return res.status(404).json({error: "User not found"});
        }

        res.json({isVerified: user.isVerified});
        } catch (err) {
            res.status(400).json({error: err.message});
    }
};

