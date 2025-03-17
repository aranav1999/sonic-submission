import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // This allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  // Add image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Disable webpack performance hints to remove warnings
  webpack: (config) => {
    config.performance = {
      ...config.performance,
      // Increase size limits
      maxAssetSize: 4 * 1024 * 1024, // 4 MiB
      maxEntrypointSize: 4 * 1024 * 1024, // 4 MiB
      // Change to 'warning' or false to not fail the build
      hints: false,
    };
    return config;
  },
};

export default nextConfig;
