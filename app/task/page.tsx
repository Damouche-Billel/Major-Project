'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Nav from '@/components/Nav'
import type { ParticipantData, TaskMeta, SessionData } from '@/types'

const NAV_LINKS = [
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'New in', href: '/new-in' },
  { label: 'Sale', href: '/sale' },
]

const PRODUCT_IMAGES: [string, string, string] = [
  '/images/black-oversized-1.png',
  '/images/black-oversized-2.png',
  '/images/black-oversized-3.png',
]

const COLOUR_IMAGES: Record<string, [string, string, string]> = {
  Black: PRODUCT_IMAGES,
  Stone: PRODUCT_IMAGES,
  Sage:  PRODUCT_IMAGES,
  Sky:   PRODUCT_IMAGES,
}

const TASKS: TaskMeta[] = [
  { number: 1, label: 'Task 1', instruction: 'Find out if this item can be gift wrapped and how much it costs.' },
  { number: 2, label: 'Task 2', instruction: 'Find the exact number of days you have to return a sale item.' },
  { number: 3, label: 'Task 3', instruction: 'Find out what size the model is wearing and what size she recommends for an oversized fit.' },
  { number: 4, label: 'Task 4', instruction: 'Select size Medium in Stone and add it to your basket.' },
]

const TOTAL_TASKS = TASKS.length

