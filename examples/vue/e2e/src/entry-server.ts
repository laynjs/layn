import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { App } from './app'

export const render = (): Promise<string> => renderToString(createSSRApp(App))
