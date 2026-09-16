import { defineConfig } from "vitest/config";

// Unit tests run independently of the Cloudflare deployment plugins.
export default defineConfig({
	resolve: { tsconfigPaths: true },
});
