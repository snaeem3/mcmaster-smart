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
  <ul class="flex flex-col gap-2 px-1">
    <li v-for="key in settingKeys" :key="key" class="flex flex-col gap-2 ">
      <div>
        <label class="flex justify-between cursor-pointer text-base" :for="key">{{ key }}

          <span v-if="typeof settings[key] === 'boolean'" class="relative inline-flex items-center w-10 h-6">
            <input
              :id="key"
              v-model="settings[key]"
              type="checkbox"
              class="sr-only peer"
            >
            <div
              class="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-200"
            />
            <div
              class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4"
            />
          </span>

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
        </label>
      </div>
    </li>
    <button
      class="w-full py-1 rounded-md font-semibold text-base text-blue-600 border border-solid border-gray-800  bg-gray-1 hover:text-blue-800 transition-colors duration-200 flex items-center justify-center gap-2"
      @click="resetToDefault"
    >
      Reset To Default
      <div class="i-ri:reset-left-fill" />
    </button>
  </ul>
</template>
