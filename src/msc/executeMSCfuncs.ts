import stringSimilarity from 'string-similarity-js'
import waitForTabToLoad from '../utils/waitForTabToLoad'
import flattenRecord from '../flattenRecord'
import type { MSCItem } from './MSCItem'
import {
  preprocessCategoryHeader,
  preprocessCategoryOption,
} from './preprocessMSC'
import type ExecuteMSCSettings from './settings'
import { defaultSettings } from './settings'
import type { McMasterItem } from '~/Item'

interface FeatureMatch {
  mcMasterName: string
  mcMasterValue: string
  MSCName: string
  similarity: number
}

export default async function executeMSCfuncs(
  url: string,
  mcmasterItem?: Partial<McMasterItem>,
  // type: string = 'popup',
  // type: Windows.CreateType = 'popup',
  // DEBUG: boolean = false,
  settings: ExecuteMSCSettings = defaultSettings,
) {
  console.log('Hello from executeMSCfuncs')
  const window = await browser.windows.create({
    url,
    // type,
  })

  try {
    if (!window.id) {
      throw new Error('Window ID is undefined.')
    }

    const tabs = await browser.tabs.query({ windowId: window.id })
    const tab = tabs[0]

    if (!tab || !tab.id) {
      throw new Error('Tab or Tab ID is undefined.')
    }

    if (settings.printTabInfo) {
      console.log('hopeful msc tab: ', tab)
      console.log('tab.id: ', tab.id)
    }
    await waitForTabToLoad(tab.id)

    // Handle 0 results found page
    let hasResults = true
    try {
      hasResults = await browser.tabs.sendMessage(tab.id, {
        type: 'HAS_RESULTS',
      })
    }
    catch (error) {
      console.error('Error sending "HAS_RESULTS" message: ', error)
    }
    if (!hasResults) {
      console.log('0 results found')
      await browser.windows.remove(window.id)
      return []
    }

    let mscItems: Partial<MSCItem>[] = []

    // Handle search query directly linking to product page
    let isProductPage = false
    try {
      isProductPage = await browser.tabs.sendMessage(tab.id, {
        type: 'IS_PRODUCT_PAGE',
      })
    }
    catch (error) {
      console.error('Error sending "IS_PRODUCT_PAGE" message: ', error)
    }
    if (isProductPage) {
      try {
        const mscItem = await browser.tabs.sendMessage(tab.id, {
          type: 'EXTRACT_PRODUCT',
        }) as MSCItem
        await browser.windows.remove(window.id)
        mscItems.push(mscItem)
        return mscItems
      }
      catch (error) {
        console.error('Error sending "EXTRACT_PRODUCT" message: ', error)
      }
    }

    // #region Side Bar Filtering
    let accordionHeaders: string[] = []
    try {
      accordionHeaders = await browser.tabs.sendMessage(tab.id, {
        type: 'HEADERS',
        otherData: '---testing other data----',
      })
    }
    catch (error) {
      console.error('Error sending HEADERS: ', error)
    }
    if (settings.printAccordionHeaders)
      console.log('accordionHeaders: ', accordionHeaders)

    const flatMcMasterFeatures = mcmasterItem?.itemFeatures
      ? flattenRecord(mcmasterItem?.itemFeatures)
      : {}
    let matches: FeatureMatch[] = []

    if (accordionHeaders && accordionHeaders.length > 0) {
      matches = getFeatureMatches(
        accordionHeaders.filter(
          (header): header is string => header !== undefined,
        ),
        flatMcMasterFeatures,
        settings.featureMatchThreshhold,
      )

      if (settings.printFeatureMatches) {
        console.log(
          `matches between flatMcMasterFeatures and MSC accordionHeaders: `,
          matches,
        )
      }

      // for each match, go through the MSC page and view the available checkbox options
      for (const match of matches) {
        if (settings.printFeatureMatches) {
          console.log('match: ', match)
          console.log(
            `flatMcMasterFeatures['${match.mcMasterName}']: `,
            flatMcMasterFeatures[match.mcMasterName],
          )
        }
        let categoryOptions: string[] = []
        try {
          categoryOptions = await browser.tabs.sendMessage(tab.id, {
            type: 'CATEGORY_OPTIONS',
            featureCategoryName: match.MSCName,
          })
        }
        catch (error) {
          console.error('Error sending CATEGORY_OPTIONS: ', error)
        }
        if (settings.printCategoryOptions)
          console.log(`${match.MSCName} categoryOptions: `, categoryOptions)
        // Check if any option values match the featureValue
        let optionsToSelect: string[] = []

        if (categoryOptions) {
          optionsToSelect = categoryOptions
            .filter((option) => {
              const normalizedOption = preprocessCategoryOption(
                option,
                match.MSCName,
              )
              const optionSimilarity = stringSimilarity(
                normalizedOption,
                match.mcMasterValue,
              )
              if (settings.printFeatureSimilarityScores) {
                console.log(
                  `${option} -> ${normalizedOption} vs. ${match.mcMasterValue} | ${optionSimilarity}`,
                )
              }
              return optionSimilarity > settings.optionSimilarityThreshold
            })
            // Sort the options by similarity score
            .sort(
              (a, b) =>
                stringSimilarity(b, match.mcMasterValue)
                - stringSimilarity(a, match.mcMasterValue),
            )
        }
        if (settings.printOptionsToSelect)
          console.log('optionsToSelect: ', optionsToSelect)

        // if a checkbox matches the item feature, click it
        let appliedFilters: string[] = []
        if (optionsToSelect.length > 0) {
          try {
            appliedFilters = await browser.tabs.sendMessage(tab.id, {
              type: 'APPLY_FILTERS',
              featureCategoryName: match.MSCName,
              optionsToSelect: [optionsToSelect[0]],
            })
            if (appliedFilters.length > 0)
              await waitForTabToLoad(tab.id)
          }
          catch (error) {
            console.error('Error sending APPLY_FILTERS: ', error)
          }
        }
        if (settings.printAppliedFilters)
          console.log(`${match.MSCName} appliedFilters: `, appliedFilters)
      }
    }
    // #endregion

    // #region Search Result Extraction
    try {
      mscItems = await browser.tabs.sendMessage(tab.id, {
        type: 'EXTRACT_SEARCH_RESULTS',
      })
    }
    catch (error) {
      console.error('Error sending EXTRACT_SEARCH_RESULTS: ', error)
    }
    if (settings.printMSCItems)
      console.log(`${mscItems.length} mscItems final: `, mscItems)
    // #endregion

    if (settings.closeWindows)
      await browser.windows.remove(window.id)

    return mscItems
  }
  catch (error) {
    console.error('Error in executeScriptOnWindow: ', error)
  }
}

