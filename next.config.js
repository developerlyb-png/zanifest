/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // 🔥 Banner Grabbing fix
  poweredByHeader: false,

  // 🔥 BREACH Attack fix (IMPORTANT)
  compress: false,

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

          // 🔥 Security Headers
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