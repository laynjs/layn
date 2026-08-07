import { useState } from 'react'
import { ALGORITHMS, type AlgoSpec, PRESETS, type Preset } from '../lib/layouts'
import { REMOVE_BATCH_SIZE, type Settings } from '../lib/settings'
import { Hint, Select, Slider, Toggle } from './form'

interface ControlsProps {
  spec: AlgoSpec
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onPreset: (preset: Preset) => void
  onScrollTo: (id: number) => void
}

export function Controls({ spec, settings, onChange, onPreset, onScrollTo }: ControlsProps) {
  const { algoId, columns, gap, count, size, overscan, showImages, animate, shuffleSeed } = settings
  const [jumpTarget, setJumpTarget] = useState('')
  const total = count + settings.loaded

  const jump = () => {
    const parsed = Number(jumpTarget)
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < total) {
      onScrollTo(parsed)
    }
  }

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
          onChange={(value) => onChange({ count: value, loaded: 0 })}
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
        <Toggle
          label="Animate"
          hint="Animate items to their new positions on every layout change."
          checked={animate}
          onChange={(value) => onChange({ animate: value })}
        />
      </section>

      <section className="group">
        <h2 className="group-title">Try it</h2>
        <button
          type="button"
          className="preset shuffle"
          title="Reorder the items randomly to see the layout transition."
          onClick={() => onChange({ shuffleSeed: shuffleSeed + 1 })}
        >
          Shuffle items
        </button>
        <button
          type="button"
          className="preset shuffle"
          title="Add ten new items to the start of the data to see them fade in."
          onClick={() => onChange({ prepended: settings.prepended + 10 })}
        >
          Prepend 10 items
        </button>
        <button
          type="button"
          className="preset shuffle"
          title="Remove the ten items at the front of the data to see them fade out."
          onClick={() => onChange({ removed: settings.removed + REMOVE_BATCH_SIZE })}
        >
          Remove 10 items
        </button>
        <Toggle
          label="Drag to reorder"
          hint="Pick a tile up and drop it somewhere else; the rest flow around it."
          checked={settings.reorder}
          onChange={(value) => onChange({ reorder: value })}
        />
        <Toggle
          label={settings.loaded > 0 ? `Infinite scroll (+${settings.loaded})` : 'Infinite scroll'}
          hint="Load another page of items whenever the scroll reaches the end."
          checked={settings.infinite}
          onChange={(value) => onChange({ infinite: value, loaded: 0 })}
        />
        <div className="jump-row">
          <input
            className="jump-input"
            type="number"
            inputMode="numeric"
            min={0}
            max={total - 1}
            placeholder={`0 - ${total - 1}`}
            value={jumpTarget}
            onChange={(event) => setJumpTarget(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                jump()
              }
            }}
            aria-label="Item number to scroll to"
          />
          <button
            type="button"
            className="preset jump-go"
            title="Smooth-scroll the grid to the item with this number."
            onClick={jump}
          >
            Scroll to
          </button>
        </div>
      </section>
    </aside>
  )
}
