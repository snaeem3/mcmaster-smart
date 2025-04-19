export default async function waitForTabToLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    browser.tabs.onUpdated.addListener(
      function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener)
          resolve()
        }
      },
    )
  })
}
