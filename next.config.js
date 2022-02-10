/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const path = require('path');

module.exports = {
  nextConfig: nextConfig,
  webpack: (config, { isServer }) => {
    if (isServer) {
      return {
        ...config,
        entry() {
          return config.entry().then((entry) => ({
            ...entry,
            daemon: path.resolve(process.cwd(), 'src/daemon.ts'),
          }));
        }
      };
    }
    return config;
  }
}
