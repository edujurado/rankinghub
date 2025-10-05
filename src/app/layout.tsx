import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RankingHub - Find the Top DJs, Photographers & Videographers in NYC',
  description: 'Official rankings of the best DJs, photographers, and videographers in NYC. Find your perfect event service provider.',
  keywords: 'DJs NYC, photographers NYC, videographers NYC, event services, rankings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
