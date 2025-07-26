import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { requireAuth, AuthenticatedUser } from "@/middleware/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// Get all posts
async function getPostsHandler() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(posts, "Posts retrieved successfully");
  } catch (error) {
    console.error("Get posts error:", error);
    return errorResponse("Internal server error");
  }
}

// Create post
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

async function createPostHandler(request: NextRequest) {
  try {
    const user = (request as unknown as { user: AuthenticatedUser }).user;
    const body = await request.json();

    // Validate input
    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { title, content, published = false } = validation.data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(post, "Post created successfully", 201);
  } catch (error) {
    console.error("Create post error:", error);
    return errorResponse("Internal server error");
  }
}

export const GET = getPostsHandler;
export const POST = requireAuth(createPostHandler);
