import { useState } from 'react'
import { Target, Plus, Trash2 } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useGoals, useAddGoal, useAddGoalFunds, useDeleteGoal } from '@/hooks/useGoals'
import type { Goal } from '@/types/index'

const EMOJI_OPTIONS = ['🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏖️', '🏋️', '🎸', '📷', '🌍', '💰', '🎁', '🛋️']

function GoalCard({ goal }: { goal: Goal }) {
  const [fundsOpen, setFundsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [fundsInput, setFundsInput] = useState('')
  const addFunds = useAddGoalFunds()
  const deleteGoal = useDeleteGoal()

  const progress = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0
  const isDone = goal.current_amount >= goal.target_amount

  async function handleAddFunds() {
    const amount = parseFloat(fundsInput)
    if (isNaN(amount) || amount <= 0) return
    await addFunds.mutateAsync({ id: goal.id, amount })
    setFundsInput('')
    setFundsOpen(false)
  }

  return (
    <>
      <div
        className="card-hover rounded-xl border border-border bg-card p-5"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {goal.emoji ? (
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{goal.emoji}</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'var(--muted)' }}>
                <Target size={18} className="text-muted-foreground" />
              </span>
            )}
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>{goal.title}</p>
              {isDone && (
                <p style={{ fontSize: '12px', color: '#4ade80', fontWeight: 500 }}>Completed!</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete goal"
            style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>{Math.round(progress)}%</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              ${goal.current_amount.toFixed(0)}
              <span style={{ fontWeight: 400, color: 'var(--muted-foreground)' }}> / ${goal.target_amount.toFixed(0)}</span>
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(150,150,150,0.2)' }}>
            <div
              style={{
                height: '6px',
                width: `${progress}%`,
                borderRadius: '9999px',
                background: isDone
                  ? '#4ade80'
                  : 'linear-gradient(to right, #4ade80, #facc15, #f97316)',
                backgroundSize: isDone ? undefined : `${(10000 / Math.max(progress, 1)).toFixed(1)}% 100%`,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {!isDone && (
          <Button size="sm" variant="outline" onClick={() => setFundsOpen(true)} style={{ width: '100%' }}>
            Add funds
          </Button>
        )}
      </div>

      <Dialog open={fundsOpen} onOpenChange={setFundsOpen}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Add funds — {goal.title}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="funds">Amount</Label>
              <Input
                id="funds"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={fundsInput}
                onChange={(e) => setFundsInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddFunds()}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setFundsOpen(false)}>Cancel</Button>
              <Button onClick={handleAddFunds} disabled={addFunds.isPending}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete goal"
        description={`"${goal.title}" will be permanently deleted.`}
        onConfirm={() => deleteGoal.mutateAsync(goal.id)}
        isLoading={deleteGoal.isPending}
      />
    </>
  )
}

export default function Goals() {
  const { data: goals = [] } = useGoals()
  const addGoal = useAddGoal()

  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)

  async function handleAdd() {
    const target = parseFloat(targetInput)
    if (!title.trim() || isNaN(target) || target <= 0) return
    await addGoal.mutateAsync({ title: title.trim(), target_amount: target, emoji })
    setTitle('')
    setTargetInput('')
    setEmoji(null)
    setAddOpen(false)
  }

  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="text-2xl font-semibold">Goals</h1>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            New goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '64px 0', color: 'var(--muted-foreground)' }}>
            <Target size={40} strokeWidth={1.5} />
            <p style={{ fontSize: '15px' }}>No goals yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>New goal</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                placeholder="e.g. New laptop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="goal-target">Target amount</Label>
              <Input
                id="goal-target"
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label>Emoji (optional)</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(emoji === e ? null : e)}
                    style={{
                      fontSize: '20px',
                      padding: '4px',
                      borderRadius: '6px',
                      border: '2px solid',
                      borderColor: emoji === e ? 'var(--primary)' : 'transparent',
                      background: emoji === e ? 'var(--accent)' : 'transparent',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={addGoal.isPending}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
