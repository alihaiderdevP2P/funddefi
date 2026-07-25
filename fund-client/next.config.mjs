/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["localhost", "127.0.0.1"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Avoid PackFileCacheStrategy gzip OOM during long `next dev` sessions (Windows/low RAM)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          maxAsyncRequests: 12,
          maxInitialRequests: 8,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
