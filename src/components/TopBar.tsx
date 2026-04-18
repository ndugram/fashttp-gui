import { useState, useRef } from 'react'
import { Search, User, Settings, X } from 'lucide-react'
import type { HistoryEntry } from '../types'

const METHOD_COLOR: Record<string, string> = {
  GET:    'var(--green)',
  POST:   'var(--accent)',
  PUT:    'var(--yellow)',
  DELETE: 'var(--red)',
  PATCH:  'var(--orange)',
}

interface Props {
  onProfileClick: () => void
  onSettingsClick: () => void
  profileActive: boolean
  settingsActive: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  history: HistoryEntry[]
  onLoadEntry: (entry: HistoryEntry) => void
  error: string | null
}

export function TopBar({
  onProfileClick,
  onSettingsClick,
  profileActive,
  settingsActive,
  searchQuery,
  onSearchChange,
  history,
  onLoadEntry,
  error,
}: Props) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const q = searchQuery.trim().toLowerCase()
  const results = q && focused
    ? history
        .filter(e => e.url.toLowerCase().includes(q) || e.method.toLowerCase().includes(q))
        .slice(0, 8)
    : []

  function handleSelect(entry: HistoryEntry) {
    onLoadEntry(entry)
    onSearchChange('')
    inputRef.current?.blur()
  }

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <div className="logo-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        <span className="logo-name">FastHTTP</span>
      </div>

      <div className={`topbar-search${focused ? ' focused' : ''}`}>
        <div className="topbar-search-inner">
          <Search size={13} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search history…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            spellCheck={false}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              <X size={11} />
            </button>
          )}
        </div>

        {results.length > 0 && (
          <div className="search-results">
            {results.map(entry => (
              <button
                key={entry.id}
                className="search-result-item"
                onMouseDown={() => handleSelect(entry)}
              >
                <span
                  className="search-result-method"
                  style={{ color: METHOD_COLOR[entry.method] }}
                >
                  {entry.method}
                </span>
                <span className="search-result-url">{entry.url}</span>
                {entry.status !== undefined && (
                  <span className={`search-result-status status-${Math.floor(entry.status / 100)}xx`}>
                    {entry.status}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {error && <span className="topbar-error">{error}</span>}

        <button
          className={`topbar-btn${profileActive ? ' active' : ''}`}
          onClick={onProfileClick}
          title="Profile"
        >
          <User size={15} strokeWidth={1.75} />
        </button>

        <button
          className={`topbar-btn${settingsActive ? ' active' : ''}`}
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings size={15} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
