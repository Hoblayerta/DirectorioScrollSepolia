// src/app/layout.tsx - REEMPLAZAR TODO EL CONTENIDO
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThirdwebProvider } from 'thirdweb/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DirectorioPro Web3',
  description: 'Perfiles profesionales descentralizados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  )
}