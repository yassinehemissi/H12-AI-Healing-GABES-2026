import type { NextConfig } from "next";
const path = require('path');

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_BASE_URL: "http://127.0.0.1:8000",
  },

};

export default nextConfig;
