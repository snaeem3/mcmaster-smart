<script setup lang="ts">
import { defineProps } from 'vue'
import HoldClickButton from '~/components/HoldClickButton.vue'

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

function moveAllElements(fromArray: any[], toArray: any[]) {
  while (fromArray.length > 0) {
    toArray.push(fromArray.shift())
  }
}

function enableAll() {
  moveAllElements(disabledFeatures, enabledFeatures)
}

function disableAll() {
  moveAllElements(enabledFeatures, disabledFeatures)
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
  <div>
    <button :disabled="disabledFeatures.length <= 0" @click="enableAll()">
      Enable All
    </button>
    <button :disabled="enabledFeatures.length <= 0" @click="disableAll()">
      Disable All
    </button>
  </div>
  <ol>
    <li v-for="([feature, value], index) of enabledFeatures" :key="feature" class="flex justify-between hover:bg-yellow-200 px-1">
      <p><strong>{{ `${feature} : ` }}</strong> {{ value }}</p>
      <div class="flex gap-2 items-center">
        <button
          v-if="index !== 0"
          class="i-material-symbols:arrow-upward text-2xl p-2 rounded transition-colors"
          bg="green-500 hover:green-700"
          text="white"
          @mousedown="startHold(() => moveToTop(index), index)"
          @mouseup="cancelHold(() => moveUp(index))"
          @mouseleave="clearHold"
        />

        <button
          class="i-material-symbols:arrow-downward text-2xl p-2 rounded transition-colors"
          bg="blue-500 hover:blue-700"
          text="white"
          @mousedown="startHold(() => moveToBottom(index), index)"
          @mouseup="cancelHold(() => moveDown(index))"
          @mouseleave="clearHold"
        />

        <button
          class="i-material-symbols:disabled-by-default text-2xl p-2 rounded transition-colors"
          bg="gray-500 hover:gray-700"
          text="white"
          @click="disable(index)"
        />
      </div>
    </li>
  </ol>
  <HoldClickButton
    :duration="2000"
    :on-click-action="() => console.log('clicked')"
    :on-hold-action="() => console.log('held')"
    icon="i-material-symbols:arrow-downward"
    icon-color="green-500"
  />
  <ul>
    <li v-for="([feature, value], index) in disabledFeatures" :key="feature" class="flex cursor-pointer hover:bg-yellow-500 p-1" @click="enable(index)">
      <strong>{{ `${feature} : ` }}</strong> {{ value }}
    </li>
  </ul>
</template>

<style lang="css">
ul {
  list-style-type: none;
}

button {
  cursor: pointer;
}
</style>
