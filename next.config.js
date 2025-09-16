/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
    unoptimized: true // For better Netlify compatibility
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    esmExternals: true
  }
}

module.exports = nextConfig