export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

const systemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const readTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' || stored === 'light' ? stored : systemTheme()
}

export const applyTheme = (theme: Theme): void => {
  localStorage.setItem(STORAGE_KEY, theme)
  document.documentElement.dataset.theme = theme
}

export const watchSystemTheme = (onChange: (theme: Theme) => void): (() => void) => {
  const query = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (query === undefined) {
    return () => undefined
  }
  const listener = () => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      onChange(query.matches ? 'dark' : 'light')
    }
  }
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
