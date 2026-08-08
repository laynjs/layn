import { expect, test } from '@playwright/test'

const boxOf = async (page: import('@playwright/test').Page, id: number) => {
  const box = await page.locator(`[data-id="${id}"]`).boundingBox()
  if (box === null) {
    throw new Error(`item ${id} is not rendered`)
  }
  return box
}

test('reorders items by dragging one onto another', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-id="0"]')).toBeVisible()

  const source = await boxOf(page, 0)
  const target = await boxOf(page, 4)

  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 })

  await expect(page.locator('[data-id="0"]')).toHaveAttribute('data-layn-dragging', '')
  await expect(page.getByTestId('order')).not.toHaveText('0,1,2,3')

  await page.mouse.up()

  await expect(page.locator('[data-id="0"]')).not.toHaveAttribute('data-layn-dragging', '')
  await expect(page.getByTestId('order')).toHaveText('1,2,3,4')
})

test('restores the original order when the drag is cancelled', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('order')).toHaveText('0,1,2,3')

  const source = await boxOf(page, 0)
  const target = await boxOf(page, 4)
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 })
  await expect(page.getByTestId('order')).not.toHaveText('0,1,2,3')

  await page.keyboard.press('Escape')

  await expect(page.getByTestId('order')).toHaveText('0,1,2,3')
  await page.mouse.up()
})

test('drags from an image without the browser hijacking the gesture', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('order')).toHaveText('0,1,2,3')

  const thumb = await page.locator('[data-id="0"] [data-testid="thumb"]').boundingBox()
  const target = await boxOf(page, 4)
  if (thumb === null) {
    throw new Error('thumbnail is not rendered')
  }

  const cancelled: string[] = []
  await page.exposeFunction('reportCancel', (type: string) => cancelled.push(type))
  await page.evaluate(() => {
    document.addEventListener('pointercancel', () => {
      Reflect.get(window, 'reportCancel')?.('pointercancel')
    })
  })

  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)
  await page.mouse.down()
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 })
  await expect(page.locator('[data-id="0"]')).toHaveAttribute('data-layn-dragging', '')
  await page.mouse.up()

  await expect(page.getByTestId('order')).toHaveText('1,2,3,4')
  expect(cancelled).toEqual([])
})
