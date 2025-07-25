import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // saat fetch('/api/deals')
        destination: 'http://localhost:5000/api/:path*' // proxy ke backend Express
      }
    ];
  }
};

export default nextConfig;
