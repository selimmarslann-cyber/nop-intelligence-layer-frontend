import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function hashPassword(p) {
    return bcrypt.hash(p, 10);
}
export async function verifyPassword(p, h) {
    return bcrypt.compare(p, h);
}
export function signToken(payload) {
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { expiresIn: "7d" });
}
