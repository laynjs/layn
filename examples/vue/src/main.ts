import { createApp } from 'vue'
import App from './App.vue'

const mount = document.getElementById('app')
if (mount !== null) {
  createApp(App).mount(mount)
}
