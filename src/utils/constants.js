export const LAYOUT_TYPES = {
  watermark: 'Normal (白底)',
  dark_watermark: 'Normal (黑红配色)',
  simple: '简洁',
  square: '1:1 填充',
  background_blur: '背景模糊',
  pure_white_margin: '白色边框'
}

export const ELEMENT_TYPES = {
  Model: '相机型号',
  Make: '相机厂商',
  LensModel: '镜头型号',
  Param: '拍摄参数',
  Datetime: '拍摄时间',
  Date: '拍摄日期',
  TotalPixel: '总像素',
  Custom: '自定义',
  None: '无'
}

export const OUTPUT_FORMATS = {
  jpeg: 'JPEG (推荐)',
  png: 'PNG (无损)'
}

export const DEFAULT_CONFIG = {
  layout: 'watermark',
  backgroundColor: '#ffffff',
  enableShadow: false,
  enableWhiteMargin: true,
  whiteMarginWidth: 3,
  enableLogo: true,
  logoPosition: 'right',
  outputFormat: 'jpeg',
  blurPadding: 18,
  leftTop: { name: 'LensModel', color: '#212121', bold: true, value: '' },
  leftBottom: { name: 'Model', color: '#757575', bold: false, value: '' },
  rightTop: { name: 'Param', color: '#212121', bold: true, value: '' },
  rightBottom: { name: 'Datetime', color: '#757575', bold: false, value: '' }
}

export const SUPPORTED_BRANDS = [
  'Sony', 'Nikon', 'Canon', 'Fujifilm', 'Hasselblad',
  'Huawei', 'Apple', 'DJI', 'Panasonic', 'Pentax',
  'Ricoh', 'Olympus', 'Leica'
]

export function isBrandSupported(make) {
  if (!make) return false
  const makeUpper = make.toUpperCase()
  for (const brand of Object.keys(BRAND_LOGOS)) {
    if (makeUpper.includes(brand.toUpperCase())) {
      return true
    }
  }
  return false
}

export function getDetectedBrand(make) {
  if (!make) return null
  const makeUpper = make.toUpperCase()
  for (const brand of Object.keys(BRAND_LOGOS)) {
    if (makeUpper.includes(brand.toUpperCase())) {
      return brand
    }
  }
  return null
}

export const BRAND_LOGOS = {
  'SONY': { light: 'sony.png', dark: 'sony_dark.png' },
  'NIKON': { light: 'nikon.png', dark: 'nikon.png' },
  'Canon': { light: 'canon.png', dark: 'canon.png' },
  'FUJIFILM': { light: 'fujifilm.png', dark: 'fujifilm.png' },
  'HASSELBLAD': { light: 'hasselblad.png', dark: 'hasselblad.png' },
  'HUAWEI': { light: 'xmage.png', dark: 'xmage.png' },
  'APPLE': { light: 'apple.png', dark: 'apple.png' },
  'DJI': { light: 'DJI.jpg', dark: 'DJI.jpg' },
  'Panasonic': { light: 'panasonic.png', dark: 'panasonic.png' },
  'PENTAX': { light: 'pentax.png', dark: 'pentax.png' },
  'RICOH': { light: 'ricoh.png', dark: 'ricoh.png' },
  'Olympus': { light: 'olympus_blue_gold.png', dark: 'olympus_white_gold.png' },
  'leica': { light: 'leica_logo.png', dark: 'leica_logo.png' }
}

export function getLogoPath(make, isDark = false) {
  const makeUpper = (make || '').toUpperCase()
  for (const [brand, logos] of Object.entries(BRAND_LOGOS)) {
    if (makeUpper.includes(brand.toUpperCase())) {
      return `/logos/${isDark ? logos.dark : logos.light}`
    }
  }
  return null
}
