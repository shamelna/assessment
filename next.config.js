/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: false,
  
  webpack: (config, { isServer }) => {
    // Handle modern JavaScript syntax in dependencies
    config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx', '.json', '.mjs']
    
    // Fix for undici/fetch issues
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('undici')
    }
    
    return config
  }
}

module.exports = nextConfig
