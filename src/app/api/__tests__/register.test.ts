import { NextRequest } from "next/server";
import { POST } from "../auth/register/route";

// Mock Prisma
jest.mock("@/lib/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

// Mock auth utilities
jest.mock("@/lib/auth", () => ({
  validateNPWP: jest.fn().mockReturnValue(true),
  validatePhone: jest.fn().mockReturnValue(true),
}));

describe("/api/auth/register", () => {
  const validPayload = {
    company: {
      name: "Test Company",
      taxId: "01.234.567.8-901.000",
      phone: "+62-812-3456-7890",
      email: "company@test.com",
      address: "Test Address",
    },
    user: {
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      password: "Password123!",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user and company successfully", async () => {
    const { prisma } = await import("@/lib/database/prisma");

    // Mock database responses
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Email not exists
    (prisma.company.findUnique as jest.Mock).mockResolvedValue(null); // Company code not exists

    const mockUser = { id: "user-1", email: "john@test.com" };
    const mockCompany = { id: "company-1", name: "Test Company" };

    (prisma.$transaction as jest.Mock).mockResolvedValue({
      user: mockUser,
      company: mockCompany,
    });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData.message).toBe("Registration successful");
    expect(responseData.user).toEqual(mockUser);
    expect(responseData.company).toEqual(mockCompany);
  });

  it("should return 400 for invalid payload", async () => {
    const invalidPayload = {
      company: {
        name: "", // Empty name
        taxId: "invalid-npwp",
        phone: "invalid-phone",
        email: "invalid-email",
        address: "",
      },
      user: {
        firstName: "",
        lastName: "",
        email: "invalid-email",
        password: "123", // Too short
      },
    };

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.error).toBe("Validation failed");
    expect(responseData.details).toBeDefined();
  });

  it("should return 409 if email already exists", async () => {
    const { prisma } = await import("@/lib/database/prisma");

    // Mock existing user
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "existing-user",
      email: "john@test.com",
    });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData.error).toBe("Email address is already registered");
  });

  it("should return 400 for invalid NPWP", async () => {
    const { validateNPWP } = await import("@/lib/auth");
    (validateNPWP as jest.Mock).mockReturnValue(false);

    const { prisma } = await import("@/lib/database/prisma");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.error).toBe(
      "Invalid NPWP format. Use format: XX.XXX.XXX.X-XXX.XXX"
    );
  });

  it("should return 400 for invalid phone number", async () => {
    const { validatePhone } = await import("@/lib/auth");
    (validatePhone as jest.Mock).mockReturnValue(false);

    const { prisma } = await import("@/lib/database/prisma");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.error).toBe("Invalid Indonesian phone number format");
  });
});
