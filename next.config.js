/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // 🔥 ADD THIS (Banner Grabbing fix)
  poweredByHeader: false,

  // ✅ Clickjacking + Security Headers
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

          // 🔥 ADD BELOW (Security Headers Missing fix)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ✅ Required for production/server tracing
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;