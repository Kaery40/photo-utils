<template>
  <div class="app">
    <header class="navbar">
      <div class="navbar-brand">
        <span class="title">Photo-Utils Web</span>
      </div>
      <div class="navbar-right">
        <span class="navbar-info">照片水印批处理工具 · 本地化处理</span>
        <div class="theme-switcher">
          <button class="theme-btn" @click="showThemeMenu = !showThemeMenu">
            <svg v-if="theme === 'light'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg v-else-if="theme === 'dark'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            <span>{{ themeText }}</span>
          </button>
          <div class="theme-menu" v-if="showThemeMenu" @click.stop>
            <div 
              class="theme-option" 
              :class="{ active: theme === 'light' }"
              @click="setTheme('light')"
            >
              <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
              <span>浅色</span>
            </div>
            <div 
              class="theme-option" 
              :class="{ active: theme === 'dark' }"
              @click="setTheme('dark')"
            >
              <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <span>深色</span>
            </div>
            <div 
              class="theme-option" 
              :class="{ active: theme === 'system' }"
              @click="setTheme('system')"
            >
              <svg class="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
              <span>跟随系统</span>
            </div>
          </div>
        </div>
        <a href="https://github.com/kaery40/photo-utils" target="_blank" class="github-link" title="GitHub">
          <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </header>

    <div class="container">
      <section class="section-upload">
        <div 
          class="upload-zone" 
          :class="{ dragover, 'has-images': images.length }"
          @click="triggerUpload"
          @dragover.prevent="dragover = true"
          @dragleave="dragover = false"
          @drop.prevent="handleDrop"
        >
          <template v-if="!images.length">
            <div class="upload-icon">📁</div>
            <p class="upload-text">点击或拖拽图片到此处</p>
            <p class="upload-hint">支持 JPG、PNG 格式，可多选</p>
          </template>
          <template v-else>
            <div class="image-list">
              <div 
                v-for="(img, index) in images" 
                :key="index" 
                class="image-thumb"
                :class="{ selected: selectedIndex === index }"
                @click.stop="selectImage(index)"
              >
                <img :src="img.preview" :alt="img.file.name">
                <button class="thumb-remove" @click.stop="removeImage(index)">×</button>
                <div class="thumb-badges">
                  <span v-if="getDetectedBrand(img.exif.make)" class="badge brand">{{ getDetectedBrand(img.exif.make) }}</span>
                  <span v-if="img.processed" class="badge done">✓</span>
                </div>
              </div>
              <div class="image-thumb add-more" @click.stop="triggerUpload">
                <span>+</span>
              </div>
            </div>
          </template>
        </div>
        <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="handleFileSelect">
        <div class="action-bar" v-if="images.length">
          <button class="btn btn-primary" @click="processAll" :disabled="processing">
            {{ processing ? `处理中 ${Math.round(progress)}%` : `处理全部 (${images.length})` }}
          </button>
          <button class="btn btn-outline" @click="clearAll" :disabled="processing">清空</button>
        </div>

        <div v-if="processing" class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </section>
      <section class="section-preview">
        <div class="preview-header">
          <div class="preview-tabs">
            <button :class="{ active: previewTab === 'original' }" @click="previewTab = 'original'">原图</button>
            <button :class="{ active: previewTab === 'processed' }" @click="previewTab = 'processed'">效果</button>
          </div>
          <div class="preview-actions" v-if="selectedImage">
            <div class="zoom-controls">
              <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 0.25">−</button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 3">+</button>
              <button class="zoom-btn zoom-fit" @click="resetZoom">自适应</button>
            </div>
            <button class="btn btn-sm" @click="generateSinglePreview" :disabled="generatingSingle">
              {{ generatingSingle ? '生成中...' : '刷新预览' }}
            </button>
          </div>
        </div>
        <div class="preview-area" ref="previewAreaRef">
          <template v-if="selectedImage">
            <img 
              v-if="previewTab === 'original'" 
              :src="selectedImage.preview" 
              alt="原图"
              class="preview-img"
              :style="{ transform: `scale(${zoomLevel})` }"
            >
            <img 
              v-else-if="selectedImage.processed" 
              :src="selectedImage.processed" 
              alt="处理后"
              class="preview-img"
              :style="{ transform: `scale(${zoomLevel})` }"
            >
            <div v-else class="preview-empty" @click="generateSinglePreview">
              <p>点击生成预览</p>
            </div>
          </template>
          <div v-else class="preview-empty">
            <p>请先上传图片</p>
          </div>
        </div>
        <div v-if="selectedImage" class="preview-details">
          <div class="detail-filename">{{ selectedImage.file.name }}</div>
          <div class="detail-exif">
            <span class="detail-make">{{ selectedImage.exif.make }}</span>
            <span class="detail-model">{{ selectedImage.exif.model }}</span>
            <span class="detail-divider">|</span>
            <span class="detail-lens">{{ selectedImage.exif.lensModel }}</span>
          </div>
          <div class="detail-params" v-if="selectedImage.exif.focalLength !== '--'">
            {{ selectedImage.exif.focalLength }}mm · f/{{ selectedImage.exif.fNumber }} · {{ selectedImage.exif.exposureTime }} · ISO{{ selectedImage.exif.iso }}
          </div>
        </div>
      </section>
      <aside class="section-settings">
        <div class="settings-header">
          <h3 class="settings-title">设置</h3>
        </div>
        <div class="setting-section">
          <div class="section-label">布局样式</div>
          <div class="setting-group">
            <CustomSelect v-model="config.layout" :options="LAYOUT_TYPES" />
          </div>
        </div>
        <div class="setting-section" v-if="isWatermarkLayout">
          <div class="section-label">水印元素</div>
          <div class="watermark-grid">
            <div class="grid-item">
              <label>左上</label>
              <CustomSelect v-model="config.leftTop.name" :options="ELEMENT_TYPES" small />
              <input 
                v-if="config.leftTop.name === 'Custom'" 
                type="text" 
                v-model="config.leftTop.value" 
                placeholder="输入自定义文字"
                class="custom-input"
              >
            </div>
            <div class="grid-item">
              <label>右上</label>
              <CustomSelect v-model="config.rightTop.name" :options="ELEMENT_TYPES" small />
              <input 
                v-if="config.rightTop.name === 'Custom'" 
                type="text" 
                v-model="config.rightTop.value" 
                placeholder="输入自定义文字"
                class="custom-input"
              >
            </div>
            <div class="grid-item">
              <label>左下</label>
              <CustomSelect v-model="config.leftBottom.name" :options="ELEMENT_TYPES" small />
              <input 
                v-if="config.leftBottom.name === 'Custom'" 
                type="text" 
                v-model="config.leftBottom.value" 
                placeholder="输入自定义文字"
                class="custom-input"
              >
            </div>
            <div class="grid-item">
              <label>右下</label>
              <CustomSelect v-model="config.rightBottom.name" :options="ELEMENT_TYPES" small />
              <input 
                v-if="config.rightBottom.name === 'Custom'" 
                type="text" 
                v-model="config.rightBottom.value" 
                placeholder="输入自定义文字"
                class="custom-input"
              >
            </div>
          </div>
        </div>
        <div class="setting-section" v-if="isWatermarkLayout && !config.layout.includes('simple')">
          <div class="section-label">Logo</div>
          <div class="setting-group">
            <label class="switch-label">
              <span class="switch">
                <input type="checkbox" v-model="config.enableLogo">
                <span class="switch-slider"></span>
              </span>
            </label>
          </div>
          <div class="setting-group" v-if="config.enableLogo">
            <div class="radio-group">
              <label class="radio-label" :class="{ active: config.logoPosition === 'left' }">
                <input type="radio" v-model="config.logoPosition" value="left">
                <span>居左</span>
              </label>
              <label class="radio-label" :class="{ active: config.logoPosition === 'right' }">
                <input type="radio" v-model="config.logoPosition" value="right">
                <span>居右</span>
              </label>
            </div>
          </div>
        </div>
        <div class="setting-section" v-if="(isWatermarkLayout && !isDarkLayout) || config.layout === 'pure_white_margin'">
          <div class="section-label">边框设置</div>
          <div class="setting-group" v-if="isWatermarkLayout">
            <label class="switch-label">
              <span class="switch">
                <input type="checkbox" v-model="config.enableWhiteMargin">
                <span class="switch-slider"></span>
              </span>
            </label>
          </div>
          <div class="setting-group slider-group" v-if="config.enableWhiteMargin || config.layout === 'pure_white_margin'">
            <div class="slider-header">
              <span>边框宽度</span>
              <span class="slider-value">{{ config.whiteMarginWidth }}%</span>
            </div>
            <input type="range" v-model.number="config.whiteMarginWidth" min="1" max="15" class="custom-slider">
          </div>
        </div>
        <div class="setting-section" v-if="config.layout === 'background_blur'">
          <div class="section-label">背景模糊</div>
          <div class="setting-group slider-group">
            <div class="slider-header">
              <span>模糊边距</span>
              <span class="slider-value">{{ config.blurPadding }}%</span>
            </div>
            <input type="range" v-model.number="config.blurPadding" min="5" max="30" class="custom-slider">
          </div>
        </div>
        <div class="setting-section" v-if="!isSquareLayout && !isBlurLayout">
          <div class="section-label">添加阴影</div>
          <div class="setting-group">
            <label class="switch-label">
              <span class="switch">
                <input type="checkbox" v-model="config.enableShadow">
                <span class="switch-slider"></span>
              </span>
            </label>
          </div>
        </div>
        <div class="setting-section">
          <div class="section-label">输出格式</div>
          <div class="format-options">
            <label class="format-option" :class="{ active: config.outputFormat === 'jpeg' }">
              <input type="radio" v-model="config.outputFormat" value="jpeg">
              <span class="format-name">JPEG</span>
              <span class="format-tag">推荐</span>
            </label>
            <label class="format-option" :class="{ active: config.outputFormat === 'png' }">
              <input type="radio" v-model="config.outputFormat" value="png">
              <span class="format-name">PNG</span>
              <span class="format-tag">无损</span>
            </label>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { LAYOUT_TYPES, ELEMENT_TYPES, OUTPUT_FORMATS, DEFAULT_CONFIG, getDetectedBrand } from './utils/constants'
