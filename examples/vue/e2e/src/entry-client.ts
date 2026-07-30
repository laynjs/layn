import { createSSRApp } from 'vue'
import { App } from './app'

const root = document.getElementById('root')
if (root !== null) {
  createSSRApp(App).mount(root)
}
