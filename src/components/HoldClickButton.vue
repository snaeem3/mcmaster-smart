<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  icon: string
  iconColor?: string
  text?: string
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
</script>

<template>
  <button
    class="hold-button"
    :class="[{ holding: isHolding }]"
    @mousedown="startHold"
    @mouseup="endHold"
    @mouseleave="cancelHold"
  >
    <div class="text-3xl" :class="[icon]" :bg="iconColor">
      {{ text }}
    </div>
  </button>
</template>

<style scoped>
.hold-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: white;
  border: solid 3px transparent;
  border-radius: 1rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
}

.hold-button:hover {
  border-color: #989898;
}

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
