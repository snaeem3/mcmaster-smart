<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import 'uno.css'
import { tabs } from 'webextension-polyfill'
import type { McMasterItem } from './Item'

const [show, toggle] = useToggle(false)
const mcmasterItemTitle = ref<string>('')

async function handleSearchMSC(DEBUG = false) {
  // const activeTab = await chrome.tabs.query({
  //   active: true,
  //   currentWindow: true,
  // })
  // console.log('activeTab: ', activeTab)
  // const startTime = performance.now()

  const mcmasterItem: Partial<McMasterItem> = scanPage()
  if (mcmasterItem.primaryName)
    mcmasterItemTitle.value = mcmasterItem.primaryName
  // if (activeTab) {
  //   try {
  //     mcmasterItem = await chrome.tabs.sendMessage(activeTab[0].id, {
  //       type: 'SCAN',
  //     })
  //     setExtractedInfo(mcmasterItem)
  //   }
  //   catch (error) {
  //     console.error('Error scanning McMaster page', error)
  //   }
  // }

  // Create search queries from extracted mcmaster data
  // const searchQueries = createSearchQueries(mcmasterItem);
  // if (DEBUG)
  //   searchQueries.forEach((searchQuery, index) =>
  //     console.log(`searchQuery(${index}): ${searchQuery.toString()}`),
  //   );

  // const testURL =
  //   "https://www.mscdirect.com/browse/tn?rd=k&searchterm=ID+Tag+Cable+Tie";

  // const urls = searchQueries.map(
  //   (searchQuery) =>
  //     `https://www.mscdirect.com/browse/tn?rd=k&${searchQuery.toString()}`,
  // );

  // // TODO: Add try-catch below?
  // // Execute MSC scripts using created search queries
  // const windowResults = await Promise.all(
  //   DEBUG
  //     ? [executeMSCfuncs(urls[0], mcmasterItem)]
  //     : urls.map((url) => executeMSCfuncs(url, mcmasterItem)),
  // );
  // console.log("windowResults: ", windowResults);
  // const currentTime = performance.now();
  // const elapsedTime = currentTime - startTime;
  // const seconds = elapsedTime / 1000;

  // for (const windowResult of windowResults) {
  //   if (windowResult === undefined) continue;
  //   const THRESHOLD = 0.1;
  //   const { bestProduct, score, error } = getBestMatchingProduct(
  //     mcmasterItem,
  //     windowResult,
  //     THRESHOLD,
  //   );
  //   if (error) console.error(error);
  //   else if (bestProduct) {
  //     console.log("bestProduct: ", bestProduct);
  //     console.log("score: ", score);
  //     // setBestMatchedProduct(bestProduct, score);
  //     setFoundProducts([bestProduct], [score]);
  //   }
  // }

  // if (timerResult) {
  //   timerResult.textContent = `Found in ${Math.round(seconds * 100) / 100}s`;
  // }
}

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

function extractTable(table: HTMLTableElement) {
  const result: Record<string, string | Record<string, string>> = {}
  let tempMap: Record<string, string> = {}
  let tempSubTableName = ''

  for (let i = 0; i < table.rows.length; i++) {
    const tableRow = table.rows[i]
    const key = tableRow.cells[0].textContent?.trim()
    const value = tableRow.cells[1].textContent?.trim()
    const isIndented = containsPhrase(tableRow)

    if (isIndented && key && value) {
      // If this row is indented just add it to tempMap
      tempMap[key] = value
    }
    else if (!isIndented && key) {
      // This row is not part of a sub table
      if (Object.keys(tempMap).length > 0) {
        // add current sub table to result if there is one
        result[tempSubTableName] = tempMap
        tempMap = {}
      }
      tempSubTableName = key
      if (value)
        result[key] = value
    }
  }
  if (Object.keys(tempMap).length > 0) {
    result[tempSubTableName] = tempMap
  }

  return result
}

function containsPhrase(row: HTMLTableRowElement, phrase: string = 'indent') {
  return Array.from(row.classList).some(className =>
    className.includes(phrase),
  )
}
</script>

<template>
  <div class="fixed right-0 bottom-0 m-5 z-100 flex items-end font-sans select-none leading-1em">
    <div
      v-show="show"
      class="bg-white text-gray-800 rounded-lg shadow w-max h-min"
      p="x-4 y-2"
      m="y-auto r-2"
      transition="opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'"
    >
      <h1 class="text-lg">
        Vitesse WebExt
      </h1>
      <h3>McMaster Smart</h3>
      <button id="search-btn" @click="handleSearchMSC">
        Search MSC
      </button>
      <div>
        <h4 id="item-title">
          {{ mcmasterItemTitle }}
        </h4>
        <p id="item-info" />
      </div>
      <div>
        <ol id="match-list" />
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
