const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// 只在开发或构建时加载环境变量，避免生产环境下的额外开销
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
  },
  experimental: {
    taint: true, // 仅在需要时启用实验功能
  },
  redirects() {
    return [
      { source: '/twitter', destination: 'https://x.com/thecalicastle', permanent: false },
      { source: '/x', destination: 'https://x.com/thecalicastle', permanent: false },
      { source: '/youtube', destination: 'https://youtube.com/@calicastle', permanent: false },
      { source: '/tg', destination: 'https://t.me/cali_so', permanent: false },
      { source: '/linkedin', destination: 'https://www.linkedin.com/in/calicastle/', permanent: false },
      { source: '/github', destination: 'https://github.com/CaliCastle', permanent: false },
      { source: '/bilibili', destination: 'https://space.bilibili.com/8350251', permanent: false },
    ];
  },
  rewrites() {
    return [
      { source: '/feed', destination: '/feed.xml' },
      { source: '/rss', destination: '/feed.xml' },
      { source: '/rss.xml', destination: '/feed.xml' },
    ];
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
    }
    config.cache = {
      type: 'filesystem', // 启用持久化缓存
    };
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
    // 移除 BundleAnalyzerPlugin
    // if (dev) {
    //   config.plugins.push(
    //     new BundleAnalyzerPlugin({
    //       analyzerMode: 'server',
    //       openAnalyzer: false,
    //     })
    //   );
    // }
    return config;
  },
};

module.exports = nextConfig;
