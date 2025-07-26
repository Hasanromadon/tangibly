import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
  },

  // Strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
