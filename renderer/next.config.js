/** @type {import('next').NextConfig} */
// module.exports = {
//   trailingSlash: true,
//   images: {
//     unoptimized: true,
//   },
//   webpack: (config) => {
//     return config
//   },
// }

const withTM = require("next-transpile-modules")([]);

module.exports = withTM({
  // swcMinify: false,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {},
  webpack: (config) => {
    return config;
  },
});
