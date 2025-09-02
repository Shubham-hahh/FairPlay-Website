import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },

  async rewrites() {
    return [
      { source: '/home', destination: '/index.html' },
      { source: '/', destination: '/index.html' },
      { source: "/cgu", destination: '/cgu.html' },
      { source: "/contributors", destination: "/contributors.html" },
      { source: "/roadmap", destination: "/roadmap.html" },
    ];
  },
};

export default nextConfig;
