// next.config.js - CREAR EN LA RAÍZ DEL PROYECTO
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Configuración para Web3 y ThirdWeb
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  // ✅ Optimizaciones para Vercel
  swcMinify: true,
  reactStrictMode: true,
  
  // ✅ Variables de ambiente para el cliente
  env: {
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },
  
  // ✅ Headers para CORS (opcional)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;