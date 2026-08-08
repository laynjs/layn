import { useState } from 'react'
import { PREPEND_BATCH_SIZE, REMOVE_BATCH_SIZE } from '../lib/constants'
import { MinusIcon, PlusIcon, ShuffleIcon, TargetIcon } from './icons'

interface ActionBarProps {
  total: number
  onShuffle: () => void
  onPrepend: () => void
  onRemove: () => void
  onScrollTo: (index: number) => void
}

export function ActionBar({ total, onShuffle, onPrepend, onRemove, onScrollTo }: ActionBarProps) {
  const [target, setTarget] = useState('')

  const jump = () => {
    const parsed = Number(target)
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < total) {
      onScrollTo(parsed)
    }
  }

  return (
    <div className="actionbar">
      <button
        type="button"
        className="action"
        title="Reorder the items randomly to see the layout transition"
        onClick={onShuffle}
      >
        <ShuffleIcon />
        Shuffle
      </button>
      <button
        type="button"
        className="action"
        title="Add items to the start of the data to see them fade in"
        onClick={onPrepend}
      >
        <PlusIcon />
        {PREPEND_BATCH_SIZE}
      </button>
      <button
        type="button"
        className="action"
        title="Remove items from the start of the data to see them fade out"
        onClick={onRemove}
      >
        <MinusIcon />
        {REMOVE_BATCH_SIZE}
      </button>
      <span className="action-sep" />
      <span className="action jump" title="Smooth-scroll the grid to this item number">
        <TargetIcon />
        <input
          type="text"
          inputMode="numeric"
          aria-label="Item number to scroll to"
          placeholder={`0-${total - 1}`}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              jump()
            }
          }}
        />
      </span>
    </div>
  )
}
