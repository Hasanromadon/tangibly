"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField, CheckboxField } from "@/components/forms/FormFields";
import { loginSchema, type LoginFormData } from "@/schemas/auth-schemas";
import { useLogin } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error: unknown) {
      // Handle error without the type-unsafe error handler for now
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      form.setError("root", { message: errorMessage });
    }
  };

  const fillDemoAccount = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
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
          Sign in to Tangibly
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Asset Management System for Indonesian Companies
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {form.formState.errors.root.message}
                </div>
              )}

              <TextField
                control={form.control}
                name="email"
                label="Email address"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <TextField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between">
                <CheckboxField
                  control={form.control}
                  name="remember"
                  label="Remember me"
                />

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-3 -ml-1 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                      New to Tangibly?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/auth/register"
                    className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Create your company account
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="text-center">
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Demo Accounts
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>TMI Admin:</strong> admin@teknomai.co.id
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillDemoAccount("admin@teknomai.co.id", "password123")
                    }
                    className="ml-2 text-xs"
                  >
                    Use
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    <strong>TMI User:</strong> user@teknomai.co.id
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillDemoAccount("user@teknomai.co.id", "password123")
                    }
                    className="ml-2 text-xs"
                  >
                    Use
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    <strong>BRS Admin:</strong> admin@berkahsejahtera.co.id
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillDemoAccount(
                        "admin@berkahsejahtera.co.id",
                        "password123"
                      )
                    }
                    className="ml-2 text-xs"
                  >
                    Use
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
