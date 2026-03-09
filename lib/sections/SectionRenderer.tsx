'use client'

import React from 'react'
import { getSectionComponent, SectionProps } from './registry'

interface SectionRendererProps {
    sections: SectionProps[]
}

/**
 * Client Component that renders sections based on the registry.
 * This ensures that components requiring hooks (useState, useEffect)
 * are rendered within a Client Component boundary.
 */
export function SectionRenderer({ sections }: SectionRendererProps) {
    if (!sections || sections.length === 0) return null

    return (
        <>
            {sections.map((section, idx) => {
                const Component = getSectionComponent(section._type)
                if (!Component) {
                    console.error(`[RENDERING ERROR] No component found for section type: ${section._type}`)
                    return null
                }
                return <Component key={section._key || idx} {...section} />
            })}
        </>
    )
}
