import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Proxy /api/* requests to the FastAPI backend.
  // In production, Nginx handles this. In development, Next.js rewrites do it.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://backend:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
