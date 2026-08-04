import type { NextConfig } from "next";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const inferredBasePath = process.env.GITHUB_ACTIONS === "true" && repoName ? `/${repoName}` : "";
const basePath = process.env.BASE_PATH ?? inferredBasePath;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath || undefined
};

export default nextConfig;
