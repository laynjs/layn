import { renderToString } from 'react-dom/server'
import { App } from './app'

export const render = (): string => renderToString(<App />)
