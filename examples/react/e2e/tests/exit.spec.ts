import { expect, test } from '@playwright/test'

test('fades out items removed from the data and cleans the clones up', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-id="0"]')).toBeVisible()
  const before = await page.locator('[data-testid="item"]').count()

  await page.getByTestId('remove').click()

  const clones = page.locator('[data-layn-exiting]')
  await expect(clones.first()).toBeAttached()

  const state = await clones.first().evaluate((element) => {
    const animations = element.getAnimations()
    return {
      count: animations.length,
      opacity: getComputedStyle(element).opacity,
      pointerEvents: getComputedStyle(element).pointerEvents,
      hasItemId: element.hasAttribute('data-layn-id'),
    }
  })
  expect(state.count).toBe(2)
  expect(Number(state.opacity)).toBeLessThan(1)
  expect(state.pointerEvents).toBe('none')
  expect(state.hasItemId).toBe(false)

  await expect(clones).toHaveCount(0)
  await expect(page.locator('[data-testid="item"]')).toHaveCount(before)
  await expect(page.locator('[data-id="0"]')).toHaveCount(0)
})
