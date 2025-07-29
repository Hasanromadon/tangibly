import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(
  payload: object,
  expiresIn: string | number = "7d"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyToken(token: string): unknown {
  try {
    return jwt.verify(token, JWT_SECRET);
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

export function generateAssetNumber(
  companyCode: string,
  categoryCode: string,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  // Generate a random 4-digit number for uniqueness
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${categoryCode}-${currentYear}-${randomNum.toString().padStart(4, "0")}`;
}

export function generateWorkOrderNumber(
  companyCode: string,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  // Generate a random 4-digit number for uniqueness
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `WO-${currentYear}-${randomNum.toString().padStart(4, "0")}`;
}

export function formatCurrency(
  amount: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  date: Date,
  locale: string = "id-ID",
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(date);
}

export function calculateDepreciation(
  purchaseCost: number,
  salvageValue: number,
  usefulLifeYears: number,
  method: "straight_line" | "declining_balance" | "units_of_production",
  unitsProduced?: number,
  totalUnitsExpected?: number
): number {
  switch (method) {
    case "straight_line":
      return (purchaseCost - salvageValue) / usefulLifeYears;

    case "declining_balance":
      // Using double declining balance method (2 / useful life)
      const rate = 2 / usefulLifeYears;
      return purchaseCost * rate;

    case "units_of_production":
      if (!unitsProduced || !totalUnitsExpected) {
        throw new Error(
          "Units produced and total units expected are required for units of production method"
        );
      }
      return (
        ((purchaseCost - salvageValue) / totalUnitsExpected) * unitsProduced
      );

    default:
      throw new Error(`Unknown depreciation method: ${method}`);
  }
}

export function generateQRCode(assetData: {
  assetNumber: string;
  name: string;
  category: string;
  location: string;
}): string {
  return JSON.stringify(assetData);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
