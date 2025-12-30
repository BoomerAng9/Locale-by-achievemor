import type { Metadata } from 'next';
import { Inter, GeistMono } from 'geist/font';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Locale by ACHIEVEMOR',
  description: 'The Intelligent Internet - Apple Glass meets Nothing Tech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-gradient-to-b from-white via-gray-50 to-white font-sans antialiased',
        Inter.variable,
        GeistMono.variable
      )}>
        <div className="glass-panel relative z-40">
          {children}
        </div>
      </body>
    </html>
  );
}
