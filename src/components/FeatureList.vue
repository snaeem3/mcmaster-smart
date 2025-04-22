<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  features: Record<string, string>
}>()
const emit = defineEmits<{
  (e: 'update:features', value: Record<string, string>): void
}>()

const enabledFeatures = reactive<[string, string][]>(Object.entries(props.features))
const disabledFeatures = reactive<[string, string][]>([])

function enable(index: number) {
  const [feature] = disabledFeatures.splice(index, 1)
  enabledFeatures.push(feature)
}

function disable(index: number) {
  const [feature] = enabledFeatures.splice(index, 1)
  disabledFeatures.push(feature)
}

function moveUp(index: number) {
  if (index === 0)
    return
  [enabledFeatures[index - 1], enabledFeatures[index]] = [enabledFeatures[index], enabledFeatures[index - 1]]
}

function moveDown(index: number) {
  if (index === enabledFeatures.length - 1)
    return;
  [enabledFeatures[index + 1], enabledFeatures[index]] = [enabledFeatures[index], enabledFeatures[index + 1]]
}

function moveToTop(index: number) {
  const [feature] = enabledFeatures.splice(index, 1)
  enabledFeatures.unshift(feature)
}

function moveToBottom(index: number) {
  const [feature] = enabledFeatures.splice(index, 1)
  enabledFeatures.push(feature)
}

// Hold-to-top/bottom logic
let holdTimer: ReturnType<typeof setTimeout> | null = null

// eslint-disable-next-line unused-imports/no-unused-vars
function startHold(action: () => void, index: number) {
  clearHold()
  holdTimer = setTimeout(() => {
    action()
    holdTimer = null
  }, 2000) // 2 seconds hold
}

function cancelHold(fallbackAction: () => void) {
  if (holdTimer) {
    clearTimeout(holdTimer)
    fallbackAction()
    holdTimer = null
  }
}

function clearHold() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
}

// Emit enabled features (in order) whenever the list changes
watch(
  enabledFeatures,
  () => {
    const updatedFeatures = Object.fromEntries(enabledFeatures)
    emit('update:features', updatedFeatures)
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <ol>
    <li v-for="([feature, value], index) of enabledFeatures" :key="feature" class="flex ">
      <button
        v-if="index !== 0"
        class="mx-1"
        @mousedown="startHold(() => moveToTop(index), index)"
        @mouseup="cancelHold(() => moveUp(index))"
        @mouseleave="clearHold"
      >
        ⬆️
      </button>

      <button
        class="mx-1"
        @mousedown="startHold(() => moveToBottom(index), index)"
        @mouseup="cancelHold(() => moveDown(index))"
        @mouseleave="clearHold"
      >
        ⬇️
      </button>
      <strong>{{ `${feature} : ` }}</strong> {{ value }}
      <button @click="disable(index)">
        disable
      </button>
    </li>
  </ol>
  <ul>
    <li v-for="([feature, value], index) in disabledFeatures" :key="feature" class="flex" @click="enable(index)">
      <strong>{{ `${feature} : ` }}</strong> {{ value }}
    </li>
  </ul>
</template>

<style lang="css">
ul {
  list-style-type: none;
}
</style>
