import type { Metadata } from 'next'
import React from 'react'

import './globals.css'
import { Navbar } from '@/components/Navbar'
import { getNavbar, getSiteConfig } from '@/lib/sanity'

export const metadata: Metadata = {
  title: 'Remixable Template',
  description: 'A reusable section-based website template powered by Sanity CMS',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let navbar = null
  let siteConfig = null

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    )
    navbar = await Promise.race([getNavbar(), timeoutPromise])
  } catch (error) {
    console.log('[Layout] Navbar fetch failed, using defaults')
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    )
    siteConfig = await Promise.race([getSiteConfig(), timeoutPromise])
  } catch (error) {
    console.log('[Layout] SiteConfig fetch failed, using defaults')
  }

  // Define CSS variables from Sanity with sensible defaults
  const cssVars = {
    '--color-primary': siteConfig?.primaryColor || '#2563eb', // Royal Blue
    '--color-primary-hover': siteConfig?.primaryHoverColor || '#1d4ed8', // Deeper Blue
    '--color-background': siteConfig?.backgroundColor || '#ffffff',
    '--color-surface': siteConfig?.surfaceColor || '#f0f7ff', // Very light blue
    '--color-text-primary': siteConfig?.textPrimary || '#333333',
    '--color-text-secondary': siteConfig?.textSecondary || '#666666',
    '--color-border': siteConfig?.borderColor || '#e0e0e0',
    '--color-footer-background': siteConfig?.footerBackground || '#1a1a1a',
    '--color-footer-text': siteConfig?.footerText || '#ffffff',
  } as React.CSSProperties

  const allPages = await import('@/lib/sanity').then(m => m.getAllPages())
  const pages = allPages?.filter((p: any) => p.slug?.toLowerCase() !== 'home') || []

  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          ...cssVars
        }}
      >
        <Navbar
          logo={siteConfig?.logo}
          logoImage={siteConfig?.logoImage}
          links={navbar?.links}
          pages={pages}
        />
        {children}
      </body>
    </html>
  )
}
