'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

const LIKERT_QUESTIONS = [
  {
    meta: 'TAM — Perceived Usefulness',
    question: 'The product page gave me the information I needed to make a purchase decision.',
    labelLeft: 'Strongly disagree',
    labelRight: 'Strongly agree',
  },
  {
    meta: 'TAM — Perceived Ease of Use',
    question: 'I found the page easy to navigate and use.',
    labelLeft: 'Strongly disagree',
    labelRight: 'Strongly agree',
  },
  {
    meta: 'Trust',
    question: 'I trusted the information presented on this page.',
    labelLeft: 'Strongly disagree',
    labelRight: 'Strongly agree',
  },
  {
    meta: 'Purchase Intent',
    question: 'How likely would you be to purchase this product on a real shopping site?',
    labelLeft: 'Very unlikely',
    labelRight: 'Very likely',
  },
] as const

function SurveyPageInner() {
  const router = useRouter()
  const [likert, setLikert] = useState<(number | null)[]>([null, null, null, null])
  const [openText, setOpenText] = useState('')

  const answeredCount = likert.filter((v) => v !== null).length
  const allAnswered = answeredCount === 4

  function handleLikert(qIndex: number, value: number) {
    setLikert((prev) => {
      const next = [...prev]
      next[qIndex] = value
      return next
    })
  }

  function handleSubmit() {
    if (!allAnswered) return

    const participant = (() => {
      try { return JSON.parse(localStorage.getItem('participantData') ?? '{}') } catch { return {} }
    })()
    const session = (() => {
      try { return JSON.parse(sessionStorage.getItem('sessionData') ?? '{}') } catch { return {} }
    })()

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...participant,
        ...session,
        likert: likert as number[],
        openText,
      }),
    }).catch(console.error)

    router.push('/complete')
  }

  return (
    <>
      <Nav links={[]} />

      {/* Progress bar */}
      <div className="w-full h-[3px] bg-light flex-shrink-0">
        <div className="h-full bg-accent" style={{ width: '85%', transition: 'width 0.4s ease' }} />
      </div>

      {/* Page content */}
      <div className="bg-lighter min-h-screen px-6 py-10">
        <div className="mx-auto" style={{ maxWidth: '620px' }}>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="font-serif font-light text-dark mb-2"
              style={{ fontSize: '32px' }}
            >
              Post-task survey
            </h1>
            <p className="font-sans text-mid" style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.6' }}>
              Please answer honestly based on the page you just used. There are no right or wrong answers. This takes around 2 minutes.
            </p>
          </div>

          {/* Question cards */}
          <div className="flex flex-col" style={{ gap: '12px' }}>

            {/* Likert cards */}
            {LIKERT_QUESTIONS.map((q, qi) => (
              <div
                key={qi}
                className="bg-white border border-light"
                style={{ padding: '22px' }}
              >
                <p
                  className="font-sans uppercase text-accent mb-2"
                  style={{ fontSize: '10px', letterSpacing: '0.14em' }}
                >
                  {q.meta}
                </p>
                <p
                  className="font-sans text-dark mb-5"
                  style={{ fontSize: '14px', lineHeight: '1.55', fontWeight: 300 }}
                >
                  {q.question}
                </p>

                {/* Likert buttons */}
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const selected = likert[qi] === val
                    return (
                      <button
                        key={val}
                        onClick={() => handleLikert(qi, val)}
                        className="flex-1 py-2 font-sans transition-colors"
                        style={{
                          fontSize: '13px',
                          backgroundColor: selected ? 'var(--dark)' : 'var(--white)',
                          color: selected ? 'var(--white)' : 'var(--mid)',
                          border: selected ? '1px solid var(--dark)' : '1px solid var(--light)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) {
                            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--dark)'
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--dark)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) {
                            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--light)'
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--mid)'
                          }
                        }}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>

                {/* Scale labels */}
                <div className="flex justify-between">
                  <span className="font-sans text-mid" style={{ fontSize: '10px' }}>{q.labelLeft}</span>
                  <span className="font-sans text-mid" style={{ fontSize: '10px' }}>{q.labelRight}</span>
                </div>
              </div>
            ))}

            {/* Open response card */}
            <div
              className="bg-white border border-light"
              style={{ padding: '22px' }}
            >
              <p
                className="font-sans uppercase text-accent mb-2"
                style={{ fontSize: '10px', letterSpacing: '0.14em' }}
              >
                Open Response — Optional
              </p>
              <textarea
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                placeholder="Share your thoughts"
                className="w-full border border-light font-sans text-dark text-[13px] px-4 py-3 outline-none focus:border-dark transition-colors placeholder:text-light"
                style={{
                  minHeight: '80px',
                  resize: 'vertical',
                  fontWeight: 300,
                }}
              />
            </div>

          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full mt-6 font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 transition-colors"
            style={{
              backgroundColor: allAnswered ? 'var(--dark)' : 'var(--dark)',
              color: 'var(--white)',
              opacity: allAnswered ? 1 : 0.5,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              border: 'none',
            }}
          >
            Submit responses
          </button>

        </div>
      </div>
    </>
  )
}

export default function SurveyPage() {
  return (
    <Suspense>
      <SurveyPageInner />
    </Suspense>
  )
}

