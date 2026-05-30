'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import type { ParticipantData, TaskMeta } from '@/types'

const NAV_LINKS = [
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'New in', href: '/new-in' },
  { label: 'Sale', href: '/sale' },
]

const TASKS: TaskMeta[] = [
  { number: 1, label: 'Task 1', instruction: 'Find and add the Classic Oversized Tee to your wishlist.' },
  { number: 2, label: 'Task 2', instruction: 'Locate a linen trouser under £80 and add it to your basket.' },
  { number: 3, label: 'Task 3', instruction: 'Use the search function to find a navy wool coat.' },
  { number: 4, label: 'Task 4', instruction: 'Navigate to the Sale section and find an item you would purchase.' },
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

      {/* Product placeholder */}
      <div className="px-8 py-12 font-sans text-[13px] text-mid">
        Product goes here
        {participantData && (
          <span className="ml-4 text-[11px] text-light">
            (Participant: {participantData.participantId} · Variant: {variant})
          </span>
        )}
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
