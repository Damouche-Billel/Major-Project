import Nav from '@/components/Nav'

export default function CompletePage() {
  return (
    <>
      <Nav links={[]} />

      {/* Full progress bar */}
      <div className="w-full h-[3px]" style={{ backgroundColor: 'var(--light)' }}>
        <div className="h-full" style={{ width: '100%', backgroundColor: 'var(--accent)' }} />
      </div>

      <main
        style={{
          minHeight: 'calc(100vh - 57px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          backgroundColor: 'var(--cream)',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="34"
              height="34"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.4rem',
              fontWeight: 400,
              color: 'var(--dark)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Thank you for your participation
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 300,
              color: 'var(--mid)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Your responses have been recorded and will contribute to the research.
            You may now close this window.
          </p>

          {/* Divider */}
          <div
            style={{
              width: '48px',
              height: '1px',
              backgroundColor: 'var(--accent)',
            }}
          />

          {/* Reference code */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              color: 'var(--mid)',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            Survey complete &mdash; Step 4 of 4
          </p>
        </div>
      </main>
    </>
  )
}
