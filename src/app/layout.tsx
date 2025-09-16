import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer'; // <-- IMPORT THE FOOTER

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Settle | Find Your Next Roommate',
  description: 'The modern, secure way to find compatible roommates and quality shared living spaces.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="flex-grow">
          {children}
        </div>
        <Footer /> {/* <-- THE FOOTER IS CORRECTLY PLACED HERE */}
      </body>
    </html>
  );
}