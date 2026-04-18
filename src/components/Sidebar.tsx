import { Clock, FolderOpen, Layers } from 'lucide-react'
import type { SideSection } from '../types'

interface Props {
  active: SideSection
  onToggle: (section: SideSection) => void
}

const items = [
  { id: 'history' as const,      Icon: Clock,      label: 'History' },
  { id: 'collections' as const,  Icon: FolderOpen, label: 'Collections' },
  { id: 'environments' as const, Icon: Layers,     label: 'Environments' },
]

export function Sidebar({ active, onToggle }: Props) {
  return (
    <div className="icon-rail">
      {items.map(({ id, Icon, label }) => (
        <button
          key={id}
          className={`rail-btn${active === id ? ' active' : ''}`}
          onClick={() => onToggle(active === id ? null : id)}
          title={label}
          aria-label={label}
        >
          <Icon size={17} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
