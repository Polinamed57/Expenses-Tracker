import {
  ComposedChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyTotal } from '@/types/index'

interface ExpenseBarChartProps {
  totals: MonthlyTotal[]
}

interface BudgetLineShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  budget_limit?: number | null
}

function BudgetLineShape({ x = 0, y = 0, width = 0, budget_limit }: BudgetLineShapeProps) {
  if (!budget_limit) return null
  return (
    <line
      x1={x}
      y1={y}
      x2={x + width}
      y2={y}
      stroke="#94a3b8"
      strokeWidth={2}
      strokeDasharray="4 3"
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

export function ExpenseBarChart({ totals }: ExpenseBarChartProps) {
  if (totals.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No data for this month
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={totals} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <XAxis
          dataKey="category_name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {totals.map((item) => {
            const isOver = item.budget_limit !== null && item.total > item.budget_limit
            const hasLimit = item.budget_limit !== null
            const fill = isOver ? '#ef4444' : hasLimit ? '#22c55e' : item.color
            return <Cell key={item.category_id} fill={fill} />
          })}
        </Bar>
        <Bar
          dataKey="budget_limit"
          shape={(props: BudgetLineShapeProps) => <BudgetLineShape {...props} />}
          legendType="none"
          tooltipType="none"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
