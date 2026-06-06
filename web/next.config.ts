import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Copilot route reads the Field Manual markdown at runtime. Trace it so it
  // ships with the serverless bundle, not just in local dev.
  outputFileTracingIncludes: {
    "/api/copilot": ["./src/content/field-manual.md"],
  },
};

export default nextConfig;
