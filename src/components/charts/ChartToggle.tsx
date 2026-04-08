import { PieChart, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ChartType = 'pie' | 'bar'

interface ChartToggleProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

export function ChartToggle({ value, onChange }: ChartToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1">
      <Button
        variant={value === 'pie' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 gap-1.5 px-3 text-xs"
        onClick={() => onChange('pie')}
      >
        <PieChart className="h-3.5 w-3.5" />
        Pie
      </Button>
      <Button
        variant={value === 'bar' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 gap-1.5 px-3 text-xs"
        onClick={() => onChange('bar')}
      >
        <BarChart2 className="h-3.5 w-3.5" />
        Bar
      </Button>
    </div>
  )
}
