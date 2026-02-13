/** @type {import('next').NextConfig} */

import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isEnabled = (value) => ['1', 'true', 'yes', 'on'].includes(String(value ?? '').toLowerCase());
const v3RedirectsEnabled = isEnabled(process.env['FEATURE_V3_REDIRECTS']);

const nextConfig = {
  reactStrictMode: true,
  // Silence Turbopack error when using custom webpack config.
  turbopack: {},
  outputFileTracingRoot: path.resolve(__dirname, '.'),
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  async redirects() {
    const baseRedirects = [
      {
        source: '/image-compress',
        destination: '/image-tools',
        permanent: true,
      },
    ];

    if (!v3RedirectsEnabled) {
      return baseRedirects;
    }

    return [
      ...baseRedirects,
      {
        source: '/roadmap-board',
        destination: '/deployment-roadmap',
        permanent: true,
      },
      {
        source: '/subscription-roadmap',
        destination: '/plans',
        permanent: true,
      },
      {
        source: '/developers',
        destination: '/topics',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [],
    };
  },

  // برای پشتیبانی از فایل‌های بزرگ و پردازش آفلاین
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
    };
    config.module.rules.push({
      test: /pdf\.worker(\.min)?\.mjs$/,
      type: 'asset/resource',
    });
    if (config.optimization?.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.map((minimizer) => {
        if (minimizer?.constructor?.name === 'TerserPlugin') {
          minimizer.options = {
            ...minimizer.options,
            exclude: /pdf\.worker(\.min)?\.mjs$/,
          };
        }
        return minimizer;
      });
    }
    return config;
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(nextConfig);
