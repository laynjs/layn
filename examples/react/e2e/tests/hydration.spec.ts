import { expect, test } from '@playwright/test'

test('server-renders, hydrates without mismatch, and virtualizes on scroll', async ({ page }) => {
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

  const firstItem = page.locator('[data-id="0"]')
  await expect(firstItem).toBeVisible()

  const initialCount = await page.getByTestId('item').count()
  expect(initialCount).toBeGreaterThan(0)
  expect(initialCount).toBeLessThan(60)

  await expect(container).toHaveAttribute('role', 'region')
  await expect(container).toHaveAttribute('aria-label', 'Gallery')
  await expect(container).toHaveAttribute('tabindex', '0')
  await expect(page.getByTestId('content')).toHaveAttribute('role', 'list')
  await expect(firstItem).toHaveAttribute('role', 'listitem')
  await expect(firstItem).toHaveAttribute('aria-setsize', '500')
  await expect(firstItem).toHaveAttribute('aria-posinset', '1')

  expect(errors.join('\n')).not.toMatch(/hydrat|did not match|mismatch/i)
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
