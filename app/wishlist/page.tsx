'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import type { SessionData } from '@/types'

const NAV_LINKS = [
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'New in', href: '/new-in' },
  { label: 'Sale', href: '/sale' },
  { label: 'Contact', href: '/contact' },
]

const TOTAL_TASKS = 4
const TASK_INSTRUCTION = 'You have changed your mind about buying now. Save the item to your wishlist for later.'

function WishlistPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? 'a'

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [taskCompleteVisible, setTaskCompleteVisible] = useState<boolean>(true)

  // On mount: read sessionData, stamp task3Start, save back
  useEffect(() => {
    const raw = sessionStorage.getItem('sessionData')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionData
        const updated = { ...parsed, task3Start: Date.now() }
        sessionStorage.setItem('sessionData', JSON.stringify(updated))
        setSessionData(updated)
      } catch { /* ignore */ }
    }
  }, [])

  function handleNextTask() {
    const now = Date.now()
    const raw = sessionStorage.getItem('sessionData')
    let updated: SessionData | null = null
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionData
        updated = { ...parsed, task3End: now }
        sessionStorage.setItem('sessionData', JSON.stringify(updated))
      } catch { /* ignore */ }
    }
    setTaskCompleteVisible(false)
    router.push(`/contact?variant=${variant}`)
  }

  return (
    <>
      <Nav links={NAV_LINKS} />

      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 54px)' }}>

        {/* Task progress bar — segments 1 & 2 done, segment 3 active, segment 4 inactive */}
        <div className="flex w-full h-[3px] flex-shrink-0">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex-1 transition-colors duration-300 ${
                n < 3 ? 'bg-accent' : n === 3 ? 'bg-dark' : 'bg-light'
              }`}
            />
          ))}
        </div>

        {/* Task banner */}
        <div className="w-full bg-dark flex items-stretch min-h-[72px] flex-shrink-0">
          <div className="flex-1 flex flex-col justify-center px-8 py-4">
            <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
              Task 3 of {TOTAL_TASKS}
            </span>
            <p className="font-serif italic text-[18px] font-light text-white leading-snug">
              {TASK_INSTRUCTION}
            </p>
          </div>
        </div>

        {/* Task 3 complete bar */}
        {taskCompleteVisible && (
          <div className="w-full bg-brand-green flex items-center justify-between px-8 py-3 flex-shrink-0">
            <span className="font-sans text-[12px] uppercase tracking-[0.12em] text-white">
              ✓&nbsp;&nbsp;Task 3 complete
            </span>
            <button
              onClick={handleNextTask}
              className="font-sans text-[11px] uppercase tracking-[0.12em] text-white border border-white/40 px-4 py-1.5 hover:bg-white/10 transition-colors"
            >
              Next task
            </button>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 bg-white px-8 py-10">
          <h1 className="font-serif font-light text-dark mb-8" style={{ fontSize: '32px' }}>
            Your wishlist
          </h1>

          {/* Wishlist item card */}
          <div className="flex items-start gap-5 border border-light p-5 max-w-lg">
            {/* Image placeholder */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '72px',
                height: '88px',
                backgroundColor: '#E8E2D9',
                fontSize: '22px',
                fontFamily: 'var(--font-serif)',
                color: 'var(--mid)',
                fontWeight: 300,
              }}
            >
              M
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-start justify-between gap-4">
                <span className="font-serif text-[17px] font-light text-dark leading-snug">
                  Classic Oversized Tee
                </span>
                <span
                  className="font-sans text-[10px] uppercase tracking-[0.12em] text-accent flex-shrink-0"
                  style={{ marginTop: '2px' }}
                >
                  Just added
                </span>
              </div>
              <p className="font-sans text-[11px] text-mid tracking-wide">Stone · Size M</p>
              <p className="font-serif text-[16px] font-light text-dark mt-1">£45.00</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default function WishlistPage() {
  return (
    <Suspense>
      <WishlistPageInner />
    </Suspense>
  )
}
