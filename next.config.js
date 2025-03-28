/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled for socket.io to work properly
  swcMinify: true,
};

module.exports = nextConfig; 