import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/turso'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      participantId,
      ageRange,
      shoppingFrequency,
      variant,
      task1Start, task1End,
      task2Start, task2End,
      task3Start, task3End,
      task4Start, task4End,
      totalClicks,
      errorClicks,
      sizeChanges,
      colourChanges,
      likert,
      openText,
    } = body

    const task1Time = task1Start && task1End ? Math.round((task1End - task1Start) / 1000) : null
    const task2Time = task2Start && task2End ? Math.round((task2End - task2Start) / 1000) : null
    const task3Time = task3Start && task3End ? Math.round((task3End - task3Start) / 1000) : null
    const task4Time = task4Start && task4End ? Math.round((task4End - task4Start) / 1000) : null

    await db.execute({
      sql: `INSERT INTO sessions (
        participant_id, age_range, shopping_frequency, variant,
        task1_s, task2_s, task3_s, task4_s,
        total_clicks, error_clicks, size_changes, colour_changes,
        q1_perceived_usefulness, q2_ease_of_use, q3_trust, q4_purchase_intent,
        open_text, submitted_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        participantId,
        ageRange,
        shoppingFrequency,
        variant,
        task1Time, task2Time, task3Time, task4Time,
        totalClicks, errorClicks, sizeChanges, colourChanges,
        likert[0], likert[1], likert[2], likert[3],
        openText ?? '',
        new Date().toISOString(),
      ],
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('submit error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
