import { useEffect, useRef, useState } from 'react'
import { ActionBar } from './components/ActionBar'
import { CodeDrawer } from './components/CodeDrawer'
import { Grid } from './components/Grid'
import { Inspector } from './components/Inspector'
import { Toolbar } from './components/Toolbar'
import { TopBar } from './components/TopBar'
import {
  INFINITE_PAGE_SIZE,
  PREPEND_BATCH_SIZE,
  REMOVE_BATCH_SIZE,
  RESPONSIVE_COLUMNS,
} from './lib/constants'
import { ALGORITHMS, type Preset } from './lib/layouts'
import { DEFAULT_SETTINGS, type Settings } from './lib/settings'
import { applyTheme, readTheme, watchSystemTheme } from './lib/theme'
import './playground.css'

export function Playground() {
  const [theme, setTheme] = useState(readTheme)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [preset, setPreset] = useState<string | undefined>(undefined)
  const [rendered, setRendered] = useState(0)
  const [codeOpen, setCodeOpen] = useState(false)
  const scrollApi = useRef<((id: number) => void) | undefined>(undefined)

  useEffect(() => watchSystemTheme(setTheme), [])

  const spec = ALGORITHMS.find((algorithm) => algorithm.id === settings.algoId) ?? ALGORITHMS[0]
  const total = settings.count + settings.loaded

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  const patch = (next: Partial<Settings>) => {
    setPreset(undefined)
    setSettings((current) => ({ ...current, ...next }))
  }

  const applyPreset = (chosen: Preset) => {
    setPreset(chosen.id)
    setSettings((current) => ({
      ...current,
      algoId: chosen.algoId,
      columns: chosen.columns,
      size: chosen.size,
      gap: chosen.gap,
      showImages: chosen.images,
      prepended: 0,
      removed: 0,
      reorder: false,
      infinite: chosen.infinite ?? false,
      loaded: 0,
    }))
  }

  return (
    <div className="pg">
      <TopBar
        theme={theme}
        onToggleTheme={toggleTheme}
        codeOpen={codeOpen}
        onToggleCode={() => setCodeOpen((open) => !open)}
      />

      <div className="workspace">
        <div className="canvas">
          <Toolbar activePreset={preset} total={total} rendered={rendered} onPreset={applyPreset} />
          <main className="stage">
            <Grid
              key={`${spec.axis}-${settings.rtl}`}
              spec={spec}
              settings={settings}
              scrollApi={scrollApi}
              onRendered={setRendered}
              onLoadMore={() =>
                setSettings((current) => ({
                  ...current,
                  loaded: current.loaded + INFINITE_PAGE_SIZE,
                }))
              }
            />
          </main>
          <ActionBar
            total={total}
            onShuffle={() => patch({ shuffleSeed: settings.shuffleSeed + 1 })}
            onPrepend={() => patch({ prepended: settings.prepended + PREPEND_BATCH_SIZE })}
            onRemove={() => patch({ removed: settings.removed + REMOVE_BATCH_SIZE })}
            onScrollTo={(index) => scrollApi.current?.(index)}
          />
        </div>

        <Inspector spec={spec} settings={settings} onChange={patch} />

        <CodeDrawer
          open={codeOpen}
          onClose={() => setCodeOpen(false)}
          ctx={{
            spec,
            columns: settings.responsive ? RESPONSIVE_COLUMNS : settings.columns,
            size: settings.size,
            gap: settings.gap,
            overscan: settings.overscan,
            animate: settings.animate,
            infinite: settings.infinite,
          }}
        />
      </div>
    </div>
  )
}
