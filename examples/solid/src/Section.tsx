import { useLayn } from '@laynjs/solid'
import { For } from 'solid-js'
import { hue, items, type LayoutSpec } from './layouts'

export function Section(props: { spec: LayoutSpec }) {
  const view = useLayn<number>({
    algorithm: props.spec.algorithm,
    items,
    gap: { x: 8, y: 8 },
    viewport: { width: 880, height: 340 },
    axis: props.spec.axis,
    overscan: 200,
    label: props.spec.label,
  })

  return (
    <section style={{ 'margin-bottom': '28px' }}>
      <div
        ref={view.containerRef}
        {...view.containerAttrs}
        style={{
          ...view.containerStyle,
          height: '340px',
          border: '1px solid #e5e5e5',
          'border-radius': '10px',
          background: '#fafafa',
        }}
      >
        <div {...view.contentAttrs} style={view.contentStyle()}>
          <For each={view.items()}>
            {(entry) => (
              <div
                ref={entry.ref}
                {...entry.a11y}
                style={{
                  ...entry.style,
                  background: `hsl(${hue(entry.index)} 68% 66%)`,
                  'border-radius': '6px',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  color: 'rgba(0,0,0,0.5)',
                  'font-size': '12px',
                  'font-weight': '600',
                }}
              >
                {entry.index}
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}
