<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import 'uno.css'
import { sendMessage } from 'webext-bridge/content-script'
import type { McMasterItem } from '../../Item'
import createSearchQueries from './createSearchQueries'
import extractTable from '~/utils/extractTable'
import getBestMatchingProduct from '~/bestMatchingProduct'
import type { MSCItem } from '~/msc/MSCItem'
import FeatureList from '~/components/FeatureList.vue'
import flattenRecord from '~/flattenRecord'
import type ExecuteMSCSettings from '~/msc/settings'
import { defaultSettings } from '~/msc/settings'

const [show, toggle] = useToggle(true)
const [showSettings, toggleSettings] = useToggle(false)
const mcmasterItemCurrent = ref<Partial<McMasterItem>>({})
const foundProducts = ref<Partial<MSCItem>[]>([])
const settings = ref<ExecuteMSCSettings>()
const searchErrors = ref<Error[]>([])

onMounted(() => {
  const mcmasterItem = scanPage()
  if (mcmasterItem.primaryName)
    mcmasterItemCurrent.value = mcmasterItem
  settings.value = defaultSettings
})

function scanPage() {
  const title = document.querySelector('h1')?.textContent
  const h3 = document.querySelector('h3')?.textContent
  const tables = [...document.querySelectorAll('table')]
  // TODO: extract price

  const pageObj: Partial<McMasterItem> = {
    primaryName: '',
    secondaryName: '',
  }
  if (title)
    pageObj.primaryName = title
  if (h3)
    pageObj.secondaryName = h3

  if (tables.length === 1) {
    pageObj.itemFeatures = extractTable(tables[0])
  }
  else {
    const productDetailTable = tables.find(table =>
      table.className.includes('ProductDetail'),
    )
    if (!productDetailTable) {
      console.warn('ProductDetail table not found- using last table on page')
      pageObj.itemFeatures = extractTable(tables[tables.length - 1])
    }
    else {
      pageObj.itemFeatures = extractTable(productDetailTable)
    }
  }

  return pageObj
}

async function handleSearchMSC(DEBUG = false) {
  // const startTime = performance.now()
  foundProducts.value = []
  searchErrors.value = []

  // Create search queries from extracted mcmaster data
  const searchQueries = createSearchQueries(mcmasterItemCurrent.value)
  if (DEBUG) {
    searchQueries.forEach((searchQuery, index) =>
      console.log(`searchQuery(${index}): ${searchQuery.toString()}`),
    )
  }

  const urls = searchQueries.map(
    searchQuery =>
      `https://www.mscdirect.com/browse/tn?rd=k&${searchQuery.toString()}`,
  )

  // console.log('mcmasterItemCurrent.value: ', mcmasterItemCurrent)
  // console.log('JSON.stringify(mcmasterItemCurrent.value): ', JSON.stringify(mcmasterItemCurrent.value))

  const sendToBackground = async () => {
    console.log('settings.value: ', settings.value)
    const response = await sendMessage('EXECUTE-MSC', {
      urls,
      mcmasterItemJSON: JSON.stringify(mcmasterItemCurrent.value),
      DEBUG: false,
      settingsJSON: JSON.stringify(settings.value),
    }, 'background')

    // Handle response
    console.log('response: ', response)
    return response
  }
  const { windowResults, error } = await sendToBackground()
  console.log('windowResults: ', windowResults)

  if (error)
    searchErrors.value.push(error)

  // const currentTime = performance.now()
  // const elapsedTime = currentTime - startTime
  // const seconds = elapsedTime / 1000

  if (windowResults) {
    for (let i = 0; i < windowResults.length; i++) {
      const windowResult = windowResults[i]
      if (windowResult instanceof Error) {
        searchErrors.value.push(windowResult)
        continue
      }

      if (windowResult.length === 0) {
        searchErrors.value.push({ name: `No results from search ${i}`, message: '' })
        continue
      }
      const { bestProduct, score, error } = getBestMatchingProduct(
        mcmasterItemCurrent.value,
        windowResult,
        settings.value?.bestMatchingProductThreshold,
      )
      if (error) {
        console.error(error)
        searchErrors.value.push({ name: error, message: `score: ${score}` })
      }
      else if (bestProduct) {
        console.log('bestProduct: ', bestProduct)
        console.log('score: ', score)
        foundProducts.value.push(bestProduct)
      }
    }
  }
  else {
    searchErrors.value.push({ name: 'No results', message: '' })
  }

  showSettings.value = false

  // if (timerResult) {
  //   timerResult.textContent = `Found in ${Math.round(seconds * 100) / 100}s`;
  // }
}

