<script setup lang="ts">
import { ref, watch } from 'vue'
import type ExecuteMSCSettings from '~/msc/settings'
import { defaultSettings } from '~/msc/settings'

const emit = defineEmits<{
  (e: 'update:settings', value: ExecuteMSCSettings): void
}>()
const settings = ref({ ...defaultSettings })
const settingKeys = Object.keys(defaultSettings) as (keyof ExecuteMSCSettings)[]
watch(settings, (val) => {
  emit('update:settings', val)
}, { deep: true })

function resetToDefault() {
  settings.value = { ...defaultSettings }
}
</script>

<template>
  <div class="settings-panel">
    <button @click="resetToDefault">
      Reset To Default
    </button>
    <div v-for="key in settingKeys" :key="key" class="setting-item">
      <label :for="key">{{ key }}</label>
      <template v-if="typeof settings[key] === 'boolean'">
        <input
          :id="key"
          v-model="settings[key]"
          type="checkbox"
        >
      </template>
      <!-- Number: Slider -->
      <template v-else-if="typeof settings[key] === 'number'">
        <input
          :id="key"
          v-model.number="settings[key]"
          type="range"
          min="0"
          max="1"
          step="0.01"
        >
        <span>{{ settings[key] }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.setting-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
