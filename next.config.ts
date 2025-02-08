import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["wzzudkjvytjmhhxhxirl.supabase.co"],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: { test?: (path: string) => boolean } }) =>
        rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ },
        use: ["@svgr/webpack"],
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
