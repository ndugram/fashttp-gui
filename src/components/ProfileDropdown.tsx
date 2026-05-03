import { useEffect, useRef } from 'react'
import { Monitor, Package, Cpu, Download, Trash2, RefreshCw, X } from 'lucide-react'

interface Props {
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export function ProfileDropdown({ onClose, triggerRef }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (ref.current && !ref.current.contains(target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, triggerRef])

  const platform = navigator.platform || 'Unknown'

  return (
    <div className="profile-dropdown" ref={ref}>
      <div className="profile-dropdown-header">
        <div className="profile-avatar">
          <Monitor size={18} strokeWidth={1.75} />
        </div>
        <div>
          <div className="profile-device-name">Local Machine</div>
          <div className="profile-device-sub">FastHTTP Client</div>
        </div>
        <button className="profile-close" onClick={onClose}>
          <X size={13} />
        </button>
      </div>

      <div className="profile-info">
        <div className="profile-info-row">
          <Package size={13} strokeWidth={1.75} />
          <span className="profile-info-label">Version</span>
          <span className="profile-info-value">1.0.0</span>
        </div>
        <div className="profile-info-row">
          <Cpu size={13} strokeWidth={1.75} />
          <span className="profile-info-label">Platform</span>
          <span className="profile-info-value">{platform}</span>
        </div>
      </div>

      <div className="profile-divider" />

      <div className="profile-actions">
        <button className="profile-action-btn">
          <Download size={14} strokeWidth={1.75} />
          Export Data
        </button>
        <button className="profile-action-btn danger">
          <Trash2 size={14} strokeWidth={1.75} />
          Clear Cache
        </button>
        <button className="profile-action-btn">
          <RefreshCw size={14} strokeWidth={1.75} />
          Check Updates
        </button>
      </div>
    </div>
  )
}
