/**
 * Authentication Utilities
 * Core authentication functions for token management and password handling
 */
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/constants/config";

/**
 * Password hashing and verification
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWT token management
 */
export function generateToken(
  payload: object,
  expiresIn: string | number = AUTH_CONFIG.TOKEN_EXPIRY
): string {
  return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
    expiresIn,
  } as SignOptions);
}

export function verifyToken(token: string): unknown {
  try {
    return jwt.verify(token, AUTH_CONFIG.JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Email validation utility
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