import { readExif } from './utils/exifReader'
import { processImage, canvasToBlob } from './utils/imageProcessor'
import CustomSelect from './components/CustomSelect.vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const theme = ref(localStorage.getItem('theme') || 'system')
const showThemeMenu = ref(false)
const themeText = computed(() => {
  if (theme.value === 'light') return '浅色'
  if (theme.value === 'dark') return '深色'
  return '自动'
})

function setTheme(newTheme) {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  applyTheme()
  showThemeMenu.value = false
}

function applyTheme() {
  const root = document.documentElement
  let isDark = theme.value === 'dark'
  if (theme.value === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

function handleClickOutside(e) {
  if (!e.target.closest('.theme-switcher')) {
    showThemeMenu.value = false
  }
}

onMounted(() => {
  applyTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const config = reactive({ ...DEFAULT_CONFIG })
const images = ref([])
const selectedIndex = ref(0)
const processing = ref(false)
const generatingSingle = ref(false)
const progress = ref(0)
const dragover = ref(false)
const previewTab = ref('original')
const fileInput = ref(null)
const previewAreaRef = ref(null)

const zoomLevel = ref(1)

function zoomIn() {
  if (zoomLevel.value < 3) {
    zoomLevel.value = Math.min(3, zoomLevel.value + 0.25)
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.25) {
    zoomLevel.value = Math.max(0.25, zoomLevel.value - 0.25)
  }
}

function resetZoom() {
  zoomLevel.value = 1
}

const selectedImage = computed(() => images.value[selectedIndex.value] || null)
const isWatermarkLayout = computed(() => config.layout.includes('watermark') || config.layout === 'simple')
const isSquareLayout = computed(() => config.layout === 'square')
const isBlurLayout = computed(() => config.layout === 'background_blur')
const isDarkLayout = computed(() => config.layout.includes('dark'))

watch(() => config.layout, (newLayout) => {
  if (newLayout.includes('dark')) {
    config.enableWhiteMargin = false
    config.backgroundColor = '#212121'
  } else if (newLayout === 'watermark') {
    config.enableWhiteMargin = true
    config.backgroundColor = '#ffffff'
  }
})

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  addFiles(e.target.files)
  e.target.value = ''
}

function handleDrop(e) {
  dragover.value = false
  addFiles(e.dataTransfer.files)
}

async function addFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const preview = URL.createObjectURL(file)
    const exif = await readExif(file)
    images.value.push({ file, preview, exif, processed: null })
  }
  if (images.value.length === 1) selectedIndex.value = 0
}

function selectImage(index) {
  selectedIndex.value = index
  previewTab.value = images.value[index].processed ? 'processed' : 'original'
  zoomLevel.value = 1
}

function removeImage(index) {
  const img = images.value[index]
  URL.revokeObjectURL(img.preview)
  if (img.processed) URL.revokeObjectURL(img.processed)
  images.value.splice(index, 1)
  if (selectedIndex.value >= images.value.length) {
    selectedIndex.value = Math.max(0, images.value.length - 1)
  }
}

function clearAll() {
  images.value.forEach(img => {
    URL.revokeObjectURL(img.preview)
    if (img.processed) URL.revokeObjectURL(img.processed)
  })
  images.value = []
  selectedIndex.value = 0
}

async function generateSinglePreview() {
  if (generatingSingle.value || !selectedImage.value) return
  generatingSingle.value = true
  
  try {
    const img = selectedImage.value
    const canvas = await processImage(img.file, img.exif, config)
    const blob = await canvasToBlob(canvas, config.outputFormat)
    if (img.processed) URL.revokeObjectURL(img.processed)
    img.processed = URL.createObjectURL(blob)
    previewTab.value = 'processed'
  } catch (e) {
    console.error('预览生成失败:', e)
  }
  
  generatingSingle.value = false
}

async function processAll() {
  if (processing.value || !images.value.length) return
  
  processing.value = true
  progress.value = 0
  
  const zip = new JSZip()
  const total = images.value.length
  const ext = config.outputFormat === 'png' ? '.png' : config.outputFormat === 'webp' ? '.webp' : '.jpg'
  
  for (let i = 0; i < total; i++) {
    const img = images.value[i]
    
    try {
      const canvas = await processImage(img.file, img.exif, config)
      const blob = await canvasToBlob(canvas, config.outputFormat)
      
      if (img.processed) URL.revokeObjectURL(img.processed)
      img.processed = URL.createObjectURL(blob)
      
      const name = img.file.name.replace(/\.[^.]+$/, '') + '_watermark' + ext
      zip.file(name, blob)
    } catch (e) {
      console.error('处理失败:', img.file.name, e)
    }
    
    progress.value = ((i + 1) / total) * 100
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `semi-utils-${Date.now()}.zip`)
  
  processing.value = false
}
</script>
