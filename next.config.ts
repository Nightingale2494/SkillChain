import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: ["lucide-react", "framer-motion", "recharts"] },
};

export default withSentryConfig(nextConfig, { org: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT, silent: !process.env.CI }, { hideSourceMaps: true, widenClientFileUpload: true });
