import { hydrateRoot } from 'react-dom/client'
import { App } from './app'

const root = document.getElementById('root')
if (root !== null) {
  hydrateRoot(root, <App />)
}
