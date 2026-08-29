import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // Keep in buffer for 1 hour
    pagesBufferLength: 100, // Keep up to 100 pages in memory so they never need re-compiling
  },
  allowedDevOrigins: [
    '192.168.1.7',
    '192.168.1.7:3000',
    'localhost:3000',
    '127.0.0.1:3000',
    '*.local',
    '*.lan',
  ],
};

export default nextConfig;
