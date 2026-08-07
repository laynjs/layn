import { expect, test } from '@playwright/test'

const scrollToBottom = async (page: import('@playwright/test').Page): Promise<void> => {
  await page.getByTestId('container').evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
}

test('loads more items when the scroll reaches the end', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('count')).toHaveText('500')
  await expect(page.getByTestId('loads')).toHaveText('0')

  await scrollToBottom(page)

  await expect(page.getByTestId('count')).toHaveText('530')
  await expect(page.getByTestId('loads')).toHaveText('1')
})

test('does not keep loading while parked at the end', async ({ page }) => {
  await page.goto('/')
  await scrollToBottom(page)
  await expect(page.getByTestId('loads')).toHaveText('1')

  await page.waitForTimeout(300)

  await expect(page.getByTestId('loads')).toHaveText('1')
})

test('loads again once the scroll reaches the new end', async ({ page }) => {
  await page.goto('/')
  await scrollToBottom(page)
  await expect(page.getByTestId('count')).toHaveText('530')

  await scrollToBottom(page)

  await expect(page.getByTestId('count')).toHaveText('560')
  await expect(page.getByTestId('loads')).toHaveText('2')
})
