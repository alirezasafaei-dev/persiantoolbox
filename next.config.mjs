/** @type {import('next').NextConfig} */

import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isEnabled = (value) => ['1', 'true', 'yes', 'on'].includes(String(value ?? '').toLowerCase());
const v3RedirectsEnabled = isEnabled(process.env['FEATURE_V3_REDIRECTS']);

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Silence Turbopack error when using custom webpack config.
  turbopack: {},
  outputFileTracingRoot: path.resolve(__dirname, '.'),
  compress: true,
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async redirects() {
    const baseRedirects = [
      {
        source: '/image-compress',
        destination: '/image-tools',
        permanent: true,
      },
      {
        source: '/tools-dashboard',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/loan-calculator',
        destination: '/loan',
        permanent: true,
      },
      {
        source: '/salary-calculator',
        destination: '/salary',
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
      beforeFiles: [
        {
          source: '/34914740.txt',
          destination: '/api/enamad-verification',
        },
      ],
    };
  },

  // برای پشتیبانی از فایل‌های بزرگ و پردازش آفلاین
  webpack: (config, { isServer }) => {
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

    // Optimize framer-motion bundle size (commented out due to module resolution issues)
    // if (config.resolve.alias) {
    //   config.resolve.alias['framer-motion'] = 'framer-motion/dist/framer-motion.js';
    // }

    // Externalize server-only dependencies to reduce client bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        pg: 'commonjs pg',
        'node:sqlite': 'commonjs node:sqlite',
      });
    }

    if (config.optimization?.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.map((minimizer) => {
        if (minimizer?.constructor?.name === 'TerserPlugin') {
          minimizer.options = {
            ...minimizer.options,
            exclude: /pdf\.worker(\.min)?\.mjs$/,
            terserOptions: {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions?.compress,
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.error', 'console.warn'],
              },
            },
          };
        }
        return minimizer;
      });
    }
    return config;
  },

  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    ];

    if (isProduction) {
      baseHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' });
    }

    return [
      {
        source: '/(.*)',
        headers: baseHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(nextConfig);
