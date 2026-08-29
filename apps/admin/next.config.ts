import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@sevazo/types',
    '@sevazo/validation',
    '@sevazo/api-client',
    '@sevazo/ui',
  ],
  devIndicators: false,
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60,
    pagesBufferLength: 100,
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
