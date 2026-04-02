import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
