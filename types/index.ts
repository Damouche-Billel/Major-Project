// Shared TypeScript types

export interface ParticipantData {
  participantId: string
  ageRange: string
  shoppingFrequency: string
}

export interface TaskMeta {
  number: number
  label: string
  instruction: string
}

export interface SessionData {
  variant: string
  task1Start: number | null
  task1End: number | null
  task2Start: number | null
  task2End: number | null
  task3Start: number | null
  task3End: number | null
  task4Start: number | null
  task4End: number | null
  totalClicks: number
  errorClicks: number
  sizeChanges: number
  colourChanges: number
}
