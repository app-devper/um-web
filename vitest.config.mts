import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    env: { NEXT_PUBLIC_API_URL: "https://um-api.invalid" },
  },
});
