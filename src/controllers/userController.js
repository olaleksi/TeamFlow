import AuthService from "../services/authService.js";

// Gets user info by User email
export async function getUserProfile(req, res) {
    try {
        // isOwnerOrAdmin middleware already verified the permission!
        const user = await AuthService.getUserByEmail(req.params.email);
        
        if (!user) return res.status(404).json({ error: "User not found" });

        const { password, ...sanitized } = user;
        res.status(200).json({ success: true, user: sanitized });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Gets all user (admin only)
export async function getAllUsers(req, res) {
    try {
        // The 'restrictTo' middleware already verified this is an ADMIN
        const users = await AuthService.getAllUsers();

        // SANITIZE: Remove password and tokens from every user in the array
        const sanitizedUsers = users.map(({ password, emailToken, ...user }) => user);

        res.status(200).json({
            success: true,
            count: sanitizedUsers.length,
            users: sanitizedUsers
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}


// Update user (admin or user themselves)
export async function updateUser(req, res) {
    try {
        const { email } = req.params;
        const updateData = { ...req.body };

        // SECURITY: Prevent non-admins from changing roles
        if (req.user.role !== "ADMIN") {
            delete updateData.role;       // Remove 'role' if it exists in the body
            delete updateData.isVerified; // Remove other sensitive fields
        }

        // Perform the update via Service
        const updatedUser = await AuthService.updateUserByEmail(email, updateData);

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Sanitize: Never send the password back in the response
        const { password, emailToken, ...sanitizedUser } = updatedUser;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: sanitizedUser
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// Delete user (admin only)
// Example: The Delete Controller
export async function deleteUser(req, res) {
    try {
        const { email } = req.params;

        // Extra Business Rule: Admin cannot delete themselves to prevent lockouts
        if (req.user.email === email && req.user.role === "ADMIN") {
            return res.status(400).json({ message: "Admins cannot delete their own master account." });
        }

        await AuthService.deleteUserByEmail(email);
        res.status(200).json({ success: true, message: `User ${email} deleted.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

