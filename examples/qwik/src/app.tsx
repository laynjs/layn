import { component$ } from '@builder.io/qwik'
import { layouts } from './layouts'
import { Section } from './section'

export const App = component$(() => {
  return (
    <div
      style={{
        'font-family': 'system-ui, sans-serif',
        padding: '24px',
        'max-width': '940px',
        margin: '0 auto',
      }}
    >
      {layouts.map((spec) => (
        <Section key={spec.id} spec={spec} />
      ))}
    </div>
  )
})
