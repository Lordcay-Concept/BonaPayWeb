import type { Metadata } from 'next'
import { Inter, Roboto_Mono, Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'FintechFlow - Modern Digital Banking',
  description: 'Experience the future of banking with FintechFlow. Send money, pay bills, and manage your finances effortlessly.',
  keywords: 'fintech, banking, digital bank, nigeria, send money',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(robotoMono.variable, "font-sans", geist.variable)}>
      <body className={geist.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}