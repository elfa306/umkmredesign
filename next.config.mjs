/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/produksi', destination: '/lainnya', permanent: false },
      { source: '/akuntansi', destination: '/lainnya', permanent: false },
    ];
  },
};

export default nextConfig;
