import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // Global setup that runs once before all tests
  console.log("Starting global setup...");
  console.log(`Test directory: ${config.projects[0]?.testDir || "unknown"}`);

  // Setup test database
  // You might want to run database migrations or seed data here

  // Setup any other global configurations
  if (process.env.NODE_ENV !== "test") {
    process.env = { ...process.env, NODE_ENV: "test" };
  }

  console.log("Global setup completed");
}

export default globalSetup;
