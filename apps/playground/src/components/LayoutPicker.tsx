import { ALGORITHMS } from '../lib/layouts'
import { LayoutThumb } from './layout-thumbs'

interface LayoutPickerProps {
  value: string
  onChange: (algoId: string) => void
}

export function LayoutPicker({ value, onChange }: LayoutPickerProps) {
  return (
    <fieldset className="picker">
      <legend className="sr-only">Layout algorithm</legend>
      {ALGORITHMS.map((algorithm) => (
        <label key={algorithm.id} className="thumb-card" title={algorithm.label}>
          <input
            type="radio"
            name="layout"
            value={algorithm.id}
            checked={algorithm.id === value}
            onChange={() => onChange(algorithm.id)}
          />
          <LayoutThumb id={algorithm.id} />
          <span className="thumb-name">{algorithm.short ?? algorithm.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
