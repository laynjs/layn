import { useState } from 'react'
import { CodeDrawer } from './components/CodeDrawer'
import { Controls } from './components/Controls'
import { Grid } from './components/Grid'
import { TopBar } from './components/TopBar'
import { ALGORITHMS, type Preset } from './lib/layouts'
import { DEFAULT_SETTINGS, type Settings } from './lib/settings'
import './playground.css'

const initialTheme = (): 'light' | 'dark' =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export function Playground() {
  const [theme, setTheme] = useState(initialTheme)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [codeOpen, setCodeOpen] = useState(false)

  const spec = ALGORITHMS.find((a) => a.id === settings.algoId) ?? ALGORITHMS[0]

  const patch = (next: Partial<Settings>) => setSettings((s) => ({ ...s, ...next }))
  const applyPreset = (p: Preset) =>
    setSettings((s) => ({
      ...s,
      algoId: p.algoId,
      columns: p.columns,
      size: p.size,
      gap: p.gap,
      showImages: p.images,
    }))

  return (
    <div className="pg" data-theme={theme}>
      <TopBar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        codeOpen={codeOpen}
        onToggleCode={() => setCodeOpen((v) => !v)}
      />

      <div className="workspace">
        <main className="stage">
          <Grid key={spec.axis} spec={spec} settings={settings} />
        </main>

        <Controls spec={spec} settings={settings} onChange={patch} onPreset={applyPreset} />

        <CodeDrawer
          open={codeOpen}
          onClose={() => setCodeOpen(false)}
          ctx={{
            spec,
            columns: settings.columns,
            size: settings.size,
            gap: settings.gap,
            overscan: settings.overscan,
          }}
        />
      </div>
    </div>
  )
}
