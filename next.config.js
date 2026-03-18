/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hide the Next.js Dev Tools button (the "N" in the corner during dev)
  devIndicators: false,

  // Security headers
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
      // pdfjs-dist uses canvas as an optional dependency — suppress it
      config.resolve.alias.canvas   = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },
};

module.exports = nextConfig;
