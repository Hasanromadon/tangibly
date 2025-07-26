#!/usr/bin/env node

// Simple test runner for development
import { execSync } from "child_process";

try {
  console.log("🧪 Running tests...\n");

  // Run Jest with specific configuration
  const result = execSync("npx jest --no-watch --passWithNoTests", {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ Tests completed successfully!");
} catch (error) {
  console.error("\n❌ Tests failed!");
  process.exit(1);
}
