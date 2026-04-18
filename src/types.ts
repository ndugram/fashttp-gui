export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type ActiveTab = 'headers' | 'body' | 'params'

export type SideSection = 'history' | 'collections' | 'environments' | null

export interface Header {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface RequestConfig {
  url: string
  method: HttpMethod
  headers: Header[]
  body: string
}

export interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: string
  elapsed_ms: number
}

export interface HistoryEntry {
  id: string
  timestamp: number
  method: HttpMethod
  url: string
  headers: Header[]
  body: string
  status?: number
  elapsed_ms?: number
}
