import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}

export async function verifyPassword(p: string, h: string) {
  return bcrypt.compare(p, h);
}

export function signToken(payload: object) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}


