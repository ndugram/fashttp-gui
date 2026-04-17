import { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { RequestPanel } from './components/RequestPanel'
import { ResponsePanel } from './components/ResponsePanel'
import { CodePanel } from './components/CodePanel'
import { HistoryPanel } from './components/HistoryPanel'
import type { RequestConfig, HttpResponse, ActiveTab, HistoryEntry } from './types'

const HISTORY_KEY = 'fasthttp-history'
const MAX_HISTORY = 100

const defaultConfig: RequestConfig = {
  url: '',
  method: 'GET',
  headers: [],
  body: '',
}

export function App() {
  const [config, setConfig] = useState<RequestConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState<ActiveTab>('headers')
  const [response, setResponse] = useState<HttpResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(true)
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>()

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const s = localStorage.getItem(HISTORY_KEY)
      return s ? JSON.parse(s) : []
    } catch {
      return []
    }
  })

  const handleConfigChange = useCallback((patch: Partial<RequestConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }))
  }, [])

  async function handleSend() {
    if (!config.url.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    const headers: Record<string, string> = {}
    for (const h of config.headers) {
      if (h.enabled && h.key.trim()) headers[h.key.trim()] = h.value
    }

    try {
      const result = await invoke<HttpResponse>('send_request', {
        url: config.url,
        method: config.method,
        headers,
        body: config.body.trim() || null,
      })
      setResponse(result)

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        method: config.method,
        url: config.url,
        headers: config.headers,
        body: config.body,
        status: result.status,
        elapsed_ms: result.elapsed_ms,
      }

      setHistory(prev => {
        const next = [entry, ...prev].slice(0, MAX_HISTORY)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
        return next
      })
      setActiveHistoryId(entry.id)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function handleLoadEntry(entry: HistoryEntry) {
    setConfig({
      url: entry.url,
      method: entry.method,
      headers: entry.headers,
      body: entry.body,
    })
    setActiveHistoryId(entry.id)
    setResponse(null)
    setError(null)
  }

  function handleClearHistory() {
    setHistory([])
    setActiveHistoryId(undefined)
    localStorage.removeItem(HISTORY_KEY)
  }

  return (
    <div className="app">
      <header className="titlebar">
        <button
          className={`history-toggle-btn${showHistory ? ' active' : ''}`}
          onClick={() => setShowHistory(v => !v)}
          title={showHistory ? 'Hide history' : 'Show history'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
        <span className="titlebar-logo">FastHTTP</span>
        <span className="titlebar-subtitle">GUI Client</span>
        {error && (
          <span className="titlebar-error">{error}</span>
        )}
      </header>

      <div className="workspace">
        <div className={`history-sidebar${showHistory ? '' : ' collapsed'}`}>
          <HistoryPanel
            entries={history}
            activeId={activeHistoryId}
            onLoad={handleLoadEntry}
            onClear={handleClearHistory}
          />
        </div>

        <RequestPanel
          config={config}
          activeTab={activeTab}
          loading={loading}
          onConfigChange={handleConfigChange}
          onTabChange={setActiveTab}
          onSend={handleSend}
        />

        <div className="right-panel">
          <ResponsePanel response={response} loading={loading} />
          <CodePanel config={config} />
        </div>
      </div>
    </div>
  )
}
