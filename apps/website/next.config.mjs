/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@new-portfolio/profile-schema"],
  turbopack: {
    root: new URL("../..", import.meta.url).pathname,
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
