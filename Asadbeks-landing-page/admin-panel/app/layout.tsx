import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Asadbek Arakulov | Admin Panel',
  description: 'Admin boshqaruv paneli',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={jakarta.className} style={{ background: '#0A1628' }}>
        {children}
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ top: 28 }}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#162236',
              color: '#F0F4F8',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 500,
              padding: '14px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              minWidth: '300px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#162236' },
              style: { borderColor: 'rgba(34,197,94,0.4)' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#162236' },
              style: { borderColor: 'rgba(239,68,68,0.4)' },
            },
          }}
        />
      </body>
    </html>
  )
}
