import { useEffect, useRef, useState } from 'react'

export function Hint({ hint }: { hint: string }) {
  return (
    <button type="button" className="hint" aria-label={hint}>
      ?
      <span className="hint-bubble" aria-hidden="true">
        {hint}
      </span>
    </button>
  )
}

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function Select({ value, options, onChange }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={open ? 'cselect open' : 'cselect'} ref={ref}>
      <button
        type="button"
        className="cselect-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current?.label ?? 'Select'}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className="cselect-menu" role="listbox">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={o.value === value ? 'cselect-option active' : 'cselect-option'}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface SliderProps {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

export function Slider({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: SliderProps) {
  return (
    <div className="field">
      <span className="field-label">
        <span className="field-name">{label}</span>
        <span className="value">
          {value}
          {suffix}
        </span>
        <Hint hint={hint} />
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

interface ToggleProps {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}

export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <div className="field toggle-field">
      <span className="field-label toggle-label">
        <span className="field-name">{label}</span>
        <Hint hint={hint} />
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? 'toggle on' : 'toggle'}
        onClick={() => onChange(!checked)}
      >
        <span className="knob" />
      </button>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="chevron"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
