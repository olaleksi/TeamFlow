import jwt from 'jsonwebtoken';

// logic for generating token
export const generateToken = (payload) => {
    return jwt.sign(payload,  
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};