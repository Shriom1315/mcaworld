/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  },
  // Disable static export for dynamic routes with Firebase real-time features
  output: undefined
}

module.exports = nextConfig