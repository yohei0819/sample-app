/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 追加: Cloudinary 上の画像を next/image で表示できるよう許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
