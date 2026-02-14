import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { cn } from '../../lib/utils'

interface Props {
  label: string
  onRemove?: () => void
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}

const TagChip = ({ label, onRemove, onClick, size = 'md', className }: Props) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border',
        'bg-forest-50 dark:bg-forest-900/50',
        'text-forest-700 dark:text-forest-300',
        'border-forest-200 dark:border-forest-700',
        sizeClasses,
        onClick && 'cursor-pointer hover:bg-forest-100 dark:hover:bg-forest-900/70',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      data-testid="tag-chip"
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:text-red-500 transition-colors"
          aria-label={`Remove ${label}`}
          data-testid="tag-chip-remove"
        >
          <FontAwesomeIcon icon={faClose} className={size === 'sm' ? 'text-[10px]' : 'text-xs'} />
        </button>
      )}
    </span>
  )
}

export { TagChip }
