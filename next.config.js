/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff'        },
          { key: 'X-Frame-Options',            value: 'DENY'           },
          { key: 'X-XSS-Protection',           value: '1; mode=block'  },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias.canvas   = false;
      config.resolve.alias.encoding = false;
    }
    config.module = config.module ?? {};
    config.module.rules = config.module.rules ?? [];
    config.module.rules.push({
      test: /node_modules\/pdfjs-dist/,
      resolve: {
        fullySpecified: false,
      },
    });
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      /Critical dependency: the request of a dependency is an expression/,
      /Critical dependency: require function is used in a way/,
    ];
    return config;
  },
  serverExternalPackages: ['pdfjs-dist'],
};
module.exports = nextConfig;
