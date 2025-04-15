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
      ],
    },
  };
  
  export default nextConfig;
  