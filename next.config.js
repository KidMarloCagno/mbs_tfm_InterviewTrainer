/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
