import { DOCS_URL, HOME_URL, REPO_URL } from '../lib/site'
import { CodeIcon, GithubIcon, LogoIcon, MoonIcon, SunIcon } from './icons'

interface TopBarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  codeOpen: boolean
  onToggleCode: () => void
}

export function TopBar({ theme, onToggleTheme, codeOpen, onToggleCode }: TopBarProps) {
  return (
    <header className="topbar">
      <a className="brand" href={HOME_URL}>
        <LogoIcon />
        <span className="brand-name">layn</span>
        <span className="brand-sub">playground</span>
      </a>
      <div className="top-nav">
        <a className="top-link" href={DOCS_URL}>
          Docs
        </a>
        <a
          className="icon-btn"
          href={REPO_URL}
          aria-label="GitHub repository"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon />
        </a>
        <button
          type="button"
          className="icon-btn"
          aria-label="Toggle color theme"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          type="button"
          className={codeOpen ? 'code-btn active' : 'code-btn'}
          aria-pressed={codeOpen}
          onClick={onToggleCode}
        >
          <CodeIcon />
          Code
        </button>
      </div>
    </header>
  )
}
