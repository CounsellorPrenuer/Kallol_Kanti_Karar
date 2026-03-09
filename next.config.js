/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  distDir: 'build_output',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