function onFeatureUpdate(features: Record<string, string>) {
  mcmasterItemCurrent.value.itemFeatures = features
  console.log('onFeatureUpdate: ', mcmasterItemCurrent.value)
}

function onSettingsUpdate(newSettings: ExecuteMSCSettings) {
  settings.value = newSettings
}
</script>

<template>
  <div class="fixed right-0 bottom-0 flex items-end font-sans select-none leading-1em z-[10000]">
    <div
      v-show="show"
      class="bg-white text-gray-800 rounded-lg shadow w-max h-min max-h-[90vh] overflow-y-auto"
      p="x-4 y-2"
      m="y-auto r-2"
      transition="opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'"
      max-h-screen
      overflow-y-auto
    >
      <h1 class="text-lg">
        McMaster Smart
      </h1>
      <button
        id="search-btn"
        class="w-full px-6 py-3 text-lg font-bold rounded-xl border border-solid border-gray-100 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600
         hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200
         focus:outline-none focus:ring-4 focus:ring-indigo-300"
        @click="handleSearchMSC()"
      >
        Search MSC
      </button>
      <div v-if="foundProducts.length > 0">
        <h2>Found Products</h2>
        <ol id="match-list">
          <li v-for="foundProduct in foundProducts" :key="foundProduct?.mscId">
            <a :href="foundProduct.url?.toString()" target="_blank">
              {{ foundProduct?.primaryName }}
            </a>
          </li>
        </ol>
      </div>
      <div v-if="searchErrors.length > 0">
        <h2>Error(s)</h2>
        <ul>
          <li v-for="error in searchErrors" :key="error.name">
            {{ `${error.name}${error.message.length > 0 ? `: ${error.message}` : ''}` }}
          </li>
        </ul>
      </div>
      <div>
        <h4 id="item-title">
          {{ mcmasterItemCurrent.primaryName }}
        </h4>
        <div id="item-info">
          <FeatureList v-if="mcmasterItemCurrent.itemFeatures" :features="flattenRecord(mcmasterItemCurrent.itemFeatures)" @update:features="onFeatureUpdate" />
        </div>
      </div>
      <div class="bg-gray-2 p-2 rounded-sm">
        <input
          id="hideShowSettings"
          type="checkbox"
          class="hidden"
        >
        <label
          for="hideShowSettings"
          class="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-800"
          @click="toggleSettings()"
        >
          <div
            class="i-material-symbols:arrow-drop-down-rounded text-xl rotate-270"
            :class="{ 'rotate-360': showSettings }"
          />
          <h3 class="p-1 m-0 flex-1"> {{ `${showSettings ? 'Hide' : 'Show'} Search Settings` }} </h3>
          <div class="i-material-symbols:settings-rounded h-full aspect-square text-xl" />
        </label>
        <MSCSettings v-show="showSettings" class="mt-3" @update:settings="onSettingsUpdate" />
      </div>
      <div>
        <p id="timer-result" />
      </div>
    </div>
    <button
      class="flex w-10 h-10 rounded-full shadow cursor-pointer border-none"
      bg="teal-600 hover:teal-700"
      @click="toggle()"
    >
      <pixelarticons-power class="block m-auto text-white text-lg" />
    </button>
  </div>
</template>
