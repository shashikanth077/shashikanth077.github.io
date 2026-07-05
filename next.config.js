/** @type {import('next').NextConfig} */

// This is a GitHub user-pages repo (shashikanth077.github.io).
// User-pages are served at the root https://shashikanth077.github.io/
// so basePath and assetPrefix must be empty — no subpath needed.
const nextConfig = {
  reactStrictMode: true,
  // Required for GitHub Pages static export: disable image optimization
  // See: https://nextjs.org/docs/messages/export-image-api
  images: {
    unoptimized: false,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
