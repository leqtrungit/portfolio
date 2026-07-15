const MEDIA_BASE_URL =
  process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";
const BLOG_API_BASE_URL =
  process.env.BLOG_API_BASE_URL ?? "http://localhost:8080/api/v1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@new-portfolio/profile-schema"],
  turbopack: {
    root: new URL("../..", import.meta.url).pathname,
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${MEDIA_BASE_URL}/:path*`,
      },
      {
        source: "/api/v1/analytics/track",
        destination: `${BLOG_API_BASE_URL}/analytics/track`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "lequoctrung.id.vn" }],
        destination: "https://lequoctrung.vn/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
