/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // ✅ Clickjacking Protection (IMPORTANT)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  // ✅ Required for production/server tracing
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;