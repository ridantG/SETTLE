// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // THIS IS THE DEFINITIVE FIX:
  // We are adding a second trusted hostname to our list.
  images: {
    remotePatterns: [
      {
        // Rule for Supabase Storage images
        protocol: 'https',
        hostname: 'epirjfgmokfymakshfkd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // NEW RULE for Unsplash dummy data images
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Allows any image path from Unsplash
      },
    ],
  },
};

export default nextConfig;