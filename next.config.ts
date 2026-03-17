import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ricambixstufe.it",
        pathname: "/ricambixstufe/**",
      },
    ],
  },
};

export default nextConfig;
