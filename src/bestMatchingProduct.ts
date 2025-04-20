import { stringSimilarity } from 'string-similarity-js'
import type { McMasterItem } from './Item'
import type { MSCItem } from './msc/MSCItem'

export default function getBestMatchingProduct(
  mcmasterProd: Partial<McMasterItem>,
  mscProds: Partial<MSCItem>[],
  minScore = 0.5,
) {
  if (mscProds.length <= 0)
    return { error: `${mscProds.length} products provided` }
  const scores = mscProds.map(mscProd => ({
    product: mscProd,
    score: calculateSimilarityScore(mcmasterProd, mscProd),
  }))
  console.log('scores: ', scores)

  const bestMatch = scores.reduce((best, current) =>
    current.score > best.score ? current : best,
  )

  return bestMatch.score < minScore
    ? {
        error: `No matching product found with a score above the minimum threshold (${minScore}). Highest Score: ${bestMatch.score}`,
        score: bestMatch.score,
      }
    : { bestProduct: bestMatch.product, score: bestMatch.score }
}

function calculateSimilarityScore(
  mcmasterProd: Partial<McMasterItem>,
  mscProd: Partial<MSCItem>,
): number {
  if (
    !mcmasterProd.itemFeatures
    || Object.keys(mcmasterProd.itemFeatures).length === 0
  ) {
    throw new Error(
      'McMasterItem must have itemFeatures to calculate similarity.',
    )
  }

  const mcmasterText = extractFeaturesText(mcmasterProd.itemFeatures)
  const mscText = mscProd.description || ''

  return stringSimilarity(mcmasterText, mscText)
  //   return calculateTextSimilarity(mcmasterText, mscText);
}

function extractFeaturesText(
  itemFeatures: Record<string, string | Record<string, string>>,
): string {
  return Object.values(itemFeatures)
    .map(value =>
      typeof value === 'string' ? value : Object.values(value).join(' '),
    )
    .join(' ')
}
