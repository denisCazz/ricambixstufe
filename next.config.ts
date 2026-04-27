import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Limit parallel workers during static generation to avoid DB connection exhaustion
  experimental: {
    workerThreads: false,
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ricambixstufe.it",
        pathname: "/ricambixstufe/**",
      },
      // Cloudflare R2 - dominio custom
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
      // Cloudflare R2 - dominio r2.dev fallback
      {
        protocol: "https" as const,
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
