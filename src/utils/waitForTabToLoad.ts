export default async function waitForTabToLoad(tabId: number): Promise<void> {
  // console.log(`Hello from waitForTabToLoad. tabID: ${tabId}`)
  return new Promise((resolve) => {
    browser.tabs.onUpdated.addListener(
      function listener(updatedTabId, changeInfo) {
        // console.log('changeInfo: ', changeInfo)
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener)
          resolve()
        }
      },
    )
  })
}
