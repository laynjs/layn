import { expect, test } from '@playwright/test'

test('animates moved items additively and settles on the layout position', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-id="0"]')).toBeVisible()
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)

  await page.getByTestId('reverse').click()
  await page.waitForFunction(() => document.getAnimations().length > 0)

  const during = await page.evaluate(() => {
    const animation = document
      .getAnimations()
      .find(
        (candidate) =>
          candidate.effect instanceof KeyframeEffect &&
          candidate.effect.getKeyframes()[0]?.transform !== undefined,
      )
    if (animation === undefined || !(animation.effect instanceof KeyframeEffect)) {
      return undefined
    }
    const effect = animation.effect
    const keyframes = effect.getKeyframes()
    const target = effect.target as HTMLElement
    const matrix = new DOMMatrixReadOnly(target.style.transform)
    const content = target.parentElement as HTMLElement
    const finalY = content.getBoundingClientRect().y + matrix.f
    return {
      composite: effect.composite,
      lastKeyframe: keyframes[keyframes.length - 1]?.transform,
      distanceFromFinal: Math.abs(target.getBoundingClientRect().y - finalY),
      id: target.getAttribute('data-id'),
    }
  })
  expect(during).toBeDefined()
  expect(during?.composite).toBe('add')
  expect(during?.lastKeyframe).toBe('translate(0px, 0px)')
  expect(during?.distanceFromFinal).toBeGreaterThan(1)

  await page.waitForFunction(() => document.getAnimations().length === 0)
  const settled = await page.evaluate((id) => {
    const target = document.querySelector(`[data-id="${id}"]`) as HTMLElement
    const matrix = new DOMMatrixReadOnly(target.style.transform)
    const content = target.parentElement as HTMLElement
    const finalY = content.getBoundingClientRect().y + matrix.f
    return Math.abs(target.getBoundingClientRect().y - finalY)
  }, during?.id)
  expect(settled).toBeLessThan(1)
})

test('fades in items that enter the data', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-id="0"]')).toBeVisible()

  await page.getByTestId('prepend').click()
  await page.waitForFunction(() => document.querySelector('[data-id="500"]') !== null)

  const enter = await page.evaluate(() => {
    const element = document.querySelector('[data-id="500"]') as HTMLElement
    const animations = element.getAnimations()
    return {
      count: animations.length,
      hasFade: animations.some(
        (animation) =>
          animation.effect instanceof KeyframeEffect &&
          animation.effect
            .getKeyframes()
            .some((keyframe) => keyframe.opacity !== undefined && keyframe.opacity !== 'auto'),
      ),
      hasRise: animations.some(
        (animation) =>
          animation.effect instanceof KeyframeEffect &&
          animation.effect
            .getKeyframes()
            .some((keyframe) => String(keyframe.transform).includes('12px')),
      ),
    }
  })
  expect(enter.count).toBe(2)
  expect(enter.hasFade).toBe(true)
  expect(enter.hasRise).toBe(true)

  await page.waitForFunction(
    () => document.querySelector('[data-id="500"]')?.getAnimations().length === 0,
  )
  const opacity = await page.evaluate(
    () => getComputedStyle(document.querySelector('[data-id="500"]') as HTMLElement).opacity,
  )
  expect(opacity).toBe('1')
})
