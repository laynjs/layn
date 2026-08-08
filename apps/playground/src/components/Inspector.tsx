import type { AlgoSpec } from '../lib/layouts'
import type { Settings } from '../lib/settings'
import { NumberField, Section, SegmentedRow, SwitchRow } from './form'
import { LayoutPicker } from './LayoutPicker'

interface InspectorProps {
  spec: AlgoSpec
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

const TILE_OPTIONS = [
  { value: 'colors', label: 'Colors' },
  { value: 'photos', label: 'Photos' },
] as const

export function Inspector({ spec, settings, onChange }: InspectorProps) {
  return (
    <aside className="inspector">
      <Section title="Layout">
        <LayoutPicker value={settings.algoId} onChange={(algoId) => onChange({ algoId })} />
      </Section>

      <Section title="Geometry">
        {spec.usesCount && (
          <NumberField
            label={spec.axis === 'horizontal' ? 'Rows' : 'Columns'}
            hint={
              spec.axis === 'horizontal'
                ? 'How many fixed-height rows the content flows into.'
                : 'How many columns to split the container into.'
            }
            value={settings.columns}
            min={1}
            max={8}
            onChange={(columns) => onChange({ columns })}
          />
        )}
        {spec.usesSize && (
          <NumberField
            label={spec.sizeLabel ?? 'Base size'}
            hint="Target tile or row size for this algorithm."
            value={settings.size}
            min={80}
            max={360}
            step={10}
            suffix="px"
            onChange={(size) => onChange({ size })}
          />
        )}
        <NumberField
          label="Gap"
          hint="Spacing between items."
          value={settings.gap}
          min={0}
          max={40}
          suffix="px"
          onChange={(gap) => onChange({ gap })}
        />
      </Section>

      <Section title="Data">
        <NumberField
          label="Items"
          hint="How many items to lay out. Only the visible ones are rendered."
          value={settings.count}
          min={50}
          max={2000}
          step={50}
          onChange={(count) => onChange({ count, loaded: 0 })}
        />
        <NumberField
          label="Overscan"
          hint="Extra pixels rendered beyond the viewport for smoother scrolling."
          value={settings.overscan}
          min={0}
          max={1200}
          step={50}
          suffix="px"
          onChange={(overscan) => onChange({ overscan })}
        />
      </Section>

      <Section title="Appearance">
        <SegmentedRow
          label="Tiles"
          hint="Render real photos, or plain colored tiles."
          value={settings.showImages ? 'photos' : 'colors'}
          options={TILE_OPTIONS}
          onChange={(value) => onChange({ showImages: value === 'photos' })}
        />
        <NumberField
          label="Radius"
          hint="Corner radius of a tile. Your CSS, not the engine - layn only writes geometry."
          value={settings.radius}
          min={0}
          max={64}
          step={2}
          suffix="px"
          onChange={(radius) => onChange({ radius })}
        />
      </Section>

      <Section title="Behavior">
        <SwitchRow
          label="Animate"
          hint="Animate items to their new positions on every layout change."
          checked={settings.animate}
          onChange={(animate) => onChange({ animate })}
        />
        <SwitchRow
          label="Drag to reorder"
          hint="Pick a tile up and drop it somewhere else; the rest flow around it."
          checked={settings.reorder}
          onChange={(reorder) => onChange({ reorder })}
        />
        <SwitchRow
          label="Infinite scroll"
          hint="Load another page of items whenever the scroll reaches the end."
          checked={settings.infinite}
          onChange={(infinite) => onChange({ infinite, loaded: 0 })}
        />
      </Section>
    </aside>
  )
}
