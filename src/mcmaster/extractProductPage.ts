import type { McMasterItem } from '~/Item'
import extractTable from '~/utils/extractTable'
import getBetweenLastTwoSlashes from '~/utils/getBetweenLastTwoSlashes'

export default function extractProductPage() {
  const title = document.querySelector('h1')?.textContent
  const h3 = document.querySelector('h3')?.textContent
  const tables = [...document.querySelectorAll('table')]
  const currentUrl = window.location.href
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
  else if (tables.length > 1) {
    const productDetailTable = tables.find(table =>
      table.className.includes('ProductDetail'),
    )
    if (!productDetailTable) {
      console.log('ProductDetail table not found- using last table on page')
      pageObj.itemFeatures = extractTable(tables[tables.length - 1])
    }
    else {
      pageObj.itemFeatures = extractTable(productDetailTable)
    }
  }
  pageObj.mcMasterId = getBetweenLastTwoSlashes(currentUrl)

  return pageObj
}
