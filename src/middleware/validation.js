// Email validation middleware
export function validateEmail(req, res, next) {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
    }
    next();
}

// Password validation middleware
export function validatePassword(req, res, next) {
    const { password } = req.body;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Minimum 8 characters, at least one letter and one number
    if (!password || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one letter and one number" });
    }
    next();
}


//  role based validation
export function restrictAccess(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: "fail",  message: "Access denied!"});
        }
        next();
    };
};