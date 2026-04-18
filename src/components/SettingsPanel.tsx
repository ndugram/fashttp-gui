import { useState, type ReactNode } from 'react'
import {
  X, Moon, Globe, Clock, Save, Layout, Zap, Type,
  Trash2, Download, Upload,
} from 'lucide-react'

interface Props {
  onClose: () => void
}

interface Settings {
  compactMode: boolean
  autoSaveHistory: boolean
  requestTimeout: number
  animationIntensity: 'none' | 'reduced' | 'full'
  fontScale: number
}

const DEFAULTS: Settings = {
  compactMode: false,
  autoSaveHistory: true,
  requestTimeout: 30,
  animationIntensity: 'full',
  fontScale: 1,
}

type Section = 'general' | 'requests' | 'ui' | 'data'

const NAV: { id: Section; label: string }[] = [
  { id: 'general',  label: 'General' },
  { id: 'requests', label: 'Requests' },
  { id: 'ui',       label: 'UI' },
  { id: 'data',     label: 'Data' },
]

export function SettingsPanel({ onClose }: Props) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const s = localStorage.getItem('fasthttp-settings')
      return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS
    } catch { return DEFAULTS }
  })
  const [activeSection, setActiveSection] = useState<Section>('general')

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('fasthttp-settings', JSON.stringify(next))
      return next
    })
  }

  return (
    <div
      className="settings-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="settings-body">
          <nav className="settings-nav">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                className={`settings-nav-item${activeSection === id ? ' active' : ''}`}
                onClick={() => setActiveSection(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {activeSection === 'general' && (
              <div className="settings-section">
                <Row icon={<Moon size={14} strokeWidth={1.75} />} label="Theme" sub="Strict dark mode">
                  <Toggle checked={true} onChange={() => {}} disabled />
                </Row>
                <Row icon={<Globe size={14} strokeWidth={1.75} />} label="Language" sub="Interface language">
                  <select className="settings-select">
                    <option>English</option>
                  </select>
                </Row>
              </div>
            )}

            {activeSection === 'requests' && (
              <div className="settings-section">
                <Row icon={<Clock size={14} strokeWidth={1.75} />} label="Timeout" sub="Seconds before abort">
                  <input
                    type="number"
                    className="settings-number-input"
                    value={settings.requestTimeout}
                    onChange={e => update('requestTimeout', Number(e.target.value))}
                    min={1}
                    max={300}
                  />
                </Row>
                <Row icon={<Save size={14} strokeWidth={1.75} />} label="Auto-save History" sub="Save every request">
                  <Toggle checked={settings.autoSaveHistory} onChange={v => update('autoSaveHistory', v)} />
                </Row>
              </div>
            )}

            {activeSection === 'ui' && (
              <div className="settings-section">
                <Row icon={<Layout size={14} strokeWidth={1.75} />} label="Compact Mode" sub="Tighter spacing">
                  <Toggle checked={settings.compactMode} onChange={v => update('compactMode', v)} />
                </Row>
                <Row icon={<Zap size={14} strokeWidth={1.75} />} label="Animations" sub="Motion intensity">
                  <select
                    className="settings-select"
                    value={settings.animationIntensity}
                    onChange={e => update('animationIntensity', e.target.value as Settings['animationIntensity'])}
                  >
                    <option value="full">Full</option>
                    <option value="reduced">Reduced</option>
                    <option value="none">None</option>
                  </select>
                </Row>
                <Row icon={<Type size={14} strokeWidth={1.75} />} label="Font Scale" sub="UI text size">
                  <input
                    type="range"
                    className="settings-range"
                    min={0.8}
                    max={1.2}
                    step={0.05}
                    value={settings.fontScale}
                    onChange={e => update('fontScale', Number(e.target.value))}
                  />
                  <span className="settings-range-value">{settings.fontScale}×</span>
                </Row>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="settings-section">
                <div className="settings-action-group">
                  <button className="settings-action-btn">
                    <Download size={14} strokeWidth={1.75} />
                    Export Collections
                  </button>
                  <button className="settings-action-btn">
                    <Upload size={14} strokeWidth={1.75} />
                    Import Collections
                  </button>
                  <button
                    className="settings-action-btn danger"
                    onClick={() => {
                      if (window.confirm('Clear all history?')) {
                        localStorage.removeItem('fasthttp-history')
                      }
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                    Clear All History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  sub,
  children,
}: {
  icon: ReactNode
  label: string
  sub: string
  children: ReactNode
}) {
  return (
    <div className="setting-row">
      <div className="setting-row-left">
        <span className="setting-icon">{icon}</span>
        <div>
          <div className="setting-label">{label}</div>
          <div className="setting-sub">{sub}</div>
        </div>
      </div>
      <div className="setting-row-right">{children}</div>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      className={`toggle${checked ? ' on' : ''}${disabled ? ' disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
    >
      <span className="toggle-thumb" />
    </button>
  )
}
