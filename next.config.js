/** @type {import('next').NextConfig} */

// IMPORTANT: Change 'portfolio' below to your actual GitHub repository name
const REPO_NAME = "shashikanth077.github.io";

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  // Required for GitHub Pages: disables Next.js image optimisation (not supported in static export)
  images: { unoptimized: true },
  // Sets the sub-path to match your GitHub Pages URL: https://<username>.github.io/<REPO_NAME>/
  assetPrefix: isProd ? `/${REPO_NAME}/` : "",
  basePath: isProd ? `/${REPO_NAME}` : "",
  trailingSlash: true,
};

module.exports = nextConfig;
