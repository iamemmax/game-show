/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dq1z5gvyi71s7.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.brandfetch.io',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.168',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.131',
        pathname: '/**',
      },

      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_MQTT_BROKER,
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'hustleback.libertydraw.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hustleback.libertydraw.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'hustleback.libertydraw.com',
        pathname: '/**',
      },

    ],
  },
  // Add WebSocket support
  webpack: (config) => {
    config.externals = [...(config.externals || []), { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }];
    return config;
  },
};

export default nextConfig;
