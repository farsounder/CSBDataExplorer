/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module = {
      ...config.module,
      exprContextCritical: false,
    }
    return config
  },
  async redirects() {
    return [
    {
      source: '/dashboard',
      destination: '/dashboard/map',
      permanent: true,
    }]
  }
};

module.exports = nextConfig
