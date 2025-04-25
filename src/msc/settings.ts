export default interface ExecuteMSCSettings {
  closeWindows: boolean
  optionSimilarityThreshold: number
  featureMatchThreshhold: number
  bestMatchingProductThreshold: number
  printTabInfo: boolean
  printAccordionHeaders: boolean
  printFeatureSimilarityScores: boolean
  printOptionsToSelect: boolean
  printAppliedFilters: boolean
  printFeatureMatches: boolean
  printCategoryOptions: boolean
  printMSCItems: boolean
}

export const defaultSettings: ExecuteMSCSettings = {
  closeWindows: true,
  optionSimilarityThreshold: 0.75,
  featureMatchThreshhold: 0.9,
  bestMatchingProductThreshold: 0.1,
  printTabInfo: false,
  printAccordionHeaders: false,
  printFeatureSimilarityScores: false,
  printOptionsToSelect: false,
  printAppliedFilters: false,
  printFeatureMatches: false,
  printCategoryOptions: false,
  printMSCItems: false,
}

// export default class MSCSettings implements ExecuteMSCSettings {
//   closeWindow: boolean = false
//   age: number = 0

//   constructor(closeWindow?: boolean, age?: number) {
//     this.closeWindow = closeWindow ?? this.closeWindow
//     this.age = age ?? this.age
//   }
// }
