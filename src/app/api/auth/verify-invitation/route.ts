import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/database/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface InvitationPayload {
  invitationId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Verify JWT token
    let payload: InvitationPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as InvitationPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.userInvitation.findUnique({
      where: {
        id: payload.invitationId,
        isAccepted: false,
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
        inviter: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already accepted" },
        { status: 404 }
      );
    }

    // Check if invitation is expired (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (invitation.createdAt < sevenDaysAgo) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        companyName: invitation.company.name,
        invitedBy:
          `${invitation.inviter.firstName} ${invitation.inviter.lastName}`.trim(),
      },
    });
  } catch (error) {
    console.error("Verify invitation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
