import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import dotenv from 'dotenv';

// 同步加载环境变量
dotenv.config({ path: './env.mjs' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // 启用 React 严格模式
  images: {
    domains: ['cdn.sanity.io'], // 允许的图像域名
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
        new CssMinimizerPlugin(),
      ];

      // 添加 CompressionPlugin 进行 gzip 压缩
      config.plugins.push(new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }));

      // 添加 Bundle Analyzer 插件
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-analyzer.html',
        openAnalyzer: false,
      }));
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