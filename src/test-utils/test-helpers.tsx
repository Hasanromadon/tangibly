import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";

// Create a wrapper component for providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: "user-1",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "admin",
  companyId: "company-1",
  permissions: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCompany = (overrides = {}) => ({
  id: "company-1",
  name: "Test Company",
  code: "TEST01",
  address: "123 Test St",
  phone: "+62-812-3456-7890",
  taxId: "01.234.567.8-901.000",
  subscriptionPlan: "starter",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockAsset = (overrides = {}) => ({
  id: "asset-1",
  name: "Test Asset",
  code: "AST001",
  category: "Equipment",
  status: "active",
  companyId: "company-1",
  assigneeId: "user-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock localStorage
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
  };
};

// Mock fetch API
export const mockFetch = (responseData: unknown, status = 200) => {
  return jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData)),
    })
  );
};

// Wait for async operations
export const waitForRequest = (delay = 0) =>
  new Promise(resolve => setTimeout(resolve, delay));
