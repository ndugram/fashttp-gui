import type { RequestConfig } from './types'

function formatDict(entries: [string, string][], indent: string): string {
  if (entries.length === 0) return '{}'
  const lines = entries.map(([k, v]) => `${indent}    "${k}": "${v}"`)
  return `{\n${lines.join(',\n')}\n${indent}}`
}

function formatJson(raw: string, indent: string): string {
  try {
    const parsed = JSON.parse(raw)
    return JSON.stringify(parsed, null, 4)
      .split('\n')
      .map((line, i) => (i === 0 ? line : `${indent}${line}`))
      .join('\n')
  } catch {
    return `"${raw}"`
  }
}

export function generateCode(config: RequestConfig): string {
  const { url, method, headers, body } = config
  const methodLower = method.toLowerCase()
  const activeHeaders = headers.filter(h => h.enabled && h.key.trim())
  const indent = '    '

  const decoratorLines: string[] = [`url="${url}"`]

  if (activeHeaders.length > 0) {
    const entries: [string, string][] = activeHeaders.map(h => [h.key, h.value])
    decoratorLines.push(`headers=${formatDict(entries, indent)}`)
  }

  const hasBody = body.trim() && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  if (hasBody) {
    try {
      JSON.parse(body)
      decoratorLines.push(`json=${formatJson(body, indent)}`)
    } catch {
      decoratorLines.push(`data="${body.trim()}"`)
    }
  }

  const decoratorArgs =
    decoratorLines.length === 1
      ? decoratorLines[0]
      : '\n' + decoratorLines.map(l => `${indent}${l}`).join(',\n') + '\n'

  return `from fasthttp import FastHTTP
from fasthttp.response import Response

app = FastHTTP()


@app.${methodLower}(${decoratorArgs})
async def make_request(resp: Response) -> dict:
    return resp.json()


if __name__ == "__main__":
    app.run()`
}
