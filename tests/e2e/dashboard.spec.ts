import { test, expect } from "@playwright/test";

test.describe("Dashboard Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for dashboard tests
    await page.addInitScript(() => {
      localStorage.setItem("token", "mock-jwt-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "user-1",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "admin",
        })
      );
    });
  });

  test("should display dashboard when authenticated", async ({ page }) => {
    await page.goto("/dashboard");

    // Check if dashboard content is displayed
    await expect(page.locator("text=Dashboard")).toBeVisible();
    await expect(page.locator("text=Welcome")).toBeVisible();
  });

  test("should navigate to asset management", async ({ page }) => {
    await page.goto("/dashboard");

    // Click asset management link
    await page.click("text=Asset Management");

    // Should navigate to asset management page
    await expect(page).toHaveURL("/dashboard/asset-management");
    await expect(page.locator("text=Assets")).toBeVisible();
  });

  test("should display user menu", async ({ page }) => {
    await page.goto("/dashboard");

    // Click user avatar/menu
    await page.click('[data-testid="user-menu"]');

    // Check if user menu is displayed
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator("text=Settings")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    await page.goto("/dashboard");

    // Open user menu and click logout
    await page.click('[data-testid="user-menu"]');
    await page.click("text=Logout");

    // Should redirect to login page
    await expect(page).toHaveURL("/auth/login");

    // Check if localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
  });
});
