import { expect, test } from '@playwright/test'

test('client-renders, virtualizes, and swaps the visible set on scroll', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  await page.goto('/')

  const container = page.getByTestId('container')
  await expect(container).toBeVisible()

  await expect(page.locator('[data-id="0"]')).toBeVisible()

  const initialCount = await page.getByTestId('item').count()
  expect(initialCount).toBeGreaterThan(0)
  expect(initialCount).toBeLessThan(60)

  expect(errors).toEqual([])

  await container.evaluate((element) => {
    element.scrollTop = 12000
  })

  await expect(page.locator('[data-id="0"]')).toHaveCount(0)

  const scrolledIds = await page
    .getByTestId('item')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-id')))
  expect(scrolledIds.length).toBeGreaterThan(0)
  expect(scrolledIds).not.toContain('0')
})
