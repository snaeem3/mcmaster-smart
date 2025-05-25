<script setup lang="ts">
import HoldClickButton from '~/components/HoldClickButton.vue'

const props = defineProps<{
  features: Record<string, string>
}>()
const emit = defineEmits<{
  (e: 'update:features', enabledFeatures: Record<string, string>, disabledFeatures: Record<string, string>): void
}>()

const enabledFeatures = ref<[string, string][]>([])
const disabledFeatures = ref<[string, string][]>([])

// Sync prop to local state
watch(
  () => props.features,
  (newFeatures) => {
    const newEntries = Object.entries(newFeatures)
    enabledFeatures.value = [...newEntries]
    // disabledFeatures.value = []
  },
  { immediate: true, deep: true },
)

// Remove the second watcher that was causing the infinite loop
// Only emit when user performs actions, not when props change

function enable(index: number) {
  const [key, value] = disabledFeatures.value.splice(index, 1)[0]
  enabledFeatures.value.push([key, value])
  emitUpdate()
}

function disable(index: number) {
  const [key, value] = enabledFeatures.value.splice(index, 1)[0]
  disabledFeatures.value.push([key, value])
  emitUpdate()
}

function moveAllElements(fromArray: any[], toArray: any[]) {
  while (fromArray.length > 0) {
    toArray.push(fromArray.shift())
  }
}

function enableAll() {
  moveAllElements(disabledFeatures.value, enabledFeatures.value)
  emitUpdate()
}

function disableAll() {
  moveAllElements(enabledFeatures.value, disabledFeatures.value)
  emitUpdate()
}

function moveUp(index: number) {
  if (index === 0)
    return
  [enabledFeatures.value[index - 1], enabledFeatures.value[index]] = [enabledFeatures.value[index], enabledFeatures.value[index - 1]]
  emitUpdate()
}

function moveDown(index: number) {
  if (index === enabledFeatures.value.length - 1)
    return;
  [enabledFeatures.value[index + 1], enabledFeatures.value[index]] = [enabledFeatures.value[index], enabledFeatures.value[index + 1]]
  emitUpdate()
}

function moveToTop(index: number) {
  const [feature] = enabledFeatures.value.splice(index, 1)
  enabledFeatures.value.unshift(feature)
  emitUpdate()
}

function moveToBottom(index: number) {
  const [feature] = enabledFeatures.value.splice(index, 1)
  enabledFeatures.value.push(feature)
  emitUpdate()
}

// Emit both enabled and disabled features
function emitUpdate() {
  const enabledFeaturesObj = Object.fromEntries(enabledFeatures.value)
  const disabledFeaturesObj = Object.fromEntries(disabledFeatures.value)
  emit('update:features', enabledFeaturesObj, disabledFeaturesObj)
}

// Expose a method for parent to reset everything
defineExpose({
  resetFeatures: (newFeatures: Record<string, string>) => {
    const newEntries = Object.entries(newFeatures)
    enabledFeatures.value = [...newEntries]
    disabledFeatures.value = []
  },
})
</script>

<template>
  <div class="flex justify-between gap-4">
    <h2>{{ `Enabled Features (${enabledFeatures.length})` }}</h2>
    <div class="flex justify-center gap-3">
      <button
        class="px-4 py-2 rounded-lg font-semibold text-blue-600 border border-solid border-gray-100  bg-gray-50 hover:bg-light transition-colors duration-200
         disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:text-gray-600"
        :disabled="disabledFeatures.length <= 0"
        @click="enableAll()"
      >
        Enable All
      </button>
      <button
        class="px-4 py-2 rounded-lg font-semibold text-white border border-solid border-gray-100 bg-blue-600 hover:bg-blue-700 transition-colors duration-200
         disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="enabledFeatures.length <= 0"
        @click="disableAll()"
      >
        Disable All
      </button>
    </div>
  </div>

  <ol class="list-decimal">
    <li v-for="([feature, value], index) of enabledFeatures" :key="feature" class="flex justify-between hover:bg-yellow-200 px-1">
      <p class="truncate hover:text-wrap">
        <strong>{{ `${feature} : ` }}</strong> {{ value }}
      </p>
      <div class="flex gap-2 items-center">
        <HoldClickButton
          v-if="index !== 0"
          :on-click-action="() => moveUp(index)"
          :on-hold-action="() => moveToTop(index)"
          icon="i-material-symbols:arrow-upward"
          icon-color="bg-green-500"
        />
        <HoldClickButton
          :on-click-action="() => moveDown(index)"
          :on-hold-action="() => moveToBottom(index)"
          icon="i-material-symbols:arrow-downward"
          icon-color="bg-blue-500"
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
  <h2>{{ `Disabled Features (${disabledFeatures.length})` }}</h2>
  <ul>
    <li
      v-for="([feature, value], index) in disabledFeatures"
      :key="feature"
      class="flex cursor-pointer hover:bg-yellow-500 p-1 items-center group truncate hover:text-wrap"
      @click="enable(index)"
    >
      <strong>{{ feature }}:&nbsp;</strong><p>{{ value }}</p>
      <span class="ml-3 text-sm text-blue-700 invisible group-hover:visible ml-auto">
        re-enable?
      </span>
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
