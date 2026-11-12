/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@electric-sql/pglite", "pg", "exceljs"],
  },
};
export default nextConfig;
