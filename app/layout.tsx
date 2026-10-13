import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Hollow — UK Gangster Roleplay Community',
    template: '%s | Hollow',
  },
  description:
    'Hollow adalah komunitas gangster UK terkemuka di GTA SAMP dan GTA FiveM Roleplay.',
  keywords: ['Hollow', 'GTA SAMP', 'GTA FiveM', 'UK Gangster', 'Roleplay', 'THB'],
  icons: {
    icon: [
      { url: '/uk-flag.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/uk-flag.png', type: 'image/png', sizes: '64x64' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Hollow — UK Gangster Roleplay Community',
    description: 'Komunitas gangster UK terkemuka di GTA SAMP dan GTA FiveM Roleplay.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/uk-flag.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
