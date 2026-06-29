const MEDIA_BASE_URL =
  process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";

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
