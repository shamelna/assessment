/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable full functionality
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: false,
  // Remove distDir to use default .next folder
  
  // Add build optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Suppress build warnings for missing env vars
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder',
  }
}

module.exports = nextConfig
