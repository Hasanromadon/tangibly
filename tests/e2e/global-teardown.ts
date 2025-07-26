async function globalTeardown() {
  // Global teardown that runs once after all tests
  console.log("Starting global teardown...");

  // Cleanup test database
  // Cleanup any global resources

  console.log("Global teardown completed");
}

export default globalTeardown;
