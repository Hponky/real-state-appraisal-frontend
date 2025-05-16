/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/n8n/:path*',
        destination: 'http://localhost:5678/webhook-test/recepcion-datos-inmueble/',
      },
    ];
  },
};

module.exports = nextConfig;
