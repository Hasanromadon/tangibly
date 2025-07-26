import { http, HttpResponse } from "msw";
import {
  createMockUser,
  createMockCompany,
  createMockAsset,
} from "../test-helpers";

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", () => {
    const user = createMockUser();
    const company = createMockCompany();

    return HttpResponse.json({
      success: true,
      user,
      company,
      token: "mock-jwt-token",
    });
  }),

  http.post("/api/auth/register", () => {
    const user = createMockUser();
    const company = createMockCompany();

    return HttpResponse.json(
      {
        message: "Registration successful",
        user,
        company,
      },
      { status: 201 }
    );
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  http.get("/api/auth/me", () => {
    const user = createMockUser();
    const company = createMockCompany();

    return HttpResponse.json({
      user,
      company,
    });
  }),

  // User endpoints
  http.get("/api/users", () => {
    return HttpResponse.json({
      users: [
        createMockUser({ id: "user-1", email: "user1@test.com" }),
        createMockUser({ id: "user-2", email: "user2@test.com" }),
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      user: createMockUser({ id }),
    });
  }),

  // Company endpoints
  http.get("/api/companies", () => {
    return HttpResponse.json({
      companies: [createMockCompany()],
    });
  }),

  http.get("/api/companies/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      company: createMockCompany({ id }),
    });
  }),

  // Asset endpoints
  http.get("/api/assets", () => {
    return HttpResponse.json({
      assets: [
        createMockAsset({ id: "asset-1", name: "Laptop 1" }),
        createMockAsset({ id: "asset-2", name: "Laptop 2" }),
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/assets/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      asset: createMockAsset({ id }),
    });
  }),

  http.post("/api/assets", async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json(
      {
        asset: createMockAsset(data as Record<string, unknown>),
      },
      { status: 201 }
    );
  }),

  http.put("/api/assets/:id", async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();
    return HttpResponse.json({
      asset: createMockAsset({ id, ...(data as Record<string, unknown>) }),
    });
  }),

  http.delete("/api/assets/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      message: `Asset ${id} deleted successfully`,
    });
  }),

  // Health check
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }),

  // Error handlers for testing error scenarios
  http.get("/api/error/500", () => {
    return HttpResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }),

  http.get("/api/error/404", () => {
    return HttpResponse.json({ error: "Not Found" }, { status: 404 });
  }),

  http.get("/api/error/401", () => {
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
];
