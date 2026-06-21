import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud", // IPFS metadata er jonno
      },
      {
        protocol: "https",
        hostname: "ipfs.io", // IPFS raw image er jonno
      }
    ],
  },
};

export default nextConfig;