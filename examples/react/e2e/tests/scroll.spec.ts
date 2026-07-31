import { expect, test } from '@playwright/test'

test('scrolls to an item by id and centers it in the viewport', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-id="0"]')).toBeVisible()
  await expect(page.locator('[data-id="400"]')).toHaveCount(0)

  await page.getByTestId('jump').click()

  const target = page.locator('[data-id="400"]')
  await expect(target).toBeVisible()
  await expect(page.locator('[data-id="0"]')).toHaveCount(0)

  const centered = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="container"]') as HTMLElement
    const item = document.querySelector('[data-id="400"]') as HTMLElement
    const containerBox = container.getBoundingClientRect()
    const itemBox = item.getBoundingClientRect()
    const containerCenter = containerBox.y + containerBox.height / 2
    const itemCenter = itemBox.y + itemBox.height / 2
    return Math.abs(containerCenter - itemCenter)
  })
  expect(centered).toBeLessThan(2)
})
