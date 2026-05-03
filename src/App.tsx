import { useState, useCallback, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { RequestPanel } from './components/RequestPanel'
import { ResponsePanel } from './components/ResponsePanel'
import { CodePanel } from './components/CodePanel'
import { HistoryPanel } from './components/HistoryPanel'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { ProfileDropdown } from './components/ProfileDropdown'
import { SettingsPanel } from './components/SettingsPanel'
import { FolderOpen, Layers } from 'lucide-react'
import type { RequestConfig, HttpResponse, ActiveTab, HistoryEntry, SideSection } from './types'

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
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>()

  const [sideSection, setSideSection] = useState<SideSection>('history')
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileBtnRef = useRef<HTMLButtonElement>(null)

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

  function toggleSection(section: Exclude<SideSection, null>) {
    setSideSection(prev => (prev === section ? null : section))
  }

  function toggleProfile() {
    setShowProfile(p => !p)
    setShowSettings(false)
  }

  function toggleSettings() {
    setShowSettings(p => !p)
    setShowProfile(false)
  }

  return (
    <div className="app">
      <TopBar
        onProfileClick={toggleProfile}
        onSettingsClick={toggleSettings}
        profileActive={showProfile}
        settingsActive={showSettings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        history={history}
        onLoadEntry={handleLoadEntry}
        error={error}
        profileBtnRef={profileBtnRef}
      />

      <div className="workspace">
        <Sidebar active={sideSection} onToggle={toggleSection} />

        <div className={`sidebar-panel${sideSection ? ' open' : ''}`}>
          {sideSection === 'history' && (
            <HistoryPanel
              entries={history}
              activeId={activeHistoryId}
              onLoad={handleLoadEntry}
              onClear={handleClearHistory}
            />
          )}
          {sideSection === 'collections' && (
            <div className="placeholder-panel">
              <FolderOpen size={32} strokeWidth={1} />
              <span>Collections coming soon</span>
            </div>
          )}
          {sideSection === 'environments' && (
            <div className="placeholder-panel">
              <Layers size={32} strokeWidth={1} />
              <span>Environments coming soon</span>
            </div>
          )}
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

      {showProfile && (
        <ProfileDropdown onClose={() => setShowProfile(false)} triggerRef={profileBtnRef} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} onClearHistory={handleClearHistory} />
      )}
    </div>
  )
}
