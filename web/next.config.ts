import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // The repository root also holds the PHP demo; keep file tracing scoped to the monorepo root.
  outputFileTracingRoot: path.join(__dirname, '..'),
  // The static demo is copied into public/demo at build time; serve its folder index pages.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/demo', destination: '/demo/index.html' },
        { source: '/demo/:path*/', destination: '/demo/:path*/index.html' },
        { source: '/demo/:path((?!.*\\.).*)', destination: '/demo/:path/index.html' },
        { source: '/design-system', destination: '/design-system/index.html' },
        { source: '/design-system/', destination: '/design-system/index.html' }
      ]
    };
  },
  async redirects() {
    return [{ source: '/brand-guide', destination: '/design-system', permanent: true }];
  }
};

export default nextConfig;
