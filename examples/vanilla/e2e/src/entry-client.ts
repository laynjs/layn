import { masonry } from '@laynjs/core'
import { createLayn } from '@laynjs/vanilla'

const items = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

const root = document.getElementById('root')
if (root !== null) {
  createLayn(root, {
    algorithm: masonry({ columns: 3 }),
    items,
    gap: { x: 8, y: 8 },
    viewport: { width: 900, height: 600 },
    overscan: 200,
    renderItem: (element, item) => {
      element.textContent = String(item.data)
    },
  })
}
