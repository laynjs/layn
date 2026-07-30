import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { FRAMEWORKS, type SnippetContext } from '../lib/snippets'
import {
  AngularIcon,
  QwikIcon,
  ReactIcon,
  SolidIcon,
  SvelteIcon,
  VanillaIcon,
  VueIcon,
} from './framework-icons'
import { CloseIcon } from './icons'

const ICONS: Record<string, ReactNode> = {
  react: <ReactIcon />,
  vue: <VueIcon />,
  svelte: <SvelteIcon />,
  solid: <SolidIcon />,
  angular: <AngularIcon />,
  qwik: <QwikIcon />,
  vanilla: <VanillaIcon />,
}

interface CodeDrawerProps {
  open: boolean
  onClose: () => void
  ctx: SnippetContext
}

export function CodeDrawer({ open, onClose, ctx }: CodeDrawerProps) {
  const [frameworkId, setFrameworkId] = useState('react')
  const [copied, setCopied] = useState(false)

  const framework = FRAMEWORKS.find((f) => f.id === frameworkId) ?? FRAMEWORKS[0]
  const snippet = useMemo(() => framework.build(ctx), [framework, ctx])

  const copy = () => {
    void navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close code panel"
        className={open ? 'scrim open' : 'scrim'}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside className={open ? 'drawer open' : 'drawer'} aria-hidden={!open}>
        <div className="drawer-head">
          <span className="drawer-title">Use it in your app</span>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="tabs" role="tablist">
          {FRAMEWORKS.map((f) => (
            <button
              type="button"
              key={f.id}
              role="tab"
              aria-selected={f.id === frameworkId}
              aria-label={f.label}
              title={f.label}
              className={f.id === frameworkId ? 'tab active' : 'tab'}
              onClick={() => setFrameworkId(f.id)}
            >
              {ICONS[f.id]}
            </button>
          ))}
        </div>

        <div className="drawer-code">
          <div className="code-bar">
            <span className="code-lang">{framework.lang}</span>
            <button type="button" className="code-copy" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code-body">
            <code>{snippet}</code>
          </pre>
        </div>

        <p className="drawer-note">
          The engine computes positions from your data. Every adapter renders the same layout, so
          this switches framework without changing the result.
        </p>
      </aside>
    </>
  )
}
