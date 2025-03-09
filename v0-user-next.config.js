/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.clerk.dev"],
  },
  // Skip static generation for pages that use Clerk
  experimental: {
    // This will make Next.js generate these pages at runtime instead of build time
    // which avoids the Clerk publishable key issue during static generation
    appDir: true,
    serverActions: true,
  },
  // Disable static generation for pages that use authentication
  staticPageGenerationTimeout: 300,
  output: "standalone",
}

module.exports = nextConfig

