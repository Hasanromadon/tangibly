"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // Company data
    companyName: "",
    npwp: "",
    phone: "",
    email: "",
    address: "",
    // Admin user data
    fullName: "",
    userEmail: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setErrors({ agreeTerms: "You must agree to the terms and conditions" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: {
            name: formData.companyName,
            npwp: formData.npwp,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
          },
          user: {
            fullName: formData.fullName,
            email: formData.userEmail,
            password: formData.password,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token using auth context
        // The AuthProvider will handle localStorage and redirects
        window.location.href = "/asset-management";
      } else {
        if (data.details) {
          // Handle validation errors
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((error: { path: string[]; message: string }) => {
            const field = error.path.join(".");
            fieldErrors[field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Registration failed" });
        }
      }
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const formatNPWP = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Format as XX.XXX.XXX.X-XXX.XXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5)
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8)}`;
    if (numbers.length <= 12)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9, 12)}.${numbers.slice(12, 15)}`;
  };

  const handleNPWPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNPWP(e.target.value);
    setFormData(prev => ({ ...prev, npwp: formatted }));
    if (errors.npwp) {
      setErrors(prev => ({ ...prev, npwp: "" }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-600 p-3">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your company account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start managing your assets with Tangibly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* Company Information */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Company Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="PT. Your Company Name"
                    />
                    {errors["company.name"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["company.name"]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="npwp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    NPWP *
                  </label>
                  <div className="mt-1">
                    <input
                      id="npwp"
                      name="npwp"
                      type="text"
                      required
                      value={formData.npwp}
                      onChange={handleNPWPChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="XX.XXX.XXX.X-XXX.XXX"
                      maxLength={20}
                    />
                    {errors["company.npwp"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["company.npwp"]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="+62 or 08xx-xxxx-xxxx"
                    />
                    {errors["company.phone"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["company.phone"]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Email *
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="info@yourcompany.co.id"
                    />
                    {errors["company.email"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["company.email"]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Address *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="Company full address"
                    />
                    {errors["company.address"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["company.address"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin User Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Administrator Account
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="Your full name"
                    />
                    {errors["user.fullName"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["user.fullName"]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="userEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </label>
                  <div className="mt-1">
                    <input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      required
                      value={formData.userEmail}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="your.email@yourcompany.co.id"
                    />
                    {errors["user.email"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["user.email"]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password *
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="Enter strong password"
                    />
                    {errors["user.password"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["user.password"]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password *
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="agreeTerms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-sm text-red-600">{errors.agreeTerms}</p>
            )}

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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    30-Day Free Trial
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Start with a 30-day free trial. No credit card required.
                      Full access to all asset management features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
