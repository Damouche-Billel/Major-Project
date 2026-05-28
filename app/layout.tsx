import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Major Project',
  description: 'Major Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${jost.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)', background: 'var(--cream)' }}>
        {children}
      </body>
    </html>
  )
}
