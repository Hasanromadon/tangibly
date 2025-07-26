"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AcceptInvitationForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<{
    invitedBy: string;
    companyName: string;
    role: string;
    email: string;
  } | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyInvitation(token);
    } else {
      setTokenValid(false);
    }
  }, [token]);

  const verifyInvitation = async (token: string) => {
    try {
      const response = await fetch(
        `/api/auth/verify-invitation?token=${token}`
      );
      const data = await response.json();

      if (response.ok) {
        setInvitation(data.invitation);
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      console.error("Error verifying invitation:", error);
      setTokenValid(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!token) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login page with success message
        router.push("/auth/login?message=invitation-accepted");
      } else {
        setErrors({ general: data.error || "Failed to accept invitation" });
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="mx-4 w-full max-w-md p-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Invalid Invitation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This invitation link is invalid or has expired.
            </p>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Accept Invitation
            </h2>
            {invitation && (
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>{invitation.invitedBy}</strong> has invited you to
                  join <strong>{invitation.companyName}</strong> as a{" "}
                  <strong>{invitation.role}</strong>.
                </p>
                <p className="mt-1">
                  Email: <strong>{invitation.email}</strong>
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Create Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Accept Invitation & Create Account"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
