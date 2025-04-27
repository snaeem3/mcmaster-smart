<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  icon: string
  text?: string
  originalColor: string
  finalColor: string
  onClickAction: () => void
  onHoldAction: () => void
}>()

const isHolding = ref(false)
let holdTimeout: ReturnType<typeof setTimeout>
let held = false

function startHold() {
  held = false
  isHolding.value = true

  holdTimeout = setTimeout(() => {
    held = true
    props.onHoldAction()
    isHolding.value = false
  }, 2000)
}

function endHold() {
  clearTimeout(holdTimeout)
  if (!held) {
    props.onClickAction()
  }
  isHolding.value = false
}

function cancelHold() {
  clearTimeout(holdTimeout)
  isHolding.value = false
}

// const styleObject = computed(() => ({
//   backgroundColor: props.originalColor,
// }))
</script>

<template>
  <button
    class="hold-button"
    :class="[icon, { holding: isHolding }]"
    @mousedown="startHold"
    @mouseup="endHold"
    @mouseleave="cancelHold"
  >
    {{ text }}
  </button>
</template>

<style scoped>
.hold-button {
  padding: 15px 30px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.hold-button.holding {
  animation: holdProgress 2s linear forwards;
}

@keyframes holdProgress {
  0% { background-color: #3498db; }
  100% { background-color: #e74c3c; }
}
</style>
