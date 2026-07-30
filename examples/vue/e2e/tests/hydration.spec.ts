import { expect, test } from '@playwright/test'

test('server-renders, hydrates without mismatch, and virtualizes on scroll', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    problems.push(error.message)
  })

  await page.goto('/')

  const container = page.getByTestId('container')
  await expect(container).toBeVisible()

  const firstItem = page.locator('[data-id="0"]')
  await expect(firstItem).toBeVisible()

  const initialCount = await page.getByTestId('item').count()
  expect(initialCount).toBeGreaterThan(0)
  expect(initialCount).toBeLessThan(60)

  expect(problems.join('\n')).not.toMatch(/hydrat|did not match|mismatch/i)

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
