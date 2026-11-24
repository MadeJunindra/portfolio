import { defineConfig, devices } from "@playwright/test";

const PORT = 4400;
// BASE_URL=https://... npm run test:e2e → uji website yang sudah online
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: BASE_URL || `http://localhost:${PORT}`, trace: "off" },
  webServer: BASE_URL
    ? undefined
    : {
        command: `node scripts/serve.mjs ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
