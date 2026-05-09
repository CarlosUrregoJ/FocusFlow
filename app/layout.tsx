import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { APP_NAME } from '@/lib/env';

const headingFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Aplicación de productividad con tareas, Pomodoro, estadísticas y tema oscuro/claro.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${bodyFont.variable} bg-background font-sans text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
