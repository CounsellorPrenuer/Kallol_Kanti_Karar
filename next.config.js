/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Kallol_Kanti_Karar',
  trailingSlash: true,
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
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
