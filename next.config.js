/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Deshabilitar Strict Mode
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/public/auth/:path*',
        destination: 'http://localhost:8080/api/public/auth/:path*',
      },
      {
        source: '/api/auth/login',
        destination: 'http://localhost:8080/api/public/auth/signin',
      },
      {
        source: '/api/appraisal/:path*',
        destination: 'http://localhost:8080/api/appraisal/:path*',
      },
      {
        source: '/api/n8n/recepcion-datos-inmueble',
        destination: 'http://localhost:5678/webhook-test/recepcion-datos-inmueble',
      },
    ];
  },
};

module.exports = nextConfig;
