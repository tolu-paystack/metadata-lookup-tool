/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Important for Docker deployments
  env: {
    // You can add public environment variables here that are safe to expose
  },
};

module.exports = nextConfig;
