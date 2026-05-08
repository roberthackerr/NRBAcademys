/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },  
}

export default nextConfig  // Changed from 'nextConfigs' to 'nextConfig'