import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAllCategories, useArchiveCategory, useUnarchiveCategory } from '@/hooks/useCategories'
import type { Category } from '@/types/index'

export default function Settings() {
  const { data: categories = [] } = useAllCategories()
  const archiveCategory = useArchiveCategory()
  const unarchiveCategory = useUnarchiveCategory()

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const active = categories.filter((c) => !c.is_archived)
  const archived = categories.filter((c) => c.is_archived)

  function openAdd() {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  async function confirmArchive() {
    if (!archivingId) return
    await archiveCategory.mutateAsync(archivingId)
    setArchivingId(null)
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-8 max-w-xl">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Categories
            </h2>
            <Button size="sm" onClick={openAdd}>
              Add category
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {active.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">No categories yet.</p>
            )}
            {active.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onEdit={() => openEdit(cat)}
                onArchive={() => setArchivingId(cat.id)}
              />
            ))}
          </div>

          {archived.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mt-2">
                Archived
              </h2>
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {archived.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    onEdit={() => openEdit(cat)}
                    onUnarchive={() => unarchiveCategory.mutate(cat.id)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <AddCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingCategory}
      />

      <ConfirmDialog
        open={!!archivingId}
        onOpenChange={(open) => !open && setArchivingId(null)}
        title="Archive category?"
        description="The category will be hidden from the dashboard. Existing expenses are preserved."
        onConfirm={confirmArchive}
      />
    </PageShell>
  )
}

interface CategoryRowProps {
  category: Category
  onEdit: () => void
  onArchive?: () => void
  onUnarchive?: () => void
}

function CategoryRow({ category, onEdit, onArchive, onUnarchive }: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm font-medium">{category.name}</span>
        {category.budget_limit !== null && (
          <span className="text-xs text-muted-foreground">${category.budget_limit}/mo</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onEdit}>
          Edit
        </Button>
        {onArchive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={onArchive}
          >
            Archive
          </Button>
        )}
        {onUnarchive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={onUnarchive}
          >
            Restore
          </Button>
        )}
      </div>
    </div>
  )
}
