/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
};

const cfg = nextConfig; cfg.eslint = Object.assign({}, cfg.eslint, { ignoreDuringBuilds: true }); cfg.typescript = Object.assign({}, cfg.typescript, { ignoreBuildErrors: true }); export default cfg;

