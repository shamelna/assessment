/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable full functionality
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: false,
  // Remove distDir to use default .next folder
}

module.exports = nextConfig
