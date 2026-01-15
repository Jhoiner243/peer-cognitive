import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
