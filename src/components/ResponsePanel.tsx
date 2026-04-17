import { useState } from 'react'
import type { HttpResponse } from '../types'

interface Props {
  response: HttpResponse | null
  loading: boolean
}

type ResponseTab = 'body' | 'headers'

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'status-2xx'
  if (status >= 300 && status < 400) return 'status-3xx'
  if (status >= 400 && status < 500) return 'status-4xx'
  return 'status-5xx'
}

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function isJson(raw: string): boolean {
  try {
    JSON.parse(raw)
    return true
  } catch {
    return false
  }
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span class="json-key">${match}</span>`
          return `<span class="json-string">${match}</span>`
        }
        if (/true|false/.test(match)) return `<span class="json-boolean">${match}</span>`
        if (/null/.test(match)) return `<span class="json-null">${match}</span>`
        return `<span class="json-number">${match}</span>`
      }
    )
}

export function ResponsePanel({ response, loading }: Props) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('body')

  return (
    <div className="response-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="response-header">
        <span className="response-label">Response</span>
        {response && (
          <div className="response-meta">
            <span className={`status-badge ${statusClass(response.status)}`}>
              {response.status}
            </span>
            <span className="elapsed">{response.elapsed_ms}ms</span>
          </div>
        )}
      </div>

      {loading && <div className="loading-bar" />}

      {response && (
        <div className="response-tabs tabs">
          <button
            className={`tab ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            Body
          </button>
          <button
            className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
            <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontSize: 10 }}>
              {Object.keys(response.headers).length}
            </span>
          </button>
        </div>
      )}

      <div className="response-body">
        {!response && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">⟳</div>
            <div className="empty-state-text">Send a request to see the response</div>
          </div>
        )}

        {response && activeTab === 'body' && (
          isJson(response.body) ? (
            <pre
              className="response-code"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(formatJson(response.body)) }}
            />
          ) : (
            <pre className="response-code">{response.body}</pre>
          )
        )}

        {response && activeTab === 'headers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <span style={{ color: 'var(--accent)', minWidth: 180, flexShrink: 0 }}>{key}</span>
                <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
