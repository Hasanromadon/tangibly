"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApiService } from "@/services/auth-api";
import { User, Company, Permission, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  login: (token: string, user: User, company: Company) => void;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/accept-invitation",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/",
];

// Routes that require specific roles
const ROLE_ROUTES = {
  "/asset-management/users": ["admin", "super_admin"],
  "/asset-management/settings": ["admin", "super_admin"],
  "/asset-management/reports": ["admin", "manager", "super_admin"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedCompany = localStorage.getItem("company");

    if (storedToken && storedUser && storedCompany) {
      try {
        const userData = JSON.parse(storedUser);
        const companyData = JSON.parse(storedCompany);
        setToken(storedToken);
        setUser(userData);
        setCompany(companyData);
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("company");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect logic based on auth state and current route
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      const isAuthRoute = pathname.startsWith("/auth/");

      if (!user && !isPublicRoute) {
        // User not authenticated and trying to access protected route
        router.push("/auth/login");
      } else if (user && isAuthRoute) {
        // User authenticated but on auth page, redirect to dashboard
        router.push("/asset-management");
      } else if (user && !isPublicRoute) {
        // Check role-based access
        const requiredRoles = ROLE_ROUTES[pathname as keyof typeof ROLE_ROUTES];
        if (requiredRoles && !requiredRoles.includes(user.role)) {
          // User doesn't have required role, redirect to dashboard
          router.push("/asset-management");
        }
      }
    }
  }, [user, pathname, isLoading, router]);

  const login = (newToken: string, newUser: User, newCompany: Company) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("company", JSON.stringify(newCompany));
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate server-side session
      if (token) {
        await authApiService.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage and state regardless of API success
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      setToken(null);
      setUser(null);
      setCompany(null);
      router.push("/auth/login");
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return (
      user.permissions.includes(permission) || user.permissions.includes("all")
    );
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const value = {
    user,
    company,
    token,
    login,
    logout,
    isLoading,
    hasPermission,
    isRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermissions?: Permission[],
  requiredRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: T) {
    const { user, hasPermission, isRole, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && user) {
        // Check permissions
        if (requiredPermissions && !requiredPermissions.every(hasPermission)) {
          router.push("/asset-management");
          return;
        }

        // Check roles
        if (requiredRoles && !requiredRoles.some(role => isRole(role))) {
          router.push("/asset-management");
          return;
        }
      }
    }, [user, isLoading, hasPermission, isRole, router]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    if (!user) {
      return null; // Will be redirected by AuthProvider
    }

    // Check permissions and roles
    if (requiredPermissions && !requiredPermissions.every(hasPermission)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Access Denied
            </h1>
            <p className="mb-4 text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
            <button
              onClick={() => router.push("/asset-management")}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    if (requiredRoles && !requiredRoles.some(role => isRole(role))) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Access Denied
            </h1>
            <p className="mb-4 text-gray-600">
              Your role doesn&apos;t have access to this page.
            </p>
            <button
              onClick={() => router.push("/asset-management")}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Component for role-based rendering
export function RoleGuard({
  children,
  roles,
  permissions,
  fallback,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  fallback?: React.ReactNode;
}) {
  const { user, hasPermission, isRole } = useAuth();

  if (!user) {
    return fallback || null;
  }

  // Check roles
  if (roles && !roles.some(role => isRole(role))) {
    return fallback || null;
  }

  // Check permissions
  if (
    permissions &&
    !permissions.every(permission => hasPermission(permission))
  ) {
    return fallback || null;
  }

  return <>{children}</>;
}
