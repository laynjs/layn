import { PRESETS, type Preset } from '../lib/layouts'

interface ToolbarProps {
  activePreset: string | undefined
  total: number
  rendered: number
  onPreset: (preset: Preset) => void
}

export function Toolbar({ activePreset, total, rendered, onPreset }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="chips">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={preset.id === activePreset ? 'chip on' : 'chip'}
            title={preset.hint}
            onClick={() => onPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p
        className="stats"
        title="Virtualization: only the tiles near the viewport exist in the DOM"
      >
        <strong>{total.toLocaleString('en-US')}</strong> items
        <span className="stats-dot">/</span>
        <strong>{rendered}</strong> rendered
      </p>
    </div>
  )
}
