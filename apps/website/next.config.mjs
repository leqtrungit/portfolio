/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@new-portfolio/profile-schema"],
  turbopack: {
    root: new URL("../..", import.meta.url).pathname,
  },
};

export default nextConfig;
