/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig; 