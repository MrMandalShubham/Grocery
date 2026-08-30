import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GenG (General Grocery)',
    short_name: 'GenG',
    description: 'Your daily groceries, delivered in minutes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9F8F3', // Matches the cream background
    theme_color: '#1a4e28',      // Matches the green-deep color
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
