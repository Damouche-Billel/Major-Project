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
const TASK_INSTRUCTION =
  'You have a question about the item. You are now on the Contact page. Fill in the form to get in touch.'

function ContactPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? 'a'

  const [bannerVisible, setBannerVisible] = useState<boolean>(true)
  const [allDone, setAllDone] = useState<boolean>(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})

  useEffect(() => {
    const raw = sessionStorage.getItem('sessionData')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionData
        const updated = { ...parsed, task4Start: Date.now() }
        sessionStorage.setItem('sessionData', JSON.stringify(updated))
      } catch { /* ignore */ }
    }
  }, [])

  function handleSend() {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = 'Please enter your name.'
    if (!email.trim()) newErrors.email = 'Please enter your email address.'
    if (!message.trim()) newErrors.message = 'Please enter a message.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    const raw = sessionStorage.getItem('sessionData')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionData
        const updated = { ...parsed, task4End: Date.now() }
        sessionStorage.setItem('sessionData', JSON.stringify(updated))
      } catch { /* ignore */ }
    }
    setBannerVisible(false)
    setAllDone(true)
  }

  const inputClass =
    'w-full border border-light bg-white font-sans text-[13px] text-dark px-4 py-3 outline-none focus:border-dark transition-colors placeholder:text-light'

  return (
    <>
      <Nav links={NAV_LINKS} activeLink="Contact" />

      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 54px)' }}>

        {/* Task progress bar — segments 1–3 done, segment 4 active */}
        <div className="flex w-full h-[3px] flex-shrink-0">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex-1 transition-colors duration-300 ${
                n < 4 ? 'bg-accent' : 'bg-dark'
              }`}
            />
          ))}
        </div>

        {/* Task banner */}
        {bannerVisible && (
          <div className="w-full bg-dark flex items-stretch min-h-[72px] flex-shrink-0">
            <div className="flex-1 flex flex-col justify-center px-8 py-4">
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
                Task 4 of {TOTAL_TASKS}
              </span>
              <p className="font-serif italic text-[18px] font-light text-white leading-snug">
                {TASK_INSTRUCTION}
              </p>
            </div>
          </div>
        )}

        {/* All tasks complete bar */}
        {allDone && (
          <div className="w-full bg-brand-green flex items-center justify-between px-8 py-3 flex-shrink-0">
            <span className="font-sans text-[12px] uppercase tracking-[0.12em] text-white">
              ✓&nbsp;&nbsp;All tasks complete — great work
            </span>
            <button
              onClick={() => router.push('/survey')}
              className="font-sans text-[11px] uppercase tracking-[0.12em] text-white border border-white/40 px-4 py-1.5 hover:bg-white/10 transition-colors"
            >
              Go to survey
            </button>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 bg-white px-8 py-12">

          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="font-serif font-light text-dark mb-2" style={{ fontSize: '32px' }}>
              Get in touch
            </h1>
            <p className="font-sans text-[13px] text-mid tracking-wide">
              We would love to hear from you
            </p>
          </div>

          {/* Two-column layout */}
          <div
            className="mx-auto grid gap-12"
            style={{ maxWidth: '860px', gridTemplateColumns: '1fr 1fr' }}
          >

            <div className="flex flex-col gap-8">

              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-dark mb-2">
                  Customer service
                </p>
                <p className="font-sans text-[13px] text-mid leading-relaxed">
                  <a
                    href="mailto:hello@minimalist.com"
                    className="text-dark hover:text-accent transition-colors"
                  >
                    hello@minimalist.com
                  </a>
                </p>
                <p className="font-sans text-[13px] text-mid leading-relaxed">
                  Monday – Friday, 9am – 5pm GMT
                </p>
              </div>

              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-dark mb-2">
                  Returns &amp; exchanges
                </p>
                <p className="font-sans text-[13px] text-mid leading-relaxed">
                  We offer free returns within 30 days of purchase. Items must be unworn and in
                  their original condition with all tags attached.
                </p>
              </div>

              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-dark mb-2">
                  Wholesale
                </p>
                <p className="font-sans text-[13px] text-mid leading-relaxed">
                  <a
                    href="mailto:wholesale@minimalist.com"
                    className="text-dark hover:text-accent transition-colors"
                  >
                    wholesale@minimalist.com
                  </a>
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-5">

              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
                  className={inputClass}
                />
                {errors.name && (
                  <p className="font-sans text-[11px] text-brand-red mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                  className={inputClass}
                />
                {errors.email && (
                  <p className="font-sans text-[11px] text-brand-red mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <textarea
                  placeholder="Message"
                  rows={6}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: undefined })) }}
                  className={`${inputClass} resize-none`}
                />
                {errors.message && (
                  <p className="font-sans text-[11px] text-brand-red mt-1">{errors.message}</p>
                )}
              </div>

              <button
                onClick={handleSend}
                className="w-full bg-dark text-white font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-accent transition-colors"
              >
                Send message
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactPageInner />
    </Suspense>
  )
}

