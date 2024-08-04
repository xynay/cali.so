const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

if (!process.env.SKIP_ENV_VALIDATION) {
  (async () => {
    await import('./env.mjs');
  })();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      }
    ],
    domains: ['cdn.sanity.io'],  // 允许的图像域名
  },
  experimental: {
    taint: true,
  },
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
        new CssMinimizerPlugin()
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        'react': 'react/cjs/react.production.min.js',
        'react-dom': 'react-dom/cjs/react-dom.production.min.js',
      };
    }

    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };

    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: true,
    };

    return config;
  },
};

module.exports = nextConfig;