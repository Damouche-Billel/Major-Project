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

// Three local product images — same photos across all colour swatches
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
  { number: 1, label: 'Task 1', instruction: 'You want to buy this item as a gift. Select size Medium in Stone and add it to your basket.' },
  { number: 2, label: 'Task 2', instruction: 'You want to check if free returns are available and find out exactly how many days you have to return the item.' },
  { number: 3, label: 'Task 3', instruction: 'You have changed your mind about buying now. Save the item to your wishlist for later.' },
  { number: 4, label: 'Task 4', instruction: 'You have a question about the item. Navigate to the Contact page to get in touch with the brand.' },
]

const TOTAL_TASKS = TASKS.length

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
  const [elapsed, setElapsed] = useState<number>(0)
  const [activeThumb, setActiveThumb] = useState<number>(0)
  const [selectedColour, setSelectedColour] = useState<string>('Black')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [taskCompleteVisible, setTaskCompleteVisible] = useState<boolean>(false)
  const [basketError, setBasketError] = useState<boolean>(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())
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

  // ── Helpers ──────────────────────────────────────────────
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
    const endKey = `task${completedTask}End` as keyof SessionData
    const startKey = `task${completedTask + 1}Start` as keyof SessionData
    setSessionData((prev) => {
      const updated = { ...prev, [endKey]: now, [startKey]: now }
      sessionStorage.setItem('sessionData', JSON.stringify(updated))
      return updated
    })
    setCurrentTask(completedTask + 1)
    setTaskCompleteVisible(true)
  }

  function handleAddToBasket() {
    track()
    if (currentTask !== 1) return
    if (selectedColour !== 'Stone' || selectedSize !== 'M') {
      setSessionData((prev) => ({ ...prev, errorClicks: prev.errorClicks + 1 }))
      setBasketError(true)
      return
    }
    setBasketError(false)
    advanceTask(1)
  }

  function handleFreeReturnsClick() {
    if (currentTask !== 2) return
    track()
    advanceTask(2)
  }

  function handleNextTask() {
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
    if (currentTask !== 3) {
      track()
      return
    }
    const now = Date.now()
    const updated: SessionData = {
      ...sessionData,
      task3End: now,
      totalClicks: sessionData.totalClicks + 1,
    }
    sessionStorage.setItem('sessionData', JSON.stringify(updated))
    router.push(`/wishlist?variant=${variant}`)
  }

  // ── Effects ───────────────────────────────────────────────
  // Load participant data and record task1Start on mount
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

  // Timer interval — resets whenever taskStartTime changes
  useEffect(() => {
    if (!taskStartTime) return
    setElapsed(0)
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - taskStartTime.getTime()) / 1000))
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [taskStartTime])

  const task = TASKS[currentTask - 1]

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <Nav links={NAV_LINKS} activeLink="Women" />

      {/* Everything below the nav fills the remaining viewport height */}
      <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 54px)' }}>

        {/* Task progress bar */}
        <div className="flex w-full h-[3px] flex-shrink-0">
          {TASKS.map((t) => {
            const isCompleted = t.number < currentTask
            const isActive = t.number === currentTask
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

        {/* Task banner */}
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

        {/* Task complete bar */}
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

        {/* Breadcrumb bar */}
        <div className="w-full bg-white border-b border-light px-8 py-2.5 flex-shrink-0">
          <p className="font-sans text-[11px] text-mid tracking-wide">
            <span className="hover:text-dark cursor-pointer transition-colors">Women</span>
            <span className="mx-2 text-light">/</span>
            <span className="hover:text-dark cursor-pointer transition-colors">Tops</span>
            <span className="mx-2 text-light">/</span>
            <span className="text-dark">Classic Oversized Tee</span>
          </p>
        </div>

        {/* Two-column product grid — flex-1 fills all remaining height */}
        <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* ── LEFT: Image panel ── */}
          <div className="bg-lighter border-r border-light flex overflow-hidden" style={{ padding: '28px' }}>
            {/* Thumbnails */}
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

            {/* Main image */}
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

          {/* ── RIGHT: Product details panel ── */}
          <div className="bg-white overflow-y-auto" style={{ padding: '28px' }}>

            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-mid mb-3">
              Minimalist / Essentials
            </p>

            <h1 className="font-serif text-[28px] font-light text-dark leading-tight mb-2">
              Classic Oversized Tee
            </h1>

            <p className="font-serif text-[22px] font-light text-dark mb-4">£45.00</p>

            <hr className="border-light mb-4" />

            {/* Colour */}
            <div className="mb-4">
              <p className="font-sans text-[11px] uppercase tracking-wider text-mid mb-2">
                Colour&nbsp;<span className="text-dark normal-case tracking-normal">{selectedColour}</span>
              </p>
              <div className="flex gap-2">
                {([
                  { name: 'Black', hex: '#191917' },
                  { name: 'Stone', hex: '#C8C4BA' },
                  { name: 'Sage',  hex: '#8AB87A' },
                  { name: 'Sky',   hex: '#7AAAD4' },
                ] as { name: string; hex: string }[]).map(({ name, hex }) => (
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
            </div>

            <hr className="border-light mb-4" />

            {/* Size */}
            <div className="mb-4">
              <p className="font-sans text-[11px] uppercase tracking-wider text-mid mb-2">Size</p>
              <div className="flex gap-2">
                {(['XS', 'S', 'M', 'L', 'XL'] as string[]).map((size) => {
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

            {/* Add to basket */}
            <button
              onClick={handleAddToBasket}
              className="w-full bg-dark text-white font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-accent transition-colors mb-2"
            >
              Add to basket
            </button>
            {basketError && (
              <p className="font-sans text-[11px] text-brand-red tracking-wide mb-3">
                Please check your colour and size selection.
              </p>
            )}

            {/* Save to wishlist */}
            <button
              onClick={handleSaveToWishlist}
              className="w-full border border-dark text-dark font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-dark hover:text-white transition-colors mb-5"
            >
              Save to wishlist
            </button>

            {/* Description — quick summary strip */}
            <div className="bg-lighter p-4 mb-1">
              <p className="font-sans text-[12px] text-mid leading-relaxed">
                100% organic cotton. Relaxed oversized fit. Model is 5ft 10 wearing size S.
                Machine wash cold.{' '}
                <span
                  onClick={handleFreeReturnsClick}
                  className={`text-brand-green ${currentTask === 2 ? 'cursor-pointer underline underline-offset-2' : ''}`}
                >
                  Free returns within 30 days.
                </span>
              </p>
            </div>

            {/* ── Accordion sections ── */}
            <div className="border-t border-light mt-4">

              {/* 1 — Product details */}
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
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Model is 5ft 10 and wears a size Small. For an oversized fit as shown, we recommend sizing up one size. If you prefer a closer fit, select your usual size.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 — Delivery and returns */}
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
                      <p className="font-sans text-[12px] text-mid leading-relaxed">Items can be returned within <span className="text-dark">30 days</span> of delivery in original condition with tags attached. Sale items can be returned within 14 days.</p>
                      <p className="font-sans text-[12px] text-mid leading-relaxed">To start a return visit our returns portal or email{' '}<a href="mailto:returns@minimalist.com" className="text-dark underline underline-offset-2">returns@minimalist.com</a>. Exchanges are subject to availability.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 — Size guide */}
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

              {/* 4 — Care */}
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

              {/* 5 — FAQ */}
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
                            onClick={() => toggleFaq(i)}
                            className="w-full flex items-start justify-between py-3 text-left"
                          >
                            <span className="font-sans text-[12px] text-mid pr-4 leading-snug">{item.q}</span>
                            <span className="font-sans text-[16px] leading-none select-none text-mid flex-shrink-0 mt-0.5">{openFaqs.has(i) ? '−' : '+'}</span>
                          </button>
                          <div style={{ display: 'grid', gridTemplateRows: openFaqs.has(i) ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                            <div style={{ overflow: 'hidden' }}>
                              <p className="font-sans text-[12px] text-mid leading-relaxed pb-3 pr-6">{item.a}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── You may also like ── */}
            <div className="mt-8 pb-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mid mb-4">You may also like</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { name: 'Classic Crew Neck Sweatshirt', price: '£65.00' },
                  { name: 'Relaxed Fit Chino',            price: '£85.00' },
                  { name: 'Organic Cotton Hoodie',        price: '£95.00' },
                  { name: 'Wide Leg Trouser',             price: '£75.00' },
                ] as { name: string; price: string }[]).map((p) => (
                  <div key={p.name} className="border border-light cursor-pointer group">
                    <div className="w-full flex items-center justify-center" style={{ height: '120px', backgroundColor: '#E8E2D9' }} />
                    <div className="p-3">
                      <p className="font-serif text-[14px] font-light text-dark leading-snug mb-1 group-hover:text-accent transition-colors">{p.name}</p>
                      <p className="font-sans text-[12px] text-mid">{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
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
