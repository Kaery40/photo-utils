import exifr from 'exifr'

export async function readExif(file) {
  try {
    const exif = await exifr.parse(file, {
      pick: [
        'Make', 'Model', 'LensModel', 'LensMake', 'Lens',
        'FocalLength', 'FocalLengthIn35mmFormat',
        'FNumber', 'ExposureTime', 'ISO', 'ISOSpeedRatings',
        'DateTimeOriginal', 'CreateDate',
        'ImageWidth', 'ImageHeight', 'ExifImageWidth', 'ExifImageHeight',
        'Orientation'
      ]
    })
    
    if (!exif) return getDefaultExif()
    
    const focalLength = exif.FocalLength || exif.FocalLengthIn35mmFormat || '--'
    const fNumber = exif.FNumber || '--'
    const exposureTime = formatExposureTime(exif.ExposureTime)
    const iso = exif.ISO || exif.ISOSpeedRatings || '--'
    
    return {
      make: exif.Make || '未知',
      model: exif.Model || '未知',
      lensModel: exif.LensModel || exif.Lens || '未知镜头',
      lensMake: exif.LensMake || '',
      focalLength: Math.round(focalLength),
      fNumber,
      exposureTime,
      iso,
      datetime: formatDatetime(exif.DateTimeOriginal || exif.CreateDate),
      date: formatDate(exif.DateTimeOriginal || exif.CreateDate),
      orientation: exif.Orientation || 1
    }
  } catch (e) {
    console.warn('EXIF 读取失败:', e)
    return getDefaultExif()
  }
}

function getDefaultExif() {
  return {
    make: '未知', model: '未知', lensModel: '未知镜头', lensMake: '',
    focalLength: '--', fNumber: '--', exposureTime: '--', iso: '--',
    datetime: '--', date: '--', orientation: 1
  }
}

function formatExposureTime(time) {
  if (!time) return '--'
  if (time >= 1) return `${time}s`
  return `1/${Math.round(1 / time)}s`
}

function formatDatetime(date) {
  if (!date) return '--'
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(date) {
  if (!date) return '--'
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function pad(n) { return n.toString().padStart(2, '0') }

export function getParamString(exif) {
  return `${exif.focalLength}mm  f/${exif.fNumber}  ${exif.exposureTime}  ISO${exif.iso}`
}

export function getElementValue(exif, element, imageInfo) {
  const { name, value } = element
  switch (name) {
    case 'Model': return exif.model
    case 'Make': return exif.make
    case 'LensModel': return exif.lensModel
    case 'Param': return getParamString(exif)
    case 'Datetime': return exif.datetime
    case 'Date': return exif.date
    case 'TotalPixel': return `${((imageInfo.width * imageInfo.height) / 1000000).toFixed(2)} MP`
    case 'Custom': return value || ''
    case 'None': return ''
    default: return ''
  }
}
