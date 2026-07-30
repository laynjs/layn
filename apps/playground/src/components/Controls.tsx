import { ALGORITHMS, type AlgoSpec, PRESETS, type Preset } from '../lib/layouts'
import type { Settings } from '../lib/settings'
import { Hint, Select, Slider, Toggle } from './form'

interface ControlsProps {
  spec: AlgoSpec
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onPreset: (preset: Preset) => void
}

export function Controls({ spec, settings, onChange, onPreset }: ControlsProps) {
  const { algoId, columns, gap, count, size, overscan, showImages } = settings

  return (
    <aside className="controls">
      <section className="group">
        <h2 className="group-title">Examples</h2>
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.id}
              className="preset"
              onClick={() => onPreset(p)}
              title={p.hint}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="group">
        <h2 className="group-title">Options</h2>

        <div className="field">
          <span className="field-label">
            <span className="field-name">Layout</span>
            <Hint hint="The layout algorithm. Each arranges items differently." />
          </span>
          <Select
            value={algoId}
            options={ALGORITHMS.map((a) => ({ value: a.id, label: a.label }))}
            onChange={(value) => onChange({ algoId: value })}
          />
        </div>

        {spec.usesCount && (
          <Slider
            label={spec.axis === 'horizontal' ? 'Rows' : 'Columns'}
            hint={
              spec.axis === 'horizontal'
                ? 'How many fixed-height rows the content flows into.'
                : 'How many columns to split the container into.'
            }
            value={columns}
            min={1}
            max={8}
            onChange={(value) => onChange({ columns: value })}
          />
        )}

        {spec.usesSize && (
          <Slider
            label={spec.sizeLabel ?? 'Base size'}
            hint="Target tile or row size in pixels for this algorithm."
            value={size}
            min={80}
            max={360}
            step={10}
            suffix="px"
            onChange={(value) => onChange({ size: value })}
          />
        )}

        <Slider
          label="Gap"
          hint="Spacing between items, in pixels."
          value={gap}
          min={0}
          max={40}
          suffix="px"
          onChange={(value) => onChange({ gap: value })}
        />
        <Slider
          label="Items"
          hint="How many items to lay out. Only the visible ones are rendered."
          value={count}
          min={50}
          max={2000}
          step={50}
          onChange={(value) => onChange({ count: value })}
        />
        <Slider
          label="Overscan"
          hint="Extra pixels rendered beyond the viewport for smoother scrolling."
          value={overscan}
          min={0}
          max={1200}
          step={50}
          suffix="px"
          onChange={(value) => onChange({ overscan: value })}
        />
        <Toggle
          label="Images"
          hint="Show real photos, or turn off for plain colored tiles."
          checked={showImages}
          onChange={(value) => onChange({ showImages: value })}
        />
      </section>
    </aside>
  )
}
