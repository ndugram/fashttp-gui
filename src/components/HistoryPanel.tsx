import { useState } from 'react'
import type { HistoryEntry } from '../types'

interface Props {
  entries: HistoryEntry[]
  activeId?: string
  onLoad: (entry: HistoryEntry) => void
  onClear: () => void
}

const METHOD_COLOR: Record<string, string> = {
  GET:    'var(--green)',
  POST:   'var(--accent)',
  PUT:    'var(--yellow)',
  DELETE: 'var(--red)',
  PATCH:  'var(--orange)',
}

function statusCls(s?: number) {
  if (!s) return ''
  if (s < 300) return 'status-2xx'
  if (s < 400) return 'status-3xx'
  if (s < 500) return 'status-4xx'
  return 'status-5xx'
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1)  return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function trimUrl(url: string): string {
  try {
    const u = new URL(url)
    return (u.hostname + u.pathname).replace(/\/$/, '') || url
  } catch {
    return url.replace(/^https?:\/\//, '')
  }
}

export function HistoryPanel({ entries, activeId, onLoad, onClear }: Props) {
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = q
    ? entries.filter(e =>
        e.url.toLowerCase().includes(q) || e.method.toLowerCase().includes(q)
      )
    : entries

  function handleClear() {
    if (window.confirm('Clear all request history?')) onClear()
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <div className="history-header-left">
          <span className="history-title">History</span>
          {entries.length > 0 && (
            <span className="history-count">{entries.length}</span>
          )}
        </div>
        {entries.length > 0 && (
          <button className="history-clear-btn" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {entries.length > 0 && (
        <div className="history-search-wrap">
          <input
            className="history-search-input"
            type="text"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            spellCheck={false}
          />
          {query && (
            <button className="history-search-x" onClick={() => setQuery('')}>
              ×
            </button>
          )}
        </div>
      )}

      <div className="history-list">
        {entries.length === 0 && (
          <div className="history-empty">
            <svg className="history-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" strokeLinecap="round" />
            </svg>
            <span className="history-empty-text">No requests yet</span>
          </div>
        )}

        {entries.length > 0 && filtered.length === 0 && (
          <div className="history-empty">
            <svg className="history-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
              <line x1="8" y1="11" x2="14" y2="11" strokeLinecap="round" />
            </svg>
            <span className="history-empty-text">No results</span>
          </div>
        )}

        {filtered.map(entry => (
          <button
            key={entry.id}
            className={`history-item${entry.id === activeId ? ' active' : ''}`}
            onClick={() => onLoad(entry)}
          >
            <div className="history-item-top">
              <span className="history-method" style={{ color: METHOD_COLOR[entry.method] }}>
                {entry.method}
              </span>
              <span className="history-url">{trimUrl(entry.url) || '—'}</span>
              <span className="history-time">{timeAgo(entry.timestamp)}</span>
            </div>
            {(entry.status !== undefined || entry.elapsed_ms !== undefined) && (
              <div className="history-item-meta">
                {entry.status !== undefined && (
                  <span className={`history-status-badge ${statusCls(entry.status)}`}>
                    {entry.status}
                  </span>
                )}
                {entry.elapsed_ms !== undefined && (
                  <span className="history-elapsed">{entry.elapsed_ms}ms</span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
