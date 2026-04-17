import { useState } from 'react'
import type { RequestConfig } from '../types'
import { generateCode } from '../codegen'

interface Props {
  config: RequestConfig
}

export function CodePanel({ config }: Props) {
  const [copied, setCopied] = useState(false)

  const code = generateCode(config)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="code-section">
      <div className="code-header">
        <span className="code-label">FastHTTP Code</span>
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="code-block">
        <pre>{code}</pre>
      </div>
    </div>
  )
}
