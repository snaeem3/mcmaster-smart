import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import executeMSCfuncs from '~/msc/executeMSCfuncs'
import type { McMasterItem } from '~/Item'
import type ExecuteMSCSettings from '~/msc/settings'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = false

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    try {
      await sendMessage('tab-finished-loading', { url: tab.url ?? null }, `content-script@${tabId}`)
      console.log(`Message sent to content script in tab ${tabId}`)
    }
    catch (error) {
      console.error(`Failed to send message to tab ${tabId}:`, error)
    }
  }
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    console.log('tab: ', tab)
    return {
      title: tab?.title,
      // status: tab?.status as Tabs.TabStatus,
    }
  }
  catch {
    return {
      title: undefined,
      // status: undefined,
    }
  }
})

onMessage('EXECUTE-MSC', async ({ data }) => {
  // Do whatever processing you need here.
  console.log('data: ', data)
  const { urls, mcmasterItemJSON, DEBUG, settingsJSON } = data
  const mcmasterItem = JSON.parse(mcmasterItemJSON) as Partial<McMasterItem>
  console.log('mcmasterItem: ', mcmasterItem)
  const settings = JSON.parse(settingsJSON) as ExecuteMSCSettings
  console.log('settings: ', settings)
  // const testURL
  //   = 'https://www.mscdirect.com/browse/tn?rd=k&searchterm=ID+Tag+Cable+Tie'

  let windowResults
  try {
    // const window = await browser.windows.create({
    //   url: testURL,
    // })
    windowResults = await Promise.all(
      DEBUG
        ? [executeMSCfuncs(urls[0], mcmasterItem, settings)]
        : urls.map(url => executeMSCfuncs(url, mcmasterItem, settings)),
    )
    console.log('windowResults: ', windowResults)
    return {
      windowResults: windowResults.filter(windowResult => windowResult !== undefined),
    }
  }
  catch (error) {
    console.error('Error getting windowResults: ', error)
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }
})
