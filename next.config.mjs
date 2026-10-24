/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/app", destination: "/app/index.html" }];
  },
  async headers() {
    return [
      { source: "/app/:path*", headers: [{ key: "Cache-Control", value: "no-cache" }] },
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" }
      ] }
    ];
  }
};
export default nextConfig;
