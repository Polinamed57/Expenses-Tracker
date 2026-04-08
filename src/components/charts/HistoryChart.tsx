import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useExpenseHistory } from '@/hooks/useExpenseHistory'

const RANGE_OPTIONS = [3, 6, 12] as const
type RangeMonths = (typeof RANGE_OPTIONS)[number]

interface TooltipPayload {
  payload: { label: string; total: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground">${item.total.toFixed(2)}</p>
    </div>
  )
}

export function HistoryChart() {
  const [range, setRange] = useState<RangeMonths>(6)
  const { points, isLoading } = useExpenseHistory(range)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Spending history</h2>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}m
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={points} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {points.map((point) => (
                  <Cell
                    key={`${point.year}-${point.month}`}
                    fill={
                      point.year === currentYear && point.month === currentMonth
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))'
                    }
                    opacity={
                      point.year === currentYear && point.month === currentMonth ? 1 : 0.45
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
