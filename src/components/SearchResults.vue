<script setup lang="ts">
import type { MSCItem } from '~/msc/MSCItem'

defineProps<{
  foundProducts: Partial<MSCItem>[]
  searchErrors: Error[]
  searchTime: number
}>()
</script>

<template>
  <div>
    <div v-if="foundProducts.length > 0" class="my-4">
      <h2 class="text-base font-semibold mb-2 text-indigo-700 flex items-center gap-2">
        <span class="i-material-symbols:check-circle-rounded text-green-500 text-xl" />
        Found {{ foundProducts.length }} Products in {{ Math.round(searchTime * 100) / 100 }} seconds
      </h2>
      <ol id="match-list" class="space-y-2">
        <li
          v-for="foundProduct in foundProducts"
          :key="foundProduct?.mscId"
          class="bg-indigo-50 rounded-md px-3 py-2 hover:bg-indigo-100 transition"
        >
          <a
            :href="foundProduct.url?.toString()"
            target="_blank"
            class="text-indigo-800 font-medium hover:underline flex items-center gap-1"
          >
            <span class="i-material-symbols:open-in-new text-base" />
            {{ foundProduct?.primaryName }}
          </a>
        </li>
      </ol>
    </div>
    <div v-if="searchErrors.length > 0" class="my-4">
      <h2 class="text-base font-semibold mb-2 text-red-600 flex items-center gap-2">
        <span class="i-material-symbols:error-rounded text-red-500 text-xl" /> Error(s)
      </h2>
      <ul class="space-y-1">
        <li
          v-for="error in searchErrors"
          :key="error.name"
          class="bg-red-50 rounded-md px-3 py-2 text-red-800"
        >
          {{ `${error.name}${error.message.length > 0 ? `: ${error.message}` : ''}` }}
        </li>
      </ul>
    </div>
  </div>
</template>
