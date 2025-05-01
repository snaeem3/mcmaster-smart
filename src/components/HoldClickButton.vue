<script lang="ts" setup>
import { ref } from 'vue'

defineProps<{
  icon: string
  iconColor?: string
  text?: string
  onClickAction: () => void
  onHoldAction: () => void
}>()

const isHolding = ref(false)
let holdTimer: ReturnType<typeof setTimeout> | null

function startHold(action: () => void) {
  clearHold()
  isHolding.value = true
  holdTimer = setTimeout(() => {
    action()
    holdTimer = null
    isHolding.value = false
  }, 2000) // 2 seconds hold
}

function cancelHold(fallbackAction: () => void) {
  isHolding.value = false
  if (holdTimer) {
    clearTimeout(holdTimer)
    fallbackAction()
    holdTimer = null
  }
}

function clearHold() {
  isHolding.value = false
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
}
</script>

<template>
  <button
    class="hold-button bg-transparent color-white border border-solid border-transparent border-3 rounded-lg cursor-pointer position-relative
    hover:border-gray-600"
    :class="[{ holding: isHolding }]"
    @mousedown="startHold(onHoldAction)"
    @mouseup="cancelHold(onClickAction)"
    @mouseleave="clearHold"
  >
    <div class="text-3xl" :class="[icon]" :bg="iconColor">
      {{ text }}
    </div>
  </button>
</template>

<style scoped>
.hold-button.holding {
  animation: holdProgress 2s linear forwards;
}

@keyframes holdProgress {
  0% {
    border-color: #ffffff;
  }
  25% {
    border-right-color: #000000;
  }
  50% {
    border-right-color: #000000;
    border-bottom-color: #000000;
  }
  75% {
    border-right-color: #000000;
    border-bottom-color: #000000;
    border-left-color: #000000;
  }
  100% {
    border-color: #000000;
  }
}
</style>
