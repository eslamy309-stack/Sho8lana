import path from 'path'
import { fileURLToPath } from 'url'
import withPWA from 'next-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pwa = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'prod.spline.design' },
    ],
  },
}

export default pwa(nextConfig)
