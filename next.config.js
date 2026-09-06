/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['js', 'jsx'],
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
