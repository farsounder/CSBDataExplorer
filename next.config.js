/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    return config;
  },
  turbopack: {},
  /*async redirects() {
    return [
      {
        source: "/platform",
        destination: "/",
        permanent: true,
      },
    ];
  },*/
};

module.exports = nextConfig;
