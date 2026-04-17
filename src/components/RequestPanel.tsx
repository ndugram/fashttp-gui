import { useRef, useEffect } from 'react'
import type { RequestConfig, HttpMethod, Header, ActiveTab } from '../types'

interface Props {
  config: RequestConfig
  activeTab: ActiveTab
  loading: boolean
  onConfigChange: (patch: Partial<RequestConfig>) => void
  onTabChange: (tab: ActiveTab) => void
  onSend: () => void
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

export function RequestPanel({ config, activeTab, loading, onConfigChange, onTabChange, onSend }: Props) {
  const urlRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    urlRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSend()
    }
  }

  function updateHeader(id: string, patch: Partial<Header>) {
    onConfigChange({
      headers: config.headers.map(h => (h.id === id ? { ...h, ...patch } : h)),
    })
  }

  function deleteHeader(id: string) {
    onConfigChange({ headers: config.headers.filter(h => h.id !== id) })
  }

  function addHeader() {
    const id = crypto.randomUUID()
    onConfigChange({ headers: [...config.headers, { id, key: '', value: '', enabled: true }] })
  }

  const methodClass = `method-${config.method.toLowerCase()}`

  return (
    <div className="left-panel">
      <div className="request-bar">
        <select
          className={`method-select ${methodClass}`}
          value={config.method}
          onChange={e => onConfigChange({ method: e.target.value as HttpMethod })}
        >
          {METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          ref={urlRef}
          className="url-input"
          type="text"
          placeholder="https://api.example.com/endpoint"
          value={config.url}
          onChange={e => onConfigChange({ url: e.target.value })}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        <button
          className="send-button"
          onClick={onSend}
          disabled={loading || !config.url.trim()}
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => onTabChange('headers')}
        >
          Headers
          {config.headers.filter(h => h.enabled && h.key).length > 0 && (
            <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontSize: 10 }}>
              {config.headers.filter(h => h.enabled && h.key).length}
            </span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => onTabChange('body')}
        >
          Body
          {config.body.trim() && (
            <span style={{ marginLeft: 6, color: 'var(--accent)', fontSize: 10 }}>●</span>
          )}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'headers' ? (
          <>
            <div className="headers-list">
              {config.headers.map(header => (
                <div key={header.id} className="header-row">
                  <input
                    type="checkbox"
                    className="header-checkbox"
                    checked={header.enabled}
                    onChange={e => updateHeader(header.id, { enabled: e.target.checked })}
                  />
                  <input
                    className={`header-input ${!header.enabled ? 'disabled' : ''}`}
                    type="text"
                    placeholder="Header name"
                    value={header.key}
                    onChange={e => updateHeader(header.id, { key: e.target.value })}
                    disabled={!header.enabled}
                    spellCheck={false}
                  />
                  <input
                    className={`header-input ${!header.enabled ? 'disabled' : ''}`}
                    type="text"
                    placeholder="Value"
                    value={header.value}
                    onChange={e => updateHeader(header.id, { value: e.target.value })}
                    disabled={!header.enabled}
                    spellCheck={false}
                  />
                  <button className="header-delete" onClick={() => deleteHeader(header.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button className="add-header-btn" onClick={addHeader}>
              + Add Header
            </button>
          </>
        ) : (
          <textarea
            className="body-editor"
            placeholder={'{\n  "key": "value"\n}'}
            value={config.body}
            onChange={e => onConfigChange({ body: e.target.value })}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}
