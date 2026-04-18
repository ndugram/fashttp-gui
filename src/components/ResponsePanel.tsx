import { useState } from 'react'
import { Copy, Check, Send } from 'lucide-react'
import type { HttpResponse } from '../types'

interface Props {
  response: HttpResponse | null
  loading: boolean
}

type ResponseTab = 'pretty' | 'raw' | 'headers'

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'status-2xx'
  if (status >= 300 && status < 400) return 'status-3xx'
  if (status >= 400 && status < 500) return 'status-4xx'
  return 'status-5xx'
}

function formatJson(raw: string): string {
  try { return JSON.stringify(JSON.parse(raw), null, 2) }
  catch { return raw }
}

function isJson(raw: string): boolean {
  try { JSON.parse(raw); return true }
  catch { return false }
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
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!response) return
    await navigator.clipboard.writeText(response.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="response-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="response-header">
        <span className="response-label">Response</span>
        {response ? (
          <div className="response-meta">
            <span className={`status-badge ${statusClass(response.status)}`}>
              {response.status}
            </span>
            <span className="elapsed">{response.elapsed_ms}ms</span>
            <button
              className={`response-copy-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied
                ? <><Check size={11} strokeWidth={2.5} /> Copied</>
                : <><Copy size={11} strokeWidth={1.75} /> Copy</>
              }
            </button>
          </div>
        ) : null}
      </div>

      {loading && <div className="loading-bar" />}

      {loading && !response && (
        <div className="skeleton-wrap">
          {[80, 60, 95, 45, 70, 55, 88].map((w, i) => (
            <div key={i} className="skeleton-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {response && (
        <div className="response-tabs tabs">
          <button
            className={`tab${activeTab === 'pretty' ? ' active' : ''}`}
            onClick={() => setActiveTab('pretty')}
          >
            Pretty
          </button>
          <button
            className={`tab${activeTab === 'raw' ? ' active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw
          </button>
          <button
            className={`tab${activeTab === 'headers' ? ' active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
            <span className="tab-badge">{Object.keys(response.headers).length}</span>
          </button>
        </div>
      )}

      <div className="response-body">
        {!response && !loading && (
          <div className="empty-state">
            <Send size={28} strokeWidth={1.25} className="empty-state-icon" />
            <div className="empty-state-text">Send a request to see the response</div>
          </div>
        )}

        {response && activeTab === 'pretty' && (
          isJson(response.body) ? (
            <pre
              className="response-code"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(formatJson(response.body)) }}
            />
          ) : (
            <pre className="response-code">{response.body}</pre>
          )
        )}

        {response && activeTab === 'raw' && (
          <pre className="response-code">{response.body}</pre>
        )}

        {response && activeTab === 'headers' && (
          <div className="response-headers-list">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="response-header-row">
                <span className="response-header-key">{key}</span>
                <span className="response-header-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
