'use client'

import { SectionProps } from '@/lib/sections/types'
import { urlForImage } from '@/lib/sanity'

export function HeroSection({ heading, subheading, backgroundImage, cta }: SectionProps) {
  const bgImageUrl = backgroundImage ? urlForImage(backgroundImage).width(1920).height(800).url() : undefined

  return (
    <section
      id="home"
      className="hero-section"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-background)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '40px',
          borderRadius: '8px',
        }}
      >
        {heading && <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{heading}</h1>}
        {subheading && <p style={{ fontSize: '1.25rem', marginBottom: '30px' }}>{subheading}</p>}
        {cta?.text && (
          <a
            href={cta.link || '#'}
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-background)',
              padding: '12px 30px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '1.1rem',
            }}
          >
            {cta.text}
          </a>
        )}
      </div>
    </section>
  )
}

