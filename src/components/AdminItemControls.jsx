import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEditMode } from '../contexts/EditModeContext'

export default function AdminItemControls({
  label = 'Item',
  onEdit,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}) {
  const { isEditMode, isPreviewMode } = useEditMode()
  if (!isEditMode || isPreviewMode) return null

  const buttonClass = 'grid h-8 w-8 place-items-center rounded-full bg-brand-primary text-white shadow-lg ring-1 ring-white/50 transition hover:bg-brand-primary-dark disabled:opacity-30'

  return (
    <div className="absolute end-2 top-2 z-[80] flex items-center gap-1">
      {onEdit && (
        <button type="button" onClick={onEdit} className={buttonClass} title={`Edit ${label}`} aria-label={`Edit ${label}`}>
          <Pencil size={14} />
        </button>
      )}
      {onAdd && (
        <button type="button" onClick={onAdd} className={buttonClass} title={`Add ${label}`} aria-label={`Add ${label}`}>
          <Plus size={14} />
        </button>
      )}
      {onMoveUp && (
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className={buttonClass} title={`Move ${label} up`} aria-label={`Move ${label} up`}>
          <ArrowUp size={14} />
        </button>
      )}
      {onMoveDown && (
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className={buttonClass} title={`Move ${label} down`} aria-label={`Move ${label} down`}>
          <ArrowDown size={14} />
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow-lg ring-1 ring-white/50 transition hover:bg-red-700" title={`Delete ${label}`} aria-label={`Delete ${label}`}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
