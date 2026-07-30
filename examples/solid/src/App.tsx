import { For } from 'solid-js'
import { layouts } from './layouts'
import { Section } from './Section'

export function App() {
  return (
    <div
      style={{
        'font-family': 'system-ui, sans-serif',
        padding: '24px',
        'max-width': '940px',
        margin: '0 auto',
      }}
    >
      <For each={layouts}>{(spec) => <Section spec={spec} />}</For>
    </div>
  )
}
