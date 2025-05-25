import { expect, it } from 'vitest'
import isProductPage from './isProductPage'

it('returns true on basic mcmaster product page', () => {
  expect(isProductPage('https://www.https://www.mcmaster.com/7568K82/')).toBeTruthy()
})

it('returns true on basic mcmaster product page, no trailing slash', () => {
  expect(isProductPage('https://www.https://www.mcmaster.com/7568K82')).toBeTruthy()
})

it('returns false on home page', () => {
  expect(isProductPage('https://www.https://www.mcmaster.com')).toBeFalsy()
})

it('returns false on catalog intermediate page', () => {
  expect(isProductPage('https://www.mcmaster.com/products/nuts/locknuts-2~/mil-spec-nylon-insert-locknuts-1~~/')).toBeFalsy()
})

it('returns true on product-subproduct', () => {
  expect(isProductPage('https://www.mcmaster.com/9273K5-9273K507/')).toBeTruthy()
})

it('returns false on terms and conditions page', () => {
  expect(isProductPage('https://www.mcmaster.com/termsandconditions/')).toBeFalsy()
})

it('returns false on not a mcmaster-carr url', () => {
  expect(isProductPage('https://www.mscdirect.com/product/details/67155408')).toBeFalsy()
})
