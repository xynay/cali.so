const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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
    taint: true,
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
      type: 'filesystem',
    };
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          filename: 'vendors-[contenthash].js',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          filename: 'common-[contenthash].js',
        },
      },
    };
    if (dev) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server', // 或 'static'，用于生成报告文件
          openAnalyzer: false, // 禁用自动打开浏览器
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig;
