import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LOGISTIX - Supply Chain Intelligence Platform',
  description: 'Global logistics tracking and supply chain intelligence dashboard for industrial manufacturers and their affiliates. Real-time shipment tracking, geospatial analytics, and alert management.',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'LOGISTIX - Supply Chain Intelligence',
    description: 'Real-time global logistics tracking and geospatial analytics for industrial manufacturers.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-950 text-white antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
