import { verifyToken } from "../utils/jwt";
// protects routes
export async function auth(req, res, next) {
    try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No authorization header provided"});

    const token = authHeader.split(" ")[1]; // retrieves token
    const decoded = verifyToken(token); // verifies retrieved token

    req.user = decoded; // {id, role}
    next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" }); //forbids unauthorized user
    }
};