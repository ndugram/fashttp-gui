import { useRef, useEffect, useMemo } from 'react'
import { Plus, X } from 'lucide-react'
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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSend()
  }

  function updateHeader(id: string, patch: Partial<Header>) {
    onConfigChange({ headers: config.headers.map(h => (h.id === id ? { ...h, ...patch } : h)) })
  }

  function deleteHeader(id: string) {
    onConfigChange({ headers: config.headers.filter(h => h.id !== id) })
  }

  function addHeader() {
    onConfigChange({
      headers: [...config.headers, { id: crypto.randomUUID(), key: '', value: '', enabled: true }],
    })
  }

  const activeHeaderCount = config.headers.filter(h => h.enabled && h.key).length

  const urlParams = useMemo(() => {
    try {
      return Array.from(new URL(config.url).searchParams.entries())
    } catch {
      return []
    }
  }, [config.url])

  return (
    <div className="left-panel">
      <div className="request-bar">
        <select
          className={`method-select method-${config.method.toLowerCase()}`}
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
          className={`tab${activeTab === 'headers' ? ' active' : ''}`}
          onClick={() => onTabChange('headers')}
        >
          Headers
          {activeHeaderCount > 0 && (
            <span className="tab-badge">{activeHeaderCount}</span>
          )}
        </button>

        <button
          className={`tab${activeTab === 'body' ? ' active' : ''}`}
          onClick={() => onTabChange('body')}
        >
          Body
          {config.body.trim() && <span className="tab-dot" />}
        </button>

        <button
          className={`tab${activeTab === 'params' ? ' active' : ''}`}
          onClick={() => onTabChange('params')}
        >
          Params
          {urlParams.length > 0 && (
            <span className="tab-badge">{urlParams.length}</span>
          )}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'headers' && (
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
                    className={`header-input${!header.enabled ? ' disabled' : ''}`}
                    type="text"
                    placeholder="Header name"
                    value={header.key}
                    onChange={e => updateHeader(header.id, { key: e.target.value })}
                    disabled={!header.enabled}
                    spellCheck={false}
                  />
                  <input
                    className={`header-input${!header.enabled ? ' disabled' : ''}`}
                    type="text"
                    placeholder="Value"
                    value={header.value}
                    onChange={e => updateHeader(header.id, { value: e.target.value })}
                    disabled={!header.enabled}
                    spellCheck={false}
                  />
                  <button className="header-delete" onClick={() => deleteHeader(header.id)}>
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-header-btn" onClick={addHeader}>
              <Plus size={13} strokeWidth={2} />
              Add Header
            </button>
          </>
        )}

        {activeTab === 'body' && (
          <textarea
            className="body-editor"
            placeholder={'{\n  "key": "value"\n}'}
            value={config.body}
            onChange={e => onConfigChange({ body: e.target.value })}
            spellCheck={false}
          />
        )}

        {activeTab === 'params' && (
          <div className="params-list">
            {urlParams.length === 0 ? (
              <div className="params-empty">
                <span>No query parameters in URL</span>
              </div>
            ) : (
              urlParams.map(([key, value], i) => (
                <div key={i} className="param-row">
                  <span className="param-key">{key}</span>
                  <span className="param-value">{value || '—'}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
