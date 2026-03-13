import bcrypt from 'bcryptjs';

// hash passsword logic
export  const hashPassword = async(password) => { 
    return await bcrypt.hash(password, 10);
};
// compares hashed passsword with user entered password
export const comparePassword = async(password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword);
};