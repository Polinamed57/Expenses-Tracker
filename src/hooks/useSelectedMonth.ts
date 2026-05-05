import { useCallback, useState } from 'react'

const STORAGE_KEY = 'selectedMonth'

type SelectedMonth = { year: number; month: number }

function readStored(): SelectedMonth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SelectedMonth>
    if (
      typeof parsed.year === 'number' &&
      typeof parsed.month === 'number' &&
      parsed.month >= 1 &&
      parsed.month <= 12
    ) {
      return { year: parsed.year, month: parsed.month }
    }
    return null
  } catch {
    return null
  }
}

export function useSelectedMonth(initial?: SelectedMonth) {
  const [value, setValue] = useState<SelectedMonth>(() => {
    if (initial) return initial
    const stored = readStored()
    if (stored) return stored
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })

  const setSelectedMonth = useCallback((year: number, month: number) => {
    setValue({ year, month })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ year, month }))
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [])

  return { year: value.year, month: value.month, setSelectedMonth }
}
