import { createRoot } from 'react-dom/client'
import { Playground } from './Playground'

const root = document.getElementById('root')
if (root !== null) {
  createRoot(root).render(<Playground />)
}
