/** @type {import('next').NextConfig} */
import crontabService from "./crontabService.js";
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    CrontabService: crontabService,
  },
};

export default nextConfig;
