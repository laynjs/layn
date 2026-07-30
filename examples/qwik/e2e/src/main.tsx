import { render } from '@builder.io/qwik'
import { App } from './app'

const root = document.getElementById('root')
if (root !== null) {
  render(root, <App />)
}
