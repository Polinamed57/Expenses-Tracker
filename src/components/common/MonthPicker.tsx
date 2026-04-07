import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonthPickerProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  function prev() {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  function next() {
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={prev} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium">
        {MONTHS[month - 1]} {year}
      </span>
      <Button variant="ghost" size="icon" onClick={next} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
