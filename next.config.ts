import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: [
    "@capacitor/core",
    "@capacitor/app",
    "@capacitor/status-bar",
    "@capacitor/splash-screen",
    "@capgo/native-purchases",
  ],
};

export default nextConfig;

export default nextConfig;
