"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  registerSchema,
  RegisterFormData,
  formatNPWP,
  formatPhoneNumber,
} from "@/schemas/auth-schemas";
import { useRegister } from "@/hooks/useAuth";
import { CompactLanguageSwitcher } from "@/components/common/language-switcher";

export default function RegisterPage() {
  const registerMutation = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      company: {
        name: "",
        npwp: "",
        phone: "",
        email: "",
        address: "",
      },
      user: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      },
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // Map the form data to the API expected format
    const apiData = {
      company: {
        name: data.company.name,
        taxId: data.company.npwp, // Map npwp to taxId
        phone: data.company.phone,
        email: data.company.email,
        address: data.company.address,
      },
      user: {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        password: data.user.password,
      },
    };
    registerMutation.mutate(apiData);
  };

  const handleNPWPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNPWP(e.target.value);
    form.setValue("company.npwp", formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue("company.phone", formatted);
  };

  return (
    <div className="bg-background flex min-h-screen">
      {/* Left side - Registration Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Language Switcher */}
          <div className="mb-6 flex justify-end">
            <CompactLanguageSwitcher />
          </div>

          <Card className="p-8">
            <div className="mb-6 text-center">
              <h1 className="text-foreground text-2xl font-bold">
                Create Your Account
              </h1>
              <p className="text-muted-foreground mt-2">
                Start managing your assets efficiently
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-foreground text-lg font-semibold">
                  Company Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...form.register("company.name")}
                    placeholder="PT. Your Company Name"
                  />
                  {form.formState.errors.company?.name && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.company.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input
                    id="npwp"
                    {...form.register("company.npwp")}
                    onChange={handleNPWPChange}
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                  />
                  {form.formState.errors.company?.npwp && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.company.npwp.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    {...form.register("company.phone")}
                    onChange={handlePhoneChange}
                    placeholder="+62 8xx-xxxx-xxxx"
                  />
                  {form.formState.errors.company?.phone && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.company.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...form.register("company.email")}
                    placeholder="company@example.com"
                  />
                  {form.formState.errors.company?.email && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.company.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Company Address</Label>
                  <Input
                    id="address"
                    {...form.register("company.address")}
                    placeholder="Full company address including street, city, postal code"
                  />
                  {form.formState.errors.company?.address && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.company.address.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin User Information */}
              <div className="space-y-4">
                <h3 className="text-foreground text-lg font-semibold">
                  Administrator Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("user.firstName")}
                      placeholder="John"
                    />
                    {form.formState.errors.user?.firstName && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.user.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("user.lastName")}
                      placeholder="Doe"
                    />
                    {form.formState.errors.user?.lastName && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.user.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Administrator Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    {...form.register("user.email")}
                    placeholder="admin@example.com"
                  />
                  {form.formState.errors.user?.email && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.user.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("user.password")}
                    placeholder="Enter a strong password"
                  />
                  {form.formState.errors.user?.password && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.user.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="Confirm your password"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={form.watch("agreeTerms")}
                  onCheckedChange={checked =>
                    form.setValue("agreeTerms", checked === true)
                  }
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>
              {form.formState.errors.agreeTerms && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.agreeTerms.message}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Right side - Marketing/Information */}
      <div className="bg-muted hidden items-center justify-center p-8 lg:flex lg:flex-1">
        <div className="max-w-md text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold">
            Powerful Asset Management
          </h2>
          <p className="text-muted-foreground mb-8">
            Streamline your asset tracking, optimize utilization, and ensure
            compliance with our comprehensive platform.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary h-6 w-6 flex-shrink-0 rounded-full" />
              <p className="text-muted-foreground text-sm">
                Real-time asset tracking and monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary h-6 w-6 flex-shrink-0 rounded-full" />
              <p className="text-muted-foreground text-sm">
                Automated depreciation calculations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary h-6 w-6 flex-shrink-0 rounded-full" />
              <p className="text-muted-foreground text-sm">
                Comprehensive reporting and analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
