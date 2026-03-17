/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdfjs-dist uses canvas as an optional dependency — ignore it
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },
};

module.exports = nextConfig;
