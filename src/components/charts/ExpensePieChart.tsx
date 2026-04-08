import { PieChart, Pie, Sector, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyTotal } from '@/types/index'

interface ExpensePieChartProps {
  totals: MonthlyTotal[]
}

const BASE_RADIUS = 80

interface SectorProps {
  cx: number
  cy: number
  innerRadius: number
  startAngle: number
  endAngle: number
  payload: MonthlyTotal
}

function CustomSector(props: SectorProps) {
  const { cx, cy, innerRadius, startAngle, endAngle, payload } = props
  const isOver = payload.budget_limit !== null && payload.total > payload.budget_limit
  const hasLimit = payload.budget_limit !== null

  const outerRadius = isOver ? BASE_RADIUS + 14 : hasLimit ? BASE_RADIUS - 8 : BASE_RADIUS
  const fill = isOver ? '#ef4444' : hasLimit ? '#22c55e' : payload.color

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  )
}

interface TooltipPayload {
  payload: MonthlyTotal
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.category_name}</p>
      <p className="text-muted-foreground">${item.total.toFixed(2)}</p>
      {item.budget_limit !== null && (
        <p className="text-muted-foreground">Limit: ${item.budget_limit.toFixed(2)}</p>
      )}
    </div>
  )
}

export function ExpensePieChart({ totals }: ExpensePieChartProps) {
  if (totals.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No data for this month
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={totals}
          dataKey="total"
          nameKey="category_name"
          cx="50%"
          cy="50%"
          outerRadius={BASE_RADIUS}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shape={(props: any) => <CustomSector {...props} />}
        />
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
