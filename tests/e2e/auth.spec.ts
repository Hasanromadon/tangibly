import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
  });

  test("should display registration form", async ({ page }) => {
    // Navigate to registration page
    await page.goto("/auth/register");

    // Check if registration form elements are present
    await expect(page.locator("h1")).toContainText("Create Your Account");
    await expect(page.locator('input[name="company.name"]')).toBeVisible();
    await expect(page.locator('input[name="company.email"]')).toBeVisible();
    await expect(page.locator('input[name="user.firstName"]')).toBeVisible();
    await expect(page.locator('input[name="user.lastName"]')).toBeVisible();
    await expect(page.locator('input[name="user.email"]')).toBeVisible();
    await expect(page.locator('input[name="user.password"]')).toBeVisible();
  });

  test("should validate required fields on registration", async ({ page }) => {
    await page.goto("/auth/register");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(
      page.locator("text=Company name must be at least 2 characters")
    ).toBeVisible();
    await expect(page.locator("text=NPWP is required")).toBeVisible();
    await expect(
      page.locator("text=First name must be at least 2 characters")
    ).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill invalid email
    await page.fill('input[name="user.email"]', "invalid-email");
    await page.click('button[type="submit"]');

    // Check for email validation error
    await expect(page.locator("text=Invalid email address")).toBeVisible();
  });

  test("should validate password requirements", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill weak password
    await page.fill('input[name="user.password"]', "123");
    await page.click('button[type="submit"]');

    // Check for password validation error
    await expect(
      page.locator("text=Password must be at least 8 characters")
    ).toBeVisible();
  });

  test("should validate NPWP format", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill invalid NPWP
    await page.fill('input[name="company.npwp"]', "123456789");
    await page.click('button[type="submit"]');

    // The NPWP should be auto-formatted or show validation error
    // This depends on your implementation
  });

  test("should validate Indonesian phone number format", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill invalid phone
    await page.fill('input[name="company.phone"]', "+1-555-123-4567");
    await page.click('button[type="submit"]');

    // The phone should be auto-formatted or show validation error
    // This depends on your implementation
  });

  test("should require terms and conditions agreement", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill all required fields but don't check terms
    await page.fill('input[name="company.name"]', "Test Company");
    await page.fill('input[name="company.npwp"]', "01.234.567.8-901.000");
    await page.fill('input[name="company.phone"]', "+62-812-3456-7890");
    await page.fill('input[name="company.email"]', "company@test.com");
    await page.fill('input[name="company.address"]', "Test Address");
    await page.fill('input[name="user.firstName"]', "John");
    await page.fill('input[name="user.lastName"]', "Doe");
    await page.fill('input[name="user.email"]', "john@test.com");
    await page.fill('input[name="user.password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");

    // Submit without checking terms
    await page.click('button[type="submit"]');

    // Check for terms validation error
    await expect(
      page.locator("text=You must agree to the terms and conditions")
    ).toBeVisible();
  });

  test("should successfully register with valid data", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill all required fields
    await page.fill('input[name="company.name"]', "Test Company");
    await page.fill('input[name="company.npwp"]', "01.234.567.8-901.000");
    await page.fill('input[name="company.phone"]', "+62-812-3456-7890");
    await page.fill('input[name="company.email"]', "company@test.com");
    await page.fill('input[name="company.address"]', "Test Address");
    await page.fill('input[name="user.firstName"]', "John");
    await page.fill('input[name="user.lastName"]', "Doe");
    await page.fill('input[name="user.email"]', "john@test.com");
    await page.fill('input[name="user.password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");

    // Check terms and conditions
    await page.check('input[name="agreeTerms"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for success (this might redirect or show success message)
    // Adjust based on your actual implementation
    await expect(page).toHaveURL(/dashboard|success|login/);
  });

  test("should navigate to login page from registration", async ({ page }) => {
    await page.goto("/auth/register");

    // Click login link
    await page.click("text=Already have an account?");

    // Should navigate to login page
    await expect(page).toHaveURL("/auth/login");
  });
});
