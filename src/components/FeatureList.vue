<script setup lang="ts">
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
  <ol>
    <li v-for="([feature, value], index) of enabledFeatures" :key="feature" class="flex justify-between hover:bg-yellow-200 px-1">
      <p><strong>{{ `${feature} : ` }}</strong> {{ value }}</p>
      <div class="flex gap-2 items-center">
        <HoldClickButton
          v-if="index !== 0"
          :on-click-action="() => moveUp(index)"
          :on-hold-action="() => moveToTop(index)"
          icon="i-material-symbols:arrow-upward"
          icon-color="green-500"
        />
        <HoldClickButton
          :on-click-action="() => moveDown(index)"
          :on-hold-action="() => moveToBottom(index)"
          icon="i-material-symbols:arrow-downward"
          icon-color="blue-500"
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
