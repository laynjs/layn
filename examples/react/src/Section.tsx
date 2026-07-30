import { useLayn } from '@laynjs/react'
import { hue, items, type LayoutSpec } from './layouts'

export function Section({ spec }: { spec: LayoutSpec }) {
  const view = useLayn<number>({
    algorithm: spec.algorithm,
    items,
    gap: { x: 8, y: 8 },
    viewport: { width: 880, height: 340 },
    axis: spec.axis,
    overscan: 200,
    label: spec.label,
  })

  return (
    <section style={{ marginBottom: 28 }}>
      <div
        {...view.containerProps}
        style={{
          ...view.containerProps.style,
          height: 340,
          border: '1px solid #e5e5e5',
          borderRadius: 10,
          background: '#fafafa',
        }}
      >
        <div {...view.contentProps}>
          {view.items.map((entry) => (
            <div
              key={entry.id}
              ref={entry.ref}
              {...entry.a11y}
              style={{
                ...entry.style,
                background: `hsl(${hue(entry.index)} 68% 66%)`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(0,0,0,0.5)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {entry.index}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
