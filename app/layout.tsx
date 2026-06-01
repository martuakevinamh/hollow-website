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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
