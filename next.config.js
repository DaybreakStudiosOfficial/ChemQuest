/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  images: {
    loader: 'custom',
    loaderFile: './my-loader.ts',
  }
}

module.exports = nextConfig
