import type { Positions } from '@laynjs/core'
import {
  DEVTOOLS_ESTIMATED_COLOR,
  DEVTOOLS_HUD_BACKGROUND,
  DEVTOOLS_HUD_COLOR,
  DEVTOOLS_HUD_FONT,
  DEVTOOLS_HUD_LINE_HEIGHT,
  DEVTOOLS_HUD_PADDING,
  DEVTOOLS_MEASURED_COLOR,
  DEVTOOLS_OVERSCAN_COLOR,
} from '../constants.js'
import type { DevtoolsFrame } from '../types/index.js'

const hudLines = (frame: DevtoolsFrame): string[] => [
  `items      ${frame.total}`,
  `rendered   ${frame.rendered}  (${((frame.rendered / Math.max(1, frame.total)) * 100).toFixed(1)}%)`,
  `measured   ${frame.measured} of ${frame.rendered} shown`,
  `scroll     ${Math.round(frame.start)} / ${Math.round(
    frame.axis === 'vertical' ? frame.contentHeight : frame.contentWidth,
  )}`,
  `overscan   ${frame.overscan}px`,
  `content    ${Math.round(frame.contentWidth)} x ${Math.round(frame.contentHeight)}`,
]

const paintHud = (context: CanvasRenderingContext2D, frame: DevtoolsFrame): void => {
  const lines = hudLines(frame)
  context.font = DEVTOOLS_HUD_FONT
  let width = 0
  for (const line of lines) {
    width = Math.max(width, context.measureText(line).width)
  }
  const boxWidth = width + DEVTOOLS_HUD_PADDING * 2
  const boxHeight = lines.length * DEVTOOLS_HUD_LINE_HEIGHT + DEVTOOLS_HUD_PADDING * 2

  context.fillStyle = DEVTOOLS_HUD_BACKGROUND
  context.fillRect(8, 8, boxWidth, boxHeight)
  context.strokeStyle = DEVTOOLS_OVERSCAN_COLOR
  context.lineWidth = 1
  context.strokeRect(8.5, 8.5, boxWidth, boxHeight)

  context.fillStyle = DEVTOOLS_HUD_COLOR
  context.textBaseline = 'top'
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (line !== undefined) {
      context.fillText(
        line,
        8 + DEVTOOLS_HUD_PADDING,
        8 + DEVTOOLS_HUD_PADDING + i * DEVTOOLS_HUD_LINE_HEIGHT,
      )
    }
  }
}

const paintOverscan = (
  context: CanvasRenderingContext2D,
  frame: DevtoolsFrame,
  width: number,
  height: number,
): void => {
  if (frame.overscan <= 0) {
    return
  }
  context.save()
  context.strokeStyle = DEVTOOLS_OVERSCAN_COLOR
  context.setLineDash([6, 4])
  context.lineWidth = 1
  context.beginPath()
  if (frame.axis === 'vertical') {
    context.moveTo(0, frame.overscan + 0.5)
    context.lineTo(width, frame.overscan + 0.5)
    context.moveTo(0, height - frame.overscan - 0.5)
    context.lineTo(width, height - frame.overscan - 0.5)
  } else {
    context.moveTo(frame.overscan + 0.5, 0)
    context.lineTo(frame.overscan + 0.5, height)
    context.moveTo(width - frame.overscan - 0.5, 0)
    context.lineTo(width - frame.overscan - 0.5, height)
  }
  context.stroke()
  context.restore()
}

export const paint = (
  context: CanvasRenderingContext2D,
  positions: Positions,
  visible: readonly number[],
  isMeasured: (index: number) => boolean,
  frame: DevtoolsFrame,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
): void => {
  context.clearRect(0, 0, width, height)
  context.lineWidth = 1

  for (const index of visible) {
    const x = (positions.x[index] ?? 0) - offsetX
    const y = (positions.y[index] ?? 0) - offsetY
    const w = positions.width[index] ?? 0
    const h = positions.height[index] ?? 0
    const measured = isMeasured(index)

    context.strokeStyle = measured ? DEVTOOLS_MEASURED_COLOR : DEVTOOLS_ESTIMATED_COLOR
    context.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))

    context.fillStyle = measured ? DEVTOOLS_MEASURED_COLOR : DEVTOOLS_ESTIMATED_COLOR
    context.fillRect(Math.round(x) + 0.5, Math.round(y) + 0.5, 6, 6)
  }

  paintOverscan(context, frame, width, height)
  paintHud(context, frame)
}
