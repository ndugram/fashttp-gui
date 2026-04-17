import { useState } from 'react'
import type { RequestConfig } from '../types'
import { generateCode } from '../codegen'

interface Props {
  config: RequestConfig
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightPython(code: string): string {
  const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@[a-zA-Z_][\w.]*)|(__\w+__)|(\b(?:from|import|async|def|return|if|await|else|True|False|None)\b)/g

  let result = ''
  let last = 0
  let m: RegExpExecArray | null

  while ((m = pattern.exec(code)) !== null) {
    result += escapeHtml(code.slice(last, m.index))
    last = m.index + m[0].length

    const [full, str, decorator, dunder, keyword] = m
    if (str)       result += `<span class="py-string">${escapeHtml(str)}</span>`
    else if (decorator) result += `<span class="py-decorator">${escapeHtml(decorator)}</span>`
    else if (dunder)    result += `<span class="py-dunder">${escapeHtml(dunder)}</span>`
    else if (keyword)   result += `<span class="py-keyword">${escapeHtml(keyword)}</span>`
    else result += escapeHtml(full)
  }

  result += escapeHtml(code.slice(last))
  return result
}

export function CodePanel({ config }: Props) {
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const code = generateCode(config)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleRegenerate() {
    setRegenerating(true)
    setTimeout(() => setRegenerating(false), 500)
  }

  return (
    <div className="code-section">
      <div className="code-header">
        <div className="code-header-left">
          <span className="code-label">Code Generator</span>
          <span className="code-lang-badge">Python · FastHTTP</span>
        </div>
        <div className="code-actions">
          <button
            className={`regen-btn ${regenerating ? 'regenerating' : ''}`}
            onClick={handleRegenerate}
            title="Regenerate"
          >
            ↺
          </button>
          <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className={`code-block${regenerating ? ' code-regenerating' : ''}`}>
        <pre
          className="code-content"
          dangerouslySetInnerHTML={{ __html: highlightPython(code) }}
        />
      </div>
    </div>
  )
}
