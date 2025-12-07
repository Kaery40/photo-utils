<template>
  <div class="custom-select" :class="{ open: isOpen, small: small }" ref="selectRef">
    <div class="select-trigger" @click="toggle">
      <span class="select-value">{{ displayValue }}</span>
      <span class="select-arrow">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <div class="select-dropdown" v-show="isOpen">
      <div 
        class="select-option" 
        v-for="(label, value) in options" 
        :key="value"
        :class="{ selected: modelValue === value }"
        @click="selectOption(value)"
      >
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Object, required: true },
  small: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectRef = ref(null)

const displayValue = computed(() => props.options[props.modelValue] || props.modelValue)

function toggle() {
  isOpen.value = !isOpen.value
}

function selectOption(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--text-dim);
  }
  
  .open & {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.15);
  }
}

.select-value {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-arrow {
  color: var(--text-dim);
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  
  .open & {
    transform: rotate(180deg);
  }
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
  
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge
  
  &::-webkit-scrollbar {
    display: none; // Chrome/Safari
  }
}

.select-option {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  &.selected {
    background: rgba(211, 47, 47, 0.1);
    color: var(--accent);
  }
}

.small {
  .select-trigger {
    padding: 10px 12px;
  }
  
  .select-value {
    font-size: 12px;
    line-height: 1.5;
  }
  
  .select-option {
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