// #region Helper Functions
function getFeatureMatches(
  categoryHeaders: string[],
  flatFeatures: Record<string, string>,
  THRESHOLD = defaultSettings.featureMatchThreshhold,
  caseInsensitive: boolean = true,
  DEBUG = false,
) {
  const mcmasterFeatures = Object.keys(flatFeatures)
  const matchingFeatures: FeatureMatch[] = Array.from({ length: mcmasterFeatures.length })
  for (const categoryHeader of categoryHeaders) {
    // Check if any McMaster features match the current MSC feature name
    const likelyFeatures: FeatureMatch[] = []
    for (const [key, value] of Object.entries(flatFeatures)) {
      const adjustedKey = caseInsensitive ? key.toLowerCase() : key
      let adjustedCategoryHeader = preprocessCategoryHeader(categoryHeader)
      adjustedCategoryHeader = caseInsensitive
        ? adjustedCategoryHeader.toLowerCase()
        : adjustedCategoryHeader

      const score = stringSimilarity(adjustedKey, adjustedCategoryHeader)
      if (DEBUG && score > 0) {
        console.log(
          `${categoryHeader} --> ${adjustedCategoryHeader} vs. ${key} --> ${adjustedKey} | score: ${score}`,
        )
      }
      if (score > THRESHOLD) {
        likelyFeatures.push({
          mcMasterName: key,
          mcMasterValue: value,
          MSCName: categoryHeader,
          similarity: score,
        })
      }
    }

    // Push the most likely feature into the final array at the original index
    if (likelyFeatures.length > 0) {
      const featureToAdd = likelyFeatures.sort(
        (a, b) => b.similarity - a.similarity,
      )[0]
      const index = mcmasterFeatures.indexOf(featureToAdd.mcMasterName)
      // Only add the feature match if it's empty, ensures no overriding
      // TODO - override the existing match if it is better?
      if (!matchingFeatures[index])
        matchingFeatures[index] = featureToAdd
    }
  }
  // Filter out empty/non-matches
  return matchingFeatures.filter(Boolean)
}
