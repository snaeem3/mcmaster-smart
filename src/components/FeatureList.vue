<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  features: Record<string, string>
}>()

interface Item {
  featureName: string
  featureValue: string
  enabled: boolean
}

const items = reactive<Item[]>(
  Object.entries(props.features).map(([featureName, featureValue]) => ({
    featureName,
    featureValue,
    enabled: true,
  })),
)

// Sort enabled items above disabled items, maintaining internal order
const sortedItems = computed(() => {
  return [...items].sort((a, b) => {
    if (a.enabled === b.enabled)
      return 0
    return a.enabled ? -1 : 1
  })
})

function moveUp(index: number) {
  const item = sortedItems.value[index]
  const originalIndex = items.findIndex(i => i.featureName === item.featureName)
  if (originalIndex > 0) {
    const temp = items[originalIndex - 1]
    items[originalIndex - 1] = item
    items[originalIndex] = temp
  }
}

function moveDown(index: number) {
  const item = sortedItems.value[index]
  const originalIndex = items.findIndex(i => i.featureName === item.featureName)
  if (originalIndex < items.length - 1) {
    const temp = items[originalIndex + 1]
    items[originalIndex + 1] = item
    items[originalIndex] = temp
  }
}

function moveToTop(index: number) {
  const item = sortedItems.value[index]
  const currentIndex = items.findIndex(i => i.featureName === item.featureName)
  if (currentIndex > 0) {
    items.splice(currentIndex, 1)
    items.unshift(item)
  }
}

function moveToBottom(index: number) {
  const item = sortedItems.value[index]
  const currentIndex = items.findIndex(i => i.featureName === item.featureName)
  if (currentIndex < items.length - 1) {
    items.splice(currentIndex, 1)
    items.push(item)
  }
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
</script>

<template>
  <ul>
    <li v-for="(item, index) in sortedItems" :key="item.featureName" class="flex ">
      <div v-if="item.enabled">
        <button
          v-if="index !== 0"
          class="mx-1"
          @mousedown="startHold(() => moveToTop(index), index)"
          @mouseup="cancelHold(() => moveUp(index))"
          @mouseleave="clearHold"
        >
          ⬆️
        </button>

        <!-- Getting index of last enabled item -->
        <button
          v-if="index !== sortedItems.filter(sortedItem => sortedItem.enabled).length - 1"
          class="mx-1"
          @mousedown="startHold(() => moveToBottom(index), index)"
          @mouseup="cancelHold(() => moveDown(index))"
          @mouseleave="clearHold"
        >
          ⬇️
        </button>
      </div>
      <strong>{{ `${index} ${item.featureName} : ` }}</strong> {{ item.featureValue }}
      <input :id="item.featureName" v-model="item.enabled" type="checkbox">
    </li>
  </ul>
</template>

<style lang="css">
ul {
  list-style-type: none;
}
</style>
