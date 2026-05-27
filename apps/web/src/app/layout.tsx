import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'EduAI — AI-Powered Learning', template: '%s | EduAI' },
  description:
    'Transform education with personalised AI tutoring, live classes, and intelligent analytics.',
  keywords: ['education', 'e-learning', 'AI tutor', 'online courses'],
  authors: [{ name: 'EduAI' }],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    title: 'EduAI — AI-Powered Learning Platform',
    description: 'Personalised AI tutoring for every student.',
    siteName: 'EduAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduAI',
    description: 'Personalised AI tutoring for every student.',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