const COLOURS = [
  { name: 'Black', hex: '#191917' },
  { name: 'Stone', hex: '#C8C4BA' },
  { name: 'Sage',  hex: '#8AB87A' },
  { name: 'Sky',   hex: '#7AAAD4' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

const RATING_BARS = [
  { label: '5 ★', pct: 62 },
  { label: '4 ★', pct: 22 },
  { label: '3 ★', pct: 10 },
  { label: '2 ★', pct: 4 },
  { label: '1 ★', pct: 2 },
]

const REVIEWS = [
  {
    name: 'Sophie R.',
    stars: 5,
    verified: true,
    title: 'Perfect everyday tee',
    body: "I bought this in both Black and Stone and I wear them constantly. The fabric feels incredibly soft and substantial — not like the thin oversized tees you usually find. After six washes it hasn't shrunk or lost its shape at all. Truly worth every penny and I'm already considering the Sage colourway.",
    helpful: 43,
    date: '12 May 2025',
  },
  {
    name: 'Marcus T.',
    stars: 4,
    verified: true,
    title: 'Great quality, slightly long',
    body: "Really impressed with the fabric weight and construction. The stitching is clean and the colour hasn't faded after repeated washing. My only note is that the length is quite long even for an oversized style, so if you're on the shorter side you may want to size down. Overall a solid, versatile basic.",
    helpful: 18,
    date: '3 June 2025',
  },
]

const RELATED_PRODUCTS = [
  { name: 'Classic Crew Neck Sweatshirt', price: '£65.00', image: '/images/sweatshirt.jpg' },
  { name: 'Relaxed Fit Chino',            price: '£85.00', image: '/images/chino.jpg' },
  { name: 'Organic Cotton Hoodie',        price: '£95.00', image: '/images/hoodie.jpg' },
  { name: 'Wide Leg Trouser',             price: '£75.00', image: '/images/wide-leg-trouser.jpg' },
]

const REVIEW_PHOTOS = [
  '/images/review-1.jpg',
  '/images/review-2.jpg',
  '/images/review-3.jpg',
]

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function TaskPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? 'a'

  const [participantData, setParticipantData] = useState<ParticipantData | null>(null)
  const [currentTask, setCurrentTask] = useState<number>(1)
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [activeThumb, setActiveThumb] = useState<number>(0)
  const [selectedColour, setSelectedColour] = useState('Black')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [taskCompleteVisible, setTaskCompleteVisible] = useState<boolean>(false)
  const [allDone, setAllDone] = useState<boolean>(false)
  const [basketError, setBasketError] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [openSections, setOpenSections] = useState<Set<string>>(
    variant === 'b' ? new Set(['details', 'delivery', 'sizeguide', 'care', 'faq']) : new Set()
  )
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(
    variant === 'b' ? new Set([0, 1, 2, 3]) : new Set()
  )
  const [sessionData, setSessionData] = useState<SessionData>({
    variant,
    task1Start: null,
    task1End: null,
    task2Start: null,
    task2End: null,
    task3Start: null,
    task3End: null,
    task4Start: null,
    task4End: null,
    totalClicks: 0,
    errorClicks: 0,
    sizeChanges: 0,
    colourChanges: 0,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  function track() {
    setSessionData((prev) => ({ ...prev, totalClicks: prev.totalClicks + 1 }))
  }

  function handleColour(name: string) {
    track()
    if (name !== selectedColour) {
      setSelectedColour(name)
      setSessionData((prev) => ({ ...prev, colourChanges: prev.colourChanges + 1 }))
      setActiveThumb(0)
    }
  }

  function handleSize(size: string) {
    track()
    if (size !== selectedSize) {
      setSelectedSize(size)
      setSessionData((prev) => ({ ...prev, sizeChanges: prev.sizeChanges + 1 }))
    }
  }

  function advanceTask(completedTask: number) {
    const now = Date.now()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const endKey = `task${completedTask}End` as keyof SessionData
    if (completedTask === TOTAL_TASKS) {
      setSessionData((prev) => {
        const updated = { ...prev, [endKey]: now }
        sessionStorage.setItem('sessionData', JSON.stringify(updated))
        return updated
      })
      setAllDone(true)
    } else {
      const startKey = `task${completedTask + 1}Start` as keyof SessionData
      setSessionData((prev) => {
        const updated = { ...prev, [endKey]: now, [startKey]: now }
        sessionStorage.setItem('sessionData', JSON.stringify(updated))
        return updated
      })
      setCurrentTask(completedTask + 1)
      setTaskCompleteVisible(true)
    }
  }

  function handleGiftWrapClick() {
    if (currentTask !== 1) return
    track()
    advanceTask(1)
  }

  function handleSaleReturnClick() {
    if (currentTask !== 2) return
    track()
    advanceTask(2)
  }

  function handleModelSizingClick() {
    if (currentTask !== 3) return
    track()
    advanceTask(3)
  }

  function handleAddToBasket() {
    track()
    if (currentTask !== 4) return
    if (selectedColour !== 'Stone' || selectedSize !== 'M') {
      setSessionData((prev) => ({ ...prev, errorClicks: prev.errorClicks + 1 }))
      setBasketError(true)
      return
    }
    setBasketError(false)
    advanceTask(4)
  }

  function handleNextTask() {
    setActiveThumb(0)
    setSelectedColour('Black')
    setSelectedSize('')
    setBasketError(false)
    setOpenSections(variant === 'b' ? new Set(['details', 'delivery', 'sizeguide', 'care', 'faq']) : new Set())
    setOpenFaqs(variant === 'b' ? new Set([0, 1, 2, 3]) : new Set())
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setTaskCompleteVisible(false)
    setTaskStartTime(new Date())
  }

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function toggleFaq(i: number) {
    setOpenFaqs((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function handleSaveToWishlist() {
    track()
  }

  useEffect(() => {
    const raw = localStorage.getItem('participantData')
    if (raw) {
      try { setParticipantData(JSON.parse(raw) as ParticipantData) } catch { /* ignore */ }
    }
    const now = Date.now()
    setSessionData((prev) => ({ ...prev, variant, task1Start: now }))
    setTaskStartTime(new Date(now))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (variant !== 'b') return
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('newsletterShown')) {
        setShowNewsletter(true)
        sessionStorage.setItem('newsletterShown', '1')
      }
    }, 8000)
    return () => clearTimeout(timer)
  }, [variant])

  useEffect(() => {
    if (!taskStartTime) return
    setElapsed(0)
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - taskStartTime.getTime()) / 1000))
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [taskStartTime])

  const task = TASKS[currentTask - 1]

  return (
    <>
      <Nav links={NAV_LINKS} activeLink="Women" />

      <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 54px)' }}>

        <div className="flex w-full h-[3px] flex-shrink-0">
          {TASKS.map((t) => {
            const isCompleted = allDone || t.number < currentTask
            const isActive = !allDone && t.number === currentTask
            return (
              <div
                key={t.number}
                className={`flex-1 transition-colors duration-300 ${
                  isCompleted ? 'bg-accent' : isActive ? 'bg-dark' : 'bg-light'
                }`}
              />
            )
          })}
        </div>

        {!allDone && (
          <div className="w-full bg-dark flex items-stretch min-h-[72px] flex-shrink-0">
            <div className="flex-1 flex flex-col justify-center px-8 py-4 border-r border-white/10">
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
                Task {currentTask} of {TOTAL_TASKS}
              </span>
              <p className="font-serif italic text-[18px] font-light text-white leading-snug">
                {task.instruction}
              </p>
            </div>
            <div className="flex items-center justify-center px-8">
              <div className="flex items-center gap-2 border border-white/20 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="font-sans text-[13px] tracking-[0.12em] text-white tabular-nums">
                  {formatElapsed(elapsed)}
                </span>
              </div>
            </div>
          </div>
        )}

        {taskCompleteVisible && (
          <div className="w-full bg-brand-green flex items-center justify-between px-8 py-3 flex-shrink-0">
            <span className="font-sans text-[12px] uppercase tracking-[0.12em] text-white">
              ✓&nbsp;&nbsp;Task {currentTask - 1} complete
            </span>
            <button
              onClick={handleNextTask}
              className="font-sans text-[11px] uppercase tracking-[0.12em] text-white border border-white/40 px-4 py-1.5 hover:bg-white/10 transition-colors"
            >
              Next task
            </button>
          </div>
        )}

        {allDone && (
          <div className="w-full bg-brand-green flex items-center justify-between px-8 py-3 flex-shrink-0">
            <span className="font-sans text-[12px] uppercase tracking-[0.12em] text-white">
              ✓&nbsp;&nbsp;All tasks complete
            </span>
            <button
              onClick={() => router.push('/survey')}
              className="font-sans text-[11px] uppercase tracking-[0.12em] text-white border border-white/40 px-4 py-1.5 hover:bg-white/10 transition-colors"
            >
              Go to survey
            </button>
          </div>
        )}

        <div className="w-full bg-white border-b border-light px-8 py-2.5 flex-shrink-0">
          <p className="font-sans text-[11px] text-mid tracking-wide">
            <span className="hover:text-dark cursor-pointer transition-colors">Women</span>
            <span className="mx-2 text-light">/</span>
            <span className="hover:text-dark cursor-pointer transition-colors">Tops</span>
            <span className="mx-2 text-light">/</span>
            <span className="text-dark">Classic Oversized Tee</span>
          </p>
        </div>

        <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '1fr 1fr' }}>

          <div className="bg-lighter border-r border-light flex overflow-hidden" style={{ padding: '28px' }}>
            <div className="flex flex-col gap-2 mr-4 flex-shrink-0">
              {([0, 1, 2] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => { setActiveThumb(i); track() }}
                  className={`relative w-[46px] h-[56px] overflow-hidden flex-shrink-0 transition-all ${
                    activeThumb === i
                      ? 'outline outline-1 outline-dark outline-offset-1'
                      : 'outline outline-1 outline-light'
                  }`}
                  aria-label={`Thumbnail ${i + 1}`}
                >
                  <Image
                    src={COLOUR_IMAGES[selectedColour][i]}
                    alt={`${selectedColour} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="46px"
                  />
                </button>
              ))}
            </div>

            <div className="relative flex-1 overflow-hidden">
              <Image
                src={COLOUR_IMAGES[selectedColour][activeThumb]}
                alt={`Classic Oversized Tee in ${selectedColour}`}
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
              {variant === 'b' && (
                <div className="absolute top-3 right-3 bg-brand-red px-2.5 py-1">
                  <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-white">
                    Only 4 left
                  </span>
                </div>
              )}
            </div>
          </div>

          <div ref={scrollRef} className="bg-white overflow-y-auto" style={{ padding: '28px' }}>

            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-mid mb-3">
              Minimalist / Essentials
            </p>

            <h1 className="font-serif text-[28px] font-light text-dark leading-tight mb-2">
              Classic Oversized Tee
            </h1>

            {variant === 'b' ? (
              <div className="flex items-center gap-3 mb-3">
                <p className="font-serif text-[22px] font-light text-dark">£45.00</p>
                <span className="font-sans text-[10px] px-2 py-0.5 tracking-wide" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>Free delivery</span>
                <span className="font-sans text-[10px] px-2 py-0.5 tracking-wide" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>Sustainable</span>
              </div>
            ) : (
              <p className="font-serif text-[22px] font-light text-dark mb-4">£45.00</p>
            )}

            {variant === 'b' && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {([1, 2, 3, 4] as number[]).map((i) => (
                    <svg key={i} className="w-3.5 h-3.5" fill="var(--accent)" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="font-sans text-[11px]" style={{ color: 'var(--mid)' }}>4.2 · 1,240 reviews</span>
              </div>
            )}

            <hr className="border-light mb-4" />

            <div className="mb-4">
              <p className="font-sans text-[11px] uppercase tracking-wider text-mid mb-2">
                Colour&nbsp;<span className="text-dark normal-case tracking-normal">{selectedColour}</span>
              </p>
              <div className="flex gap-2">
                {COLOURS.map(({ name, hex }) => (
                  <button
                    key={name}
                    aria-label={name}
                    onClick={() => handleColour(name)}
                    className="w-7 h-7 rounded-full transition-all"
                    style={{
                      backgroundColor: hex,
                      outline: selectedColour === name ? '2px solid var(--dark)' : '2px solid transparent',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
              {variant === 'b' && (
                <div className="mt-2">
                  <span className="font-sans text-[10px] border border-light text-mid px-2 py-0.5 tracking-wide inline-block">Material: 100% Organic Cotton</span>
                </div>
              )}
            </div>

            <hr className="border-light mb-4" />

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-sans text-[11px] uppercase tracking-wider text-mid">Size</p>
                {variant === 'b' && (
                  <a href="#" onClick={track} className="font-sans text-[11px] text-mid underline underline-offset-2 hover:text-dark transition-colors">Size guide</a>
                )}
              </div>
              <div className="flex gap-2">
                {SIZES.map((size) => {
                  const disabled = size === 'XS' || size === 'XL'
                  const active = selectedSize === size
                  return (
                    <button
                      key={size}
                      disabled={disabled}
                      onClick={() => handleSize(size)}
                      className={`w-10 h-10 font-sans text-[12px] border transition-colors ${
                        disabled
                          ? 'border-light text-light line-through opacity-40 cursor-not-allowed'
                          : active
                          ? 'border-dark bg-dark text-white'
                          : 'border-light text-dark hover:border-dark'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            <hr className="border-light mb-4" />

            <button
              onClick={handleAddToBasket}
              className="w-full bg-dark text-white font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-accent transition-colors mb-2"
            >
              Add to basket
            </button>
            {basketError && (
              <p className="font-sans text-[11px] text-brand-red tracking-wide mb-3">
                Please select Stone and size Medium before adding to basket.
              </p>
            )}

            <button
              onClick={handleSaveToWishlist}
              className="w-full border border-dark text-dark font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-dark hover:text-white transition-colors mb-5"
            >
              Save to wishlist
            </button>

            {variant === 'b' ? (
              <div className="border border-light mb-1">
                <div className="grid grid-cols-3 divide-x divide-light">
                  <div className="flex flex-col items-center justify-center text-center px-3 py-3">
                    <span className="font-sans text-[11px] text-dark">Dispatches in 1–2 days</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-3 py-3">
                    <span className="font-sans text-[11px] text-brand-green">Free 30-day returns</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-3 py-3">
                    <span className="font-sans text-[11px] text-dark">Earn 45 reward points</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-lighter p-4 mb-1">
                <p className="font-sans text-[12px] text-mid leading-relaxed">
                  100% organic cotton. Relaxed oversized fit. Model is 5ft 10 wearing size S.
                  Machine wash cold.{' '}
                  <span className="text-brand-green">
                    Free returns within 30 days.
                  </span>
                </p>
              </div>
            )}

            <div className="border-t border-light mt-4">

              <div className="border-b border-light">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between py-3.5 font-sans text-[11px] uppercase tracking-[0.12em] text-mid hover:text-dark transition-colors"
                >
                  <span>Product details</span>
                  <span className="text-[18px] leading-none select-none">{openSections.has('details') ? '−' : '+'}</span>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: openSections.has('details') ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="pb-5 flex flex-col gap-3">
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Our Classic Oversized Tee is cut from 180gsm organic cotton jersey, pre-washed for softness and minimal shrinkage. The dropped shoulders and relaxed body create an effortlessly oversized silhouette that works equally well tucked or untucked.</p>
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Fabric composition is 100% GOTS-certified organic cotton. The fabric is mid-weight, breathable and gets softer with every wash. Garment dyed for a lived-in finish.</p>
                      <p
                        onClick={handleModelSizingClick}
                        className={`font-sans text-[12px] text-mid leading-relaxed ${currentTask === 3 ? 'cursor-pointer underline underline-offset-2' : ''}`}
                      >Model is 5ft 10 and wears a size Small. For an oversized fit as shown, we recommend sizing up one size. If you prefer a closer fit, select your usual size.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-light">
                <button
                  onClick={() => toggleSection('delivery')}
                  className="w-full flex items-center justify-between py-3.5 font-sans text-[11px] uppercase tracking-[0.12em] text-mid hover:text-dark transition-colors"
                >
                  <span>Delivery and returns</span>
                  <span className="text-[18px] leading-none select-none">{openSections.has('delivery') ? '−' : '+'}</span>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: openSections.has('delivery') ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="pb-5 flex flex-col gap-2">
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Standard delivery — 3–5 working days — £3.99</p>
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Express delivery — 1–2 working days — £6.99</p>
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Free standard delivery on orders over £75.</p>
                      <hr className="border-light my-1" />
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Items can be returned within <span className="text-dark font-medium">30 days</span> of delivery in original condition with tags attached.</p>
                      <p
                        onClick={handleSaleReturnClick}
                        className={`font-sans text-[12px] text-mid leading-relaxed ${currentTask === 2 ? 'cursor-pointer underline underline-offset-2' : ''}`}
                      >Sale items can be returned within <span className="text-dark font-medium">14 days</span>.</p>
                      <p className="font-sans text-[12px] text-mid leading-relaxed">To start a return visit our returns portal or email{' '}<a href="mailto:returns@minimalist.com" className="text-dark underline underline-offset-2">returns@minimalist.com</a>. Exchanges are subject to availability.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-light">
                <button
                  onClick={() => toggleSection('sizeguide')}
                  className="w-full flex items-center justify-between py-3.5 font-sans text-[11px] uppercase tracking-[0.12em] text-mid hover:text-dark transition-colors"
                >
                  <span>Size guide</span>
                  <span className="text-[18px] leading-none select-none">{openSections.has('sizeguide') ? '−' : '+'}</span>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: openSections.has('sizeguide') ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="pb-5">
                      <table className="w-full mb-3" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['Size', 'Chest cm', 'Length cm', 'Sleeve cm'].map((h) => (
                              <th key={h} className="font-sans text-[10px] uppercase tracking-[0.1em] text-mid text-left py-2 border-b border-light pr-4">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(['XS,88,68,58', 'S,92,70,59', 'M,96,72,60', 'L,100,74,61', 'XL,104,76,62'] as string[]).map((row) => {
                            const [size, chest, length, sleeve] = row.split(',')
                            return (
                              <tr key={size} className="border-b border-light last:border-b-0">
                                <td className="font-sans text-[12px] text-dark py-2 pr-4">{size}</td>
                                <td className="font-sans text-[12px] text-mid py-2 pr-4">{chest}</td>
                                <td className="font-sans text-[12px] text-mid py-2 pr-4">{length}</td>
                                <td className="font-sans text-[12px] text-mid py-2">{sleeve}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      <p className="font-sans text-[11px] text-mid leading-relaxed italic">All measurements are of the garment laid flat. We recommend measuring a well-fitting item and comparing.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-light">
                <button
                  onClick={() => toggleSection('care')}
                  className="w-full flex items-center justify-between py-3.5 font-sans text-[11px] uppercase tracking-[0.12em] text-mid hover:text-dark transition-colors"
                >
                  <span>Care</span>
                  <span className="text-[18px] leading-none select-none">{openSections.has('care') ? '−' : '+'}</span>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: openSections.has('care') ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="pb-5 flex flex-col gap-1.5">
                      {['Machine wash at 30°C.', 'Do not tumble dry.', 'Reshape whilst damp and dry flat.', 'Cool iron if needed.', 'Do not dry clean.', 'Wash dark colours separately for first few washes.'].map((line) => (
                        <p key={line} className="font-sans text-[12px] text-mid leading-relaxed">— {line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-light">
                <button
                  onClick={() => toggleSection('faq')}
                  className="w-full flex items-center justify-between py-3.5 font-sans text-[11px] uppercase tracking-[0.12em] text-mid hover:text-dark transition-colors"
                >
                  <span>Frequently asked questions</span>
                  <span className="text-[18px] leading-none select-none">{openSections.has('faq') ? '−' : '+'}</span>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: openSections.has('faq') ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="pb-3">
                      {([
                        { q: 'Does this item run true to size?', a: 'This tee is intentionally oversized. If you prefer the look shown on the model, select your true size. For a more relaxed fit, size up.' },
                        { q: 'Is this item available in plus sizes?', a: 'We currently stock up to XL. We are working on extending our size range and hope to have XXL and XXXL available later this year.' },
                        { q: 'Can I get this gift wrapped?', a: 'Yes, we offer gift wrapping for £3.50 per item. Select the gift wrap option at checkout and add a personal message.' },
                        { q: 'Is the packaging sustainable?', a: 'All our packaging is plastic free. Orders are shipped in recycled cardboard boxes with tissue paper made from FSC certified sources.' },
                      ] as { q: string; a: string }[]).map((item, i) => (
                        <div key={i} className="border-t border-light">
                          <button
                            onClick={() => { toggleFaq(i); if (i === 2) handleGiftWrapClick() }}
                            className="w-full flex items-start justify-between py-3 text-left"
                          >
                            <span className="font-sans text-[12px] text-mid pr-4 leading-snug">{item.q}</span>
                            <span className="font-sans text-[16px] leading-none select-none text-mid flex-shrink-0 mt-0.5">{openFaqs.has(i) ? '−' : '+'}</span>
                          </button>
                          <div style={{ display: 'grid', gridTemplateRows: openFaqs.has(i) ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                            <div style={{ overflow: 'hidden' }}>
                              <p
                                className="font-sans text-[12px] text-mid leading-relaxed pb-3 pr-6"
                                onClick={i === 2 ? handleGiftWrapClick : undefined}
                                style={i === 2 && currentTask === 1 ? { cursor: 'pointer' } : undefined}
                              >{item.a}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* You may also like */}
            <div className="mt-8 pb-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mid mb-4">You may also like</p>
              <div className="grid grid-cols-2 gap-3">
                {RELATED_PRODUCTS.map((p) => (
                  <div key={p.name} className="border border-light cursor-pointer group">
                    <div className="w-full relative" style={{ height: '120px' }}>
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-serif text-[14px] font-light text-dark leading-snug mb-1 group-hover:text-accent transition-colors">{p.name}</p>
                      <p className="font-sans text-[12px] text-mid">{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {variant === 'b' && (
              <div className="mt-8 pb-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mid mb-4">Customer reviews</p>

                <div className="flex gap-6 mb-6">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="font-serif text-[48px] font-light text-dark leading-none">4.2</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4].map((i) => (
                        <svg key={i} className="w-3.5 h-3.5" fill="var(--accent)" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="var(--accent)" strokeWidth="1.5" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="font-sans text-[10px] text-mid mt-1">1,240 reviews</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 justify-center">
                    {RATING_BARS.map(({ label, pct }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="font-sans text-[10px] text-mid w-8 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-light overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-sans text-[10px] text-mid w-7 text-right">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {REVIEWS.map((review, i) => (
                  <div key={i} className="border-t border-light py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <svg key={j} className="w-3 h-3" fill={j < review.stars ? 'var(--accent)' : 'none'} stroke="var(--accent)" strokeWidth={j < review.stars ? 0 : 1.5} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {review.verified && (
                        <span className="font-sans text-[10px] text-brand-green tracking-wide">✓ Verified purchase</span>
                      )}
                      <span className="font-sans text-[10px] text-mid ml-auto">{review.name}</span>
                    </div>
                    <p className="font-sans text-[12px] text-dark font-medium mb-1">{review.title}</p>
                    <p className="font-sans text-[12px] text-mid leading-relaxed mb-3">{review.body}</p>
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-[11px] text-mid">Helpful ({review.helpful})</span>
                      <span className="font-sans text-[11px] text-mid">{review.date}</span>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-2 mt-4 pb-4">
                  {REVIEW_PHOTOS.map((src, i) => (
                    <div key={i} className="w-full aspect-square relative">
                      <Image src={src} alt={`Customer photo ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {variant === 'b' && (
              <div className="mt-8 pb-8">
                <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mid mb-4">Recently viewed</p>
                <div className="grid grid-cols-2 gap-3">
                  {RELATED_PRODUCTS.map((p) => (
                    <div key={p.name} className="border border-light cursor-pointer group">
                      <div className="w-full relative" style={{ height: '120px' }}>
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="font-serif text-[14px] font-light text-dark leading-snug mb-1 group-hover:text-accent transition-colors">{p.name}</p>
                        <p className="font-sans text-[12px] text-mid">{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      {showNewsletter && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(25,25,23,0.6)', zIndex: 9999 }}
          onClick={() => setShowNewsletter(false)}
        >
          <div
            className="bg-white w-full max-w-[400px] mx-4 px-8 py-8 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-[13px] tracking-[0.25em] text-mid mb-5">MINIMALIST</p>
            <h2 className="font-serif text-[26px] font-light text-dark text-center leading-tight mb-2">
              Get 10% off your first order
            </h2>
            <p className="font-sans text-[12px] text-mid text-center leading-relaxed mb-6">
              Join our list for exclusive offers and new arrivals
            </p>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full border border-light px-3 py-2.5 font-sans text-[13px] text-dark focus:outline-none focus:border-accent transition-colors mb-3"
            />
            <button
              onClick={() => setShowNewsletter(false)}
              className="w-full bg-dark text-white font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-accent transition-colors mb-4"
            >
              Subscribe
            </button>
            <button
              onClick={() => setShowNewsletter(false)}
              className="font-sans text-[11px] text-mid hover:text-dark transition-colors underline underline-offset-2"
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function TaskPage() {
  return (
    <Suspense>
      <TaskPageInner />
    </Suspense>
  )
}
