'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Nav from '@/components/Nav'
import type { ParticipantData, TaskMeta } from '@/types'

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
  { number: 1, label: 'Task 1', instruction: 'Find a size Medium in Black and add it to your basket.' },
  { number: 2, label: 'Task 2', instruction: 'Check whether this item has free returns.' },
  { number: 3, label: 'Task 3', instruction: 'Save the item to your wishlist.' },
  { number: 4, label: 'Task 4', instruction: 'Navigate to the Contact page.' },
]

const TOTAL_TASKS = TASKS.length

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function TaskPageInner() {
  const searchParams = useSearchParams()
  const variant = searchParams.get('variant') ?? 'a'

  const [participantData, setParticipantData] = useState<ParticipantData | null>(null)
  const [currentTask, setCurrentTask] = useState<number>(1)
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState<number>(0)
  const [activeThumb, setActiveThumb] = useState<number>(0)
  const [selectedColour, setSelectedColour] = useState<string>('Black')
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [totalClicks, setTotalClicks] = useState<number>(0)
  const [sizeChanges, setSizeChanges] = useState<number>(0)
  const [colourChanges, setColourChanges] = useState<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function track() {
    setTotalClicks((n) => n + 1)
  }

  function handleColour(name: string) {
    track()
    if (name !== selectedColour) {
      setSelectedColour(name)
      setColourChanges((n) => n + 1)
      setActiveThumb(0)
    }
  }

  function handleSize(size: string) {
    track()
    if (size !== selectedSize) {
      setSelectedSize(size)
      setSizeChanges((n) => n + 1)
    }
  }

  // Load participant data from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('participantData')
    if (raw) {
      try {
        setParticipantData(JSON.parse(raw) as ParticipantData)
      } catch {
        // ignore malformed data
      }
    }
    // Auto-start timer on mount
    setTaskStartTime(new Date())
  }, [])

  // Timer interval
  useEffect(() => {
    if (!taskStartTime) return

    setElapsed(0)
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - taskStartTime.getTime()) / 1000))
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [taskStartTime])

  const task = TASKS[currentTask - 1]

  return (
    <>
      <Nav links={NAV_LINKS} activeLink="Women" />

      {/* Task progress bar */}
      <div className="flex w-full h-[3px]">
        {TASKS.map((t) => {
          const isCompleted = t.number < currentTask
          const isActive = t.number === currentTask
          return (
            <div
              key={t.number}
              className={`flex-1 transition-colors duration-300 ${
                isCompleted
                  ? 'bg-accent'
                  : isActive
                  ? 'bg-dark'
                  : 'bg-light'
              }`}
            />
          )
        })}
      </div>

      {/* Task banner */}
      <div className="w-full bg-dark flex items-stretch min-h-[72px]">
        {/* Left: task instruction */}
        <div className="flex-1 flex flex-col justify-center px-8 py-4 border-r border-white/10">
          <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">
            Task {currentTask} of {TOTAL_TASKS}
          </span>
          <p className="font-serif italic text-[18px] font-light text-white leading-snug">
            {task.instruction}
          </p>
        </div>

        {/* Right: timer pill */}
        <div className="flex items-center justify-center px-8">
          <div className="flex items-center gap-2 border border-white/20 px-4 py-2">
            {/* Pulse dot */}
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

      {/* Breadcrumb bar */}
      <div className="w-full bg-white border-b border-light px-8 py-2.5">
        <p className="font-sans text-[11px] text-mid tracking-wide">
          <span className="hover:text-dark cursor-pointer transition-colors">Women</span>
          <span className="mx-2 text-light">/</span>
          <span className="hover:text-dark cursor-pointer transition-colors">Tops</span>
          <span className="mx-2 text-light">/</span>
          <span className="text-dark">Classic Oversized Tee</span>
        </p>
      </div>

      {/* Two-column product grid */}
      <div
        className="grid overflow-hidden"
        style={{
          gridTemplateColumns: '1fr 1fr',
          height: 'calc(100vh - 54px - 3px - 72px - 37px)',
        }}
      >
        {/* ── LEFT: Image panel ── */}
        <div className="bg-lighter border-r border-light flex overflow-hidden" style={{ padding: '28px' }}>

          {/* Thumbnails column */}
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

          {/* Main image area */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={COLOUR_IMAGES[selectedColour][activeThumb]}
              alt={`Classic Oversized Tee in ${selectedColour}`}
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />

            {/* Scarcity badge — only visible in variant b */}
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

          {/* Category label */}
          <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-mid mb-3">
            Minimalist / Essentials
          </p>

          {/* Product name */}
          <h1 className="font-serif text-[28px] font-light text-dark leading-tight mb-2">
            Classic Oversized Tee
          </h1>

          {/* Price */}
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
                const disabled = size === 'XS'
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
            onClick={track}
            className="w-full bg-dark text-white font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-accent transition-colors mb-3"
          >
            Add to basket
          </button>

          {/* Save to wishlist */}
          <button
            onClick={track}
            className="w-full border border-dark text-dark font-sans text-[11px] uppercase tracking-[0.15em] py-3.5 hover:bg-dark hover:text-white transition-colors mb-5"
          >
            Save to wishlist
          </button>

          {/* Description */}
          <div className="bg-lighter p-4">
            <p className="font-sans text-[12px] text-mid leading-relaxed">
              100% organic cotton. Relaxed oversized fit. Model is 5ft 10 wearing size S.
              Machine wash cold.{' '}
              <span className="text-brand-green">Free returns within 30 days.</span>
            </p>
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
