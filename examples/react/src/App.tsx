import { layouts } from './layouts'
import { Section } from './Section'

export function App() {
  return (
    <div
      style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 940, margin: '0 auto' }}
    >
      {layouts.map((spec) => (
        <Section key={spec.id} spec={spec} />
      ))}
    </div>
  )
}
