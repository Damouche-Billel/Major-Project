'use client'

import Link from 'next/link'

interface NavLink {
  label: string
  href: string
}

interface NavProps {
  links?: NavLink[]
  activeLink?: string
}

export default function Nav({ links = [], activeLink }: NavProps) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--light)',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
      }}
    >
      {/* Brand */}
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          letterSpacing: '0.2em',
          fontSize: '15px',
          fontWeight: 400,
          color: 'var(--dark)',
          flexShrink: 0,
          marginRight: '40px',
        }}
      >
        MINIMALIST
      </span>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1 }}>
        {links.map((link) => {
          const isActive = activeLink === link.label
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isActive ? 'var(--dark)' : 'var(--mid)',
                fontWeight: isActive ? 400 : 300,
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--dark)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--mid)'
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Icon buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
        {/* Search */}
        <button
          aria-label="Search"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.55, transition: 'opacity 0.15s ease' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.55')}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Wishlist */}
        <button
          aria-label="Wishlist"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.55, transition: 'opacity 0.15s ease' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.55')}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Basket */}
        <button
          aria-label="Basket"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.55, transition: 'opacity 0.15s ease' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.55')}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
