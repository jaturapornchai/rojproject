import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/rojproject',
  assetPrefix: '/rojproject',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/rojproject',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
