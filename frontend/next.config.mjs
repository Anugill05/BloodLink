// /** @type {import('next').NextConfig} */
// const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

// export default {
//   output: "standalone",
//   reactStrictMode: true,
//   // Django expects trailing slashes; don't let Next strip them before proxying.
//   skipTrailingSlashRedirect: true,
//   async rewrites() {
//     return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*/` }];
//   },
// };
/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export default {
  output: "standalone",
  reactStrictMode: true,
  // Django expects trailing slashes; don't let Next strip them before proxying.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*/` }];
  },
};
