/** @type {import('next').NextConfig} */
const nextConfig = {
  // Root layout lives under the [lang] dynamic segment, so unmatched URLs and
  // notFound() need a global 404 (app/global-not-found.tsx).
  experimental: { globalNotFound: true },
  images: {
    // next/image times out on the 5–9 MiB staging covers during `next dev`.
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      { protocol: "https", hostname: "blog-api.lequoctrung.id.vn", pathname: "/media/**" },
      { protocol: "https", hostname: "blog-api-staging.lequoctrung.id.vn", pathname: "/media/**" },
    ],
  },
  transpilePackages: ["@new-portfolio/profile-schema"],
  // The per-post OG image route (app/[lang]/blog/[slug]/opengraph-image.tsx)
  // reads its fonts from disk at request time, and file tracing picks up
  // sharp's native binding but not the libvips shared library it dlopen()s
  // (pnpm store path), so both are included explicitly.
  outputFileTracingIncludes: {
    // Keys are globs, so a literal "[slug]" would be read as a character class.
    "**/blog/*/opengraph-image*": [
      "./assets/fonts/**",
      "../../node_modules/.pnpm/@img+sharp-libvips-*/node_modules/@img/sharp-libvips-*/lib/**",
    ],
  },
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
