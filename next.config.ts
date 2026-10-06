import type { NextConfig } from 'next';

/**
 * Admin-uploaded media is served by the Express API from /uploads, so the API's
 * hostname has to be allowed here or <Image> refuses to render it.
 *
 * Derived from NEXT_PUBLIC_API_URL rather than hardcoded, because the API lives
 * in a separate repo and moves to a real hostname in production. The localhost
 * entries stay for development.
 */
function uploadPatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
    // The production API. Always allowed so a local database restored from
    // production data still renders its uploaded images.
    { protocol: 'https', hostname: 'api.lekkertours.com', port: '', pathname: '/uploads/**' },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return patterns;

  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    const scheme = protocol.replace(':', '');
    if (scheme !== 'http' && scheme !== 'https') return patterns;

    const already = patterns.some((p) => p.hostname === hostname && (p.port ?? '') === port);
    if (!already) {
      patterns.push({ protocol: scheme, hostname, port, pathname: '/uploads/**' });
    }
  } catch {
    // A malformed NEXT_PUBLIC_API_URL should not break the build; the fetch
    // layer surfaces that problem far more clearly than a config crash would.
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: uploadPatterns(),
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
};

export default nextConfig;
