import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["localhost", "2eh.net", "api.2eh.net"],
    unoptimized: true,
  },
};

export default nextConfig;
