import { getElementValue } from './exifReader'
import { getLogoPath } from './constants'

const NORMAL_HEIGHT = 1000
const FONT_SIZE = 240
const BOLD_FONT_SIZE = 260
const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

const logoCache = new Map()

function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function textToCanvas(text, fontSize, color, bold = false) {
  if (!text) text = ' '
  const canvas = createCanvas(1, 1)
  const ctx = canvas.getContext('2d')
  const fontWeight = bold ? 'bold' : 'normal'
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`
  
  const metrics = ctx.measureText(text)
  const width = Math.ceil(metrics.width) + 10
  const height = Math.ceil(fontSize * 1.4)

  canvas.width = width
  canvas.height = height
  ctx.font = `${fontWeight} ${fontSize}px ${FONT_FAMILY}`
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 5, height / 2)

  return canvas
}

function concatenateVertical(canvases, align = 'left') {
  const totalHeight = canvases.reduce((sum, c) => sum + c.height, 0)
  const maxWidth = Math.max(...canvases.map((c) => c.width))
  const result = createCanvas(maxWidth, totalHeight)
  const ctx = result.getContext('2d')

  let y = 0
  canvases.forEach((c) => {
    let x = 0
    if (align === 'center') x = (maxWidth - c.width) / 2
    else if (align === 'right') x = maxWidth - c.width
    ctx.drawImage(c, x, y)
    y += c.height
  })
  return result
}

function concatenateHorizontal(canvases, align = 'bottom') {
  const totalWidth = canvases.reduce((sum, c) => sum + c.width, 0)
  const maxHeight = Math.max(...canvases.map((c) => c.height))
  const result = createCanvas(totalWidth, maxHeight)
  const ctx = result.getContext('2d')

  let x = 0
  canvases.forEach((c) => {
    let y = 0
    if (align === 'center') y = (maxHeight - c.height) / 2
    else if (align === 'bottom') y = maxHeight - c.height
    ctx.drawImage(c, x, y)
    x += c.width
  })
  return result
}

function resizeByHeight(canvas, targetHeight) {
  if (!canvas || canvas.height === 0) return canvas
  const scale = targetHeight / canvas.height
  const newWidth = Math.round(canvas.width * scale)
  const result = createCanvas(newWidth, targetHeight)
  result.getContext('2d').drawImage(canvas, 0, 0, newWidth, targetHeight)
  return result
}

function resizeByWidth(canvas, targetWidth) {
  if (!canvas || canvas.width === 0) return canvas
  const scale = targetWidth / canvas.width
  const newHeight = Math.round(canvas.height * scale)
  const result = createCanvas(targetWidth, newHeight)
  result.getContext('2d').drawImage(canvas, 0, 0, targetWidth, newHeight)
  return result
}

function paddingCanvas(canvas, padding, position = 'tb', color = 'transparent') {
  if (!canvas) return null
  let top = 0, bottom = 0, left = 0, right = 0
  if (position.includes('t')) top = padding
  if (position.includes('b')) bottom = padding
  if (position.includes('l')) left = padding
  if (position.includes('r')) right = padding

  const result = createCanvas(canvas.width + left + right, canvas.height + top + bottom)
  const ctx = result.getContext('2d')
  if (color !== 'transparent') {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, result.width, result.height)
  }
  ctx.drawImage(canvas, left, top)
  return result
}

function createGap(width, height) {
  return createCanvas(width, height)
}

async function loadLogo(make, isDark) {
  const logoPath = getLogoPath(make, isDark)
  if (!logoPath) return null

  const cacheKey = `${logoPath}`
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey)
  }

  try {
    const img = await loadImage(logoPath)
    const logoCanvas = createCanvas(img.width, img.height)
    logoCanvas.getContext('2d').drawImage(img, 0, 0)
    logoCache.set(cacheKey, logoCanvas)
    return logoCanvas
  } catch (e) {
    console.warn('Logo 加载失败:', logoPath)
    return null
  }
}


function addShadow(canvas) {
  const maxPixel = Math.max(canvas.width, canvas.height)
  const radius = Math.round(maxPixel / 512)
  const padding = radius * 2

  const result = createCanvas(canvas.width + padding * 2, canvas.height + padding * 2)
  const ctx = result.getContext('2d')

  ctx.fillStyle = '#6B696A'
  ctx.fillRect(padding, padding, canvas.width, canvas.height)

  ctx.filter = `blur(${radius}px)`
  ctx.drawImage(result, 0, 0)
  ctx.filter = 'none'

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, result.width, result.height)

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = radius * 2
  ctx.shadowOffsetY = radius
  ctx.drawImage(canvas, padding, padding)

  return result
}

function squareImage(canvas) {
  const size = Math.max(canvas.width, canvas.height)
  const result = createCanvas(size, size)
  const ctx = result.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(canvas, (size - canvas.width) / 2, (size - canvas.height) / 2)
  return result
}

function addMargin(canvas, marginPercent, color = '#ffffff') {
  const margin = Math.round((Math.min(canvas.width, canvas.height) * marginPercent) / 100)
  const result = createCanvas(canvas.width + margin * 2, canvas.height + margin * 2)
  const ctx = result.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, result.width, result.height)
  ctx.drawImage(canvas, margin, margin)
  return result
}

function backgroundBlur(canvas, paddingPercent = 18) {
  const padding = paddingPercent / 100
  const newWidth = Math.round(canvas.width * (1 + padding))
  const newHeight = Math.round(canvas.height * (1 + padding))
  const result = createCanvas(newWidth, newHeight)
  const ctx = result.getContext('2d')

  ctx.filter = 'blur(35px)'
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight)
  ctx.filter = 'none'

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(0, 0, newWidth, newHeight)

  const x = Math.round((newWidth - canvas.width) / 2)
  const y = Math.round((newHeight - canvas.height) / 2)
  ctx.drawImage(canvas, x, y)

  return result
}

function createLine(height, color = '#CBCBC9') {
  const canvas = createCanvas(4, height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 4, height)
  return canvas
}


async function processWatermark(canvas, exif, config, imageInfo) {
  const isDark = config.layout.includes('dark')
  const isLogoLeft = config.logoPosition === 'left'
  const isLogoEnabled = config.enableLogo

  const bgColor = isDark ? '#212121' : config.backgroundColor
  const primaryColor = isDark ? '#D32F2F' : config.leftTop.color
  const secondaryColor = isDark ? '#d4d1cc' : config.leftBottom.color
  const lineColor = '#CBCBC9'

  const ratio = canvas.width / canvas.height
  const watermarkRatio = (ratio >= 1 ? 0.04 : 0.09) + 0.02 * 2
  const paddingRatio = (ratio >= 1 ? 0.52 : 0.7) - 0.04 * 2

  const watermarkWidth = Math.round(NORMAL_HEIGHT / watermarkRatio)
  const watermark = createCanvas(watermarkWidth, NORMAL_HEIGHT)
  const ctx = watermark.getContext('2d')
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, watermarkWidth, NORMAL_HEIGHT)

  const leftTopText = getElementValue(exif, config.leftTop, imageInfo)
  const leftBottomText = getElementValue(exif, config.leftBottom, imageInfo)
  const rightTopText = getElementValue(exif, config.rightTop, imageInfo)
  const rightBottomText = getElementValue(exif, config.rightBottom, imageInfo)

  const leftTop = textToCanvas(leftTopText, BOLD_FONT_SIZE, isDark ? primaryColor : config.leftTop.color, config.leftTop.bold)
  const leftBottom = textToCanvas(leftBottomText, FONT_SIZE, isDark ? secondaryColor : config.leftBottom.color, config.leftBottom.bold)
  const rightTop = textToCanvas(rightTopText, BOLD_FONT_SIZE, isDark ? primaryColor : config.rightTop.color, config.rightTop.bold)
  const rightBottom = textToCanvas(rightBottomText, FONT_SIZE, isDark ? secondaryColor : config.rightBottom.color, config.rightBottom.bold)

  const emptyPadding = createGap(10, 100)
  const leftBlock = concatenateVertical([leftTop, emptyPadding, leftBottom], 'left')
  const rightBlock = concatenateVertical([rightTop, emptyPadding, rightBottom], 'left')

  const maxHeight = Math.max(leftBlock.height, rightBlock.height)
  const verticalPadding = Math.round(maxHeight * paddingRatio)
  
  let leftPadded = paddingCanvas(leftBlock, verticalPadding, 'tb')
  let rightPadded = paddingCanvas(rightBlock, verticalPadding, 't')
  rightPadded = paddingCanvas(rightPadded, leftPadded.height - rightPadded.height, 'b')

  leftPadded = resizeByHeight(leftPadded, NORMAL_HEIGHT)
  rightPadded = resizeByHeight(rightPadded, NORMAL_HEIGHT)

  let logo = null
  if (isLogoEnabled) {
    logo = await loadLogo(exif.make, isDark)
    if (logo) {
      logo = paddingCanvas(logo, Math.round(paddingRatio * logo.height), 'tb')
      logo = resizeByHeight(logo, NORMAL_HEIGHT)
    }
  }

  const gap = createGap(200, NORMAL_HEIGHT)
  const smallGap = createGap(100, NORMAL_HEIGHT)

  let leftSide, rightSide

  if (isLogoEnabled && logo) {
    if (isLogoLeft) {
      leftSide = concatenateHorizontal([logo, gap, leftPadded], 'center')
      rightSide = rightPadded
    } else {
      const line = createLine(Math.round(NORMAL_HEIGHT * 0.4), lineColor)
      const linePadded = paddingCanvas(line, Math.round(NORMAL_HEIGHT * 0.3), 'tb')
      leftSide = leftPadded
      rightSide = concatenateHorizontal([rightPadded, smallGap, linePadded, smallGap, logo], 'center')
    }
  } else {
    leftSide = leftPadded
    rightSide = rightPadded
  }

  const padding = 200
  ctx.drawImage(leftSide, padding, 0)
  ctx.drawImage(rightSide, watermarkWidth - rightSide.width - padding, 0)

  const scaledWatermark = resizeByWidth(watermark, canvas.width)

  const result = createCanvas(canvas.width, canvas.height + scaledWatermark.height)
  const resultCtx = result.getContext('2d')
  resultCtx.fillStyle = bgColor
  resultCtx.fillRect(0, 0, result.width, result.height)
  resultCtx.drawImage(canvas, 0, 0)
  resultCtx.drawImage(scaledWatermark, 0, canvas.height)

  return result
}


function processSimple(canvas, exif, config, imageInfo) {
  const ratio = canvas.width / canvas.height
  const watermarkRatio = ratio >= 1 ? 0.16 : 0.1
  const paddingRatio = 0.5

  const watermarkWidth = Math.round(NORMAL_HEIGHT / watermarkRatio)
  const watermark = createCanvas(watermarkWidth, NORMAL_HEIGHT)
  const ctx = watermark.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, watermarkWidth, NORMAL_HEIGHT)

  const modelText = exif.model.replace(/[/_]/g, ' ')
  const makeText = exif.make.split(' ')[0]
  const paramsText = getElementValue(exif, { name: 'Param' }, imageInfo)

  const shotOn = textToCanvas('Shot on', FONT_SIZE, '#212121', false)
  const model = textToCanvas(modelText, BOLD_FONT_SIZE, '#D32F2F', true)
  const make = textToCanvas(makeText, BOLD_FONT_SIZE, '#212121', true)
  const gap = createGap(100, 20)
  const firstLine = concatenateHorizontal([shotOn, gap, model, gap, make], 'bottom')

  const secondLine = textToCanvas(paramsText, FONT_SIZE, '#9E9E9E', false)

  const verticalGap = createGap(20, 100)
  const content = concatenateVertical([firstLine, verticalGap, secondLine], 'center')

  const targetHeight = NORMAL_HEIGHT * paddingRatio
  const scaledContent = resizeByHeight(content, targetHeight)

  const x = (watermarkWidth - scaledContent.width) / 2
  const y = (NORMAL_HEIGHT - scaledContent.height) / 2
  ctx.drawImage(scaledContent, x, y)

  const scaledWatermark = resizeByWidth(watermark, canvas.width)

  const result = createCanvas(canvas.width, canvas.height + scaledWatermark.height)
  const resultCtx = result.getContext('2d')
  resultCtx.drawImage(canvas, 0, 0)
  resultCtx.drawImage(scaledWatermark, 0, canvas.height)

  return result
}

export async function processImage(file, exif, config) {
  const img = await loadImage(URL.createObjectURL(file))
  let canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const imageInfo = { width: img.width, height: img.height }

  switch (config.layout) {
    case 'square':
      canvas = squareImage(canvas)
      break

    case 'background_blur':
      canvas = backgroundBlur(canvas, config.blurPadding || 18)
      break

    case 'pure_white_margin':
      canvas = addMargin(canvas, config.whiteMarginWidth)
      break

    case 'simple':
      if (config.enableShadow) canvas = addShadow(canvas)
      canvas = processSimple(canvas, exif, config, imageInfo)
      break

    default:
      if (config.enableShadow) canvas = addShadow(canvas)
      canvas = await processWatermark(canvas, exif, config, imageInfo)
      if (config.enableWhiteMargin) {
        canvas = addMargin(canvas, config.whiteMarginWidth, config.backgroundColor)
      }
  }

  return canvas
}

export function canvasToBlob(canvas, format = 'jpeg') {
  return new Promise((resolve) => {
    const mimeTypes = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    }
    const mimeType = mimeTypes[format] || 'image/jpeg'
    const quality = format === 'png' ? undefined : 1.0
    canvas.toBlob(resolve, mimeType, quality)
  })
}
