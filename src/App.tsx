import { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { RequestPanel } from './components/RequestPanel'
import { ResponsePanel } from './components/ResponsePanel'
import { CodePanel } from './components/CodePanel'
import type { RequestConfig, HttpResponse, ActiveTab } from './types'

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
      if (h.enabled && h.key.trim()) {
        headers[h.key.trim()] = h.value
      }
    }

    try {
      const result = await invoke<HttpResponse>('send_request', {
        url: config.url,
        method: config.method,
        headers,
        body: config.body.trim() || null,
      })
      setResponse(result)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="titlebar">
        <span className="titlebar-logo">FastHTTP</span>
        <span className="titlebar-subtitle">GUI Client</span>
        {error && (
          <span style={{ marginLeft: 'auto', color: 'var(--red)', fontSize: 11 }}>
            {error}
          </span>
        )}
      </header>

      <div className="workspace">
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
