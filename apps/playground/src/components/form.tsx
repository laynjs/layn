import { type ReactNode, type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'
import { SCRUB_PIXELS_PER_STEP } from '../lib/constants'
import { ChevronIcon } from './icons'

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

interface SectionProps {
  title: string
  children: ReactNode
}

export function Section({ title, children }: SectionProps) {
  const [open, setOpen] = useState(true)
  return (
    <section className={open ? 'section open' : 'section'}>
      <button
        type="button"
        className="section-head"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronIcon />
        {title}
      </button>
      {open && <div className="section-body">{children}</div>}
    </section>
  )
}

interface RowProps {
  label: string
  hint: string
  children: ReactNode
}

export function Row({ label, hint, children }: RowProps) {
  return (
    <div className="row">
      <span className="row-label" title={hint}>
        {label}
      </span>
      {children}
    </div>
  )
}

interface NumberFieldProps {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

export function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: NumberFieldProps) {
  const origin = useRef<{ x: number; value: number } | undefined>(undefined)
  const [draft, setDraft] = useState<string | undefined>(undefined)

  const commit = (text: string) => {
    const parsed = Number(text)
    if (text.trim() !== '' && Number.isFinite(parsed)) {
      onChange(clamp(Math.round(parsed / step) * step, min, max))
    }
    setDraft(undefined)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    origin.current = { x: event.clientX, value }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const start = origin.current
    if (start === undefined) {
      return
    }
    const steps = Math.round((event.clientX - start.x) / SCRUB_PIXELS_PER_STEP)
    onChange(clamp(start.value + steps * step, min, max))
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLSpanElement>) => {
    origin.current = undefined
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <div className="row">
      <span
        className="row-label scrub"
        title={`${hint} Drag to change.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {label}
      </span>
      <span className="number">
        <input
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={draft ?? `${value}`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commit(event.currentTarget.value)
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault()
              onChange(clamp(value + (event.key === 'ArrowUp' ? step : -step), min, max))
            }
          }}
        />
        {suffix !== '' && <span className="number-suffix">{suffix}</span>}
      </span>
    </div>
  )
}

interface SwitchRowProps {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}

export function SwitchRow({ label, hint, checked, onChange }: SwitchRowProps) {
  return (
    <Row label={label} hint={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? 'switch on' : 'switch'}
        onClick={() => onChange(!checked)}
      >
        <span className="knob" />
      </button>
    </Row>
  )
}

interface SegmentedRowProps {
  label: string
  hint: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}

export function SegmentedRow({ label, hint, value, options, onChange }: SegmentedRowProps) {
  return (
    <Row label={label} hint={hint}>
      <fieldset className="segmented">
        <legend className="sr-only">{label}</legend>
        {options.map((option) => (
          <label key={option.value} className="segment">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </Row>
  )
}
