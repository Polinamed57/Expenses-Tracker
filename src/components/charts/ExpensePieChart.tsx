import { PieChart, Pie, Sector, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyTotal } from '@/types/index'
import { useCategories } from '@/hooks/useCategories'

interface ExpensePieChartProps {
  totals: MonthlyTotal[]
}

const BASE_RADIUS = 90
const OVER_DELTA = 22
const UNDER_DELTA = 12

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

  const outerRadius = isOver
    ? BASE_RADIUS + OVER_DELTA
    : hasLimit
      ? BASE_RADIUS - UNDER_DELTA
      : BASE_RADIUS

  // over budget: red, within budget: category color slightly dimmed, no limit: category color
  const fill = isOver ? '#ef4444' : payload.color
  const opacity = hasLimit && !isOver ? 0.7 : 1
  const stroke = isOver ? '#b91c1c' : 'transparent'

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      fillOpacity={opacity}
      stroke={stroke}
      strokeWidth={isOver ? 2 : 0}
    />
  )
}

interface TooltipPayload {
  payload: MonthlyTotal
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const isOver = item.budget_limit !== null && item.total > item.budget_limit
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontWeight: 600, marginBottom: '4px' }}>{item.category_name}</p>
      <p style={{ color: isOver ? '#ef4444' : 'var(--muted-foreground)' }}>${item.total.toFixed(2)}</p>
      {item.budget_limit !== null && (
        <p style={{ color: 'var(--muted-foreground)' }}>Limit: ${item.budget_limit.toFixed(2)}</p>
      )}
    </div>
  )
}

export function ExpensePieChart({ totals }: ExpensePieChartProps) {
  const { data: categories = [] } = useCategories()
  const iconByCategory = Object.fromEntries(categories.map((c) => [c.id, c.icon]))
  if (totals.length === 0) {
    return (
      <div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">
        No data for this month
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={totals}
            dataKey="total"
            nameKey="category_name"
            cx="50%"
            cy="50%"
            outerRadius={BASE_RADIUS}
            stroke="none"
            style={{ outline: 'none' }}
            focusable={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shape={(props: any) => <CustomSector {...props} />}
          />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center' }}>
        {totals.map((item) => {
          const isOver = item.budget_limit !== null && item.total > item.budget_limit
          return (
            <div key={item.category_id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              {iconByCategory[item.category_id] ? (
                <span style={{ fontSize: '14px', lineHeight: 1, flexShrink: 0 }}>{iconByCategory[item.category_id]}</span>
              ) : (
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  backgroundColor: isOver ? '#ef4444' : item.color,
                  display: 'inline-block',
                  flexShrink: 0,
                }} />
              )}
              <span style={{ color: 'var(--muted-foreground)' }}>{item.category_name}</span>
              <span style={{ fontWeight: 600, color: isOver ? '#ef4444' : 'var(--foreground)' }}>
                ${item.total.toFixed(0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
