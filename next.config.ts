import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Performance optimizations
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  experimental: {
    optimizePackageImports: [
      "@/components",
      "@/lib",
      "@/hooks",
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "framer-motion",
    ],
    // Enable modern bundling optimizations
    esmExternals: true,
  },

  // Move from experimental to root level as recommended
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],

  // Advanced webpack optimizations for bundle splitting
  webpack: (config, { isServer, dev }) => {
    // Production optimizations for client-side bundles
    if (!isServer && !dev) {
      // Split vendor chunks more granularly
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // React vendor chunk
          react: {
            name: "react-vendor",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
          },
          // UI library chunk
          ui: {
            name: "ui-vendor",
            chunks: "all",
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            priority: 30,
          },
          // Utility libraries
          utils: {
            name: "utils-vendor",
            chunks: "all",
            test: /[\\/]node_modules[\\/](axios|date-fns|zod|class-variance-authority)[\\/]/,
            priority: 20,
          },
          // Everything else
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          common: {
            minChunks: 2,
            chunks: "all",
            name: "common",
            priority: 5,
          },
        },
      };
    }

    // SVG handling for all builds
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-RateLimit-Window",
            value: "60000",
          },
        ],
      },
    ];
  },

  // Cache optimization
  async rewrites() {
    return [
      {
        source: "/health",
        destination: "/api/health",
      },
    ];
  },

  // Bundle optimization
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{member}}",
    },
    "@radix-ui/react-icons": {
      transform: "@radix-ui/react-icons/dist/{{member}}.js",
    },
  },

  // Strict mode for better development experience
  reactStrictMode: true,

  // TypeScript strict mode
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // ESLint integration
  eslint: {
    dirs: ["src"],
  },

  // Output optimization
  output: "standalone",

  // Power optimizations
  poweredByHeader: false,

  // Trailing slash handling
  trailingSlash: false,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

// Export the configuration with next-intl wrapper
export default withNextIntl(nextConfig);
