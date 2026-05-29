'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

interface ParticipantData {
  participantId: string
  ageRange: string
  shoppingFrequency: string
}

const NAV_LINKS = [
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'New in', href: '/new-in' },
  { label: 'Sale', href: '/sale' },
]

export default function Home() {
  const router = useRouter()
  const [data, setData] = useState<ParticipantData>({
    participantId: '',
    ageRange: '',
    shoppingFrequency: '',
  })

  function handleChange(field: keyof ParticipantData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  function handleContinue() {
    localStorage.setItem('participantData', JSON.stringify(data))
    router.push('/task')
  }

  return (
    <>
      <Nav links={NAV_LINKS} />

      <main className="min-h-[calc(100vh-54px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px] bg-white border border-light">

          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-light">
            <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-accent mb-3">
              Step 1 of 3
            </p>
            <h1 className="font-serif text-[32px] font-light text-dark leading-tight mb-2">
              Before we begin
            </h1>
            <p className="font-sans text-[13px] text-mid leading-relaxed">
              Help us understand your shopping habits before you explore the store.
            </p>
          </div>

          {/* Card body */}
          <div className="px-8 py-7 space-y-6">

            {/* Info strip */}
            <div className="border-l-2 border-accent bg-lighter pl-4 pr-3 py-3">
              <p className="font-sans text-[12px] text-mid leading-relaxed">
                This study takes{' '}
                <span className="text-dark font-normal">5–8 minutes</span>{' '}
                to complete and all responses are fully anonymous. No personal
                data is collected beyond what you provide here.
              </p>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] uppercase tracking-wider text-mid">
                  Participant ID
                </label>
                <input
                  type="text"
                  value={data.participantId}
                  onChange={handleChange('participantId')}
                  placeholder="e.g. P001"
                  className="border border-light bg-white px-3 py-2 font-sans text-[13px] text-dark focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] uppercase tracking-wider text-mid">
                  Age range
                </label>
                <select
                  value={data.ageRange}
                  onChange={handleChange('ageRange')}
                  className="border border-light bg-white px-3 py-2 font-sans text-[13px] text-dark focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Select…</option>
                  <option value="18-24">18–24</option>
                  <option value="25-34">25–34</option>
                  <option value="35-44">35–44</option>
                  <option value="45-54">45–54</option>
                  <option value="55+">55+</option>
                </select>
              </div>
            </div>

            {/* Shopping frequency */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] uppercase tracking-wider text-mid">
                Shopping frequency
              </label>
              <select
                value={data.shoppingFrequency}
                onChange={handleChange('shoppingFrequency')}
                className="w-full border border-light bg-white px-3 py-2 font-sans text-[13px] text-dark focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">Select…</option>
                <option value="once-a-week-or-more">Once a week or more</option>
                <option value="2-3-times-a-month">2–3 times a month</option>
                <option value="once-a-month">Once a month</option>
                <option value="less-than-once-a-month">Less than once a month</option>
              </select>
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              className="w-full bg-dark text-white font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-accent transition-colors"
            >
              Continue
            </button>

            {/* Consent note */}
            <p className="font-sans text-[11px] text-mid text-center leading-relaxed">
              By continuing you confirm that you are aged 18 or above and consent
              to your anonymised responses being used for academic research purposes.
            </p>

          </div>
        </div>
      </main>
    </>
  )
}
