import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

// ensure environment variables are loaded before configuration
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
      },
    ],
  },
  experimental: {
    taint: true,
  },
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      // minimize javascript and css in production builds
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
        new CssMinimizerPlugin()
      ];
    }

    // enable filesystem caching for faster rebuilds
    config.cache = {
      type: 'filesystem',
    };

    // optimize chunk splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },
};

export default nextConfig;