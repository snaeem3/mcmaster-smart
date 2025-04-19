import { expect, it } from 'vitest'
import {
  preprocessCategoryHeader,
  preprocessCategoryOption,
} from './preprocessMSC'

it('converts "Bearing Number" to "Bearing Trade Number"', () => {
  expect(preprocessCategoryHeader('Bearing Number')).toBe(
    'Bearing Trade Number',
  )
})

it('converts "Inside Diameter (Decimal Inch)" to "ID"', () => {
  expect(preprocessCategoryHeader('Inside Diameter (Decimal Inch)')).toBe('ID')
})

it('converts "Outside Diameter (Decimal Inch)" to "OD"', () => {
  expect(preprocessCategoryHeader('Outside Diameter (Decimal Inch)')).toBe(
    'OD',
  )
})

it('converts "Overall Length (Inch)" to "Length"', () => {
  expect(preprocessCategoryHeader('Overall Length (Inch)')).toBe('Length')
})

it('removes a hyphen from a fraction', () => {
  expect(preprocessCategoryOption('1-1/2', 'Length (Inch)')).toBe('1 1/2"')
})

it('thread Size conversion 1/4-20', () => {
  expect(preprocessCategoryOption('1/4-20', 'Thread Size (Inch)')).toBe(
    '1/4"-20',
  )
})

it('thread Size conversion 1-1/4-12', () => {
  expect(preprocessCategoryOption('1-1/4-12', 'Thread Size (Inch)')).toBe(
    '1 1/4"-12',
  )
})

it('thread Size with no unit given, 2 hyphens (Inch)', () => {
  expect(preprocessCategoryOption('1-3/8-12')).toBe('1 3/8"-12')
})

it('thread Size with no unit given, 1 hyphen (Inch)', () => {
  expect(preprocessCategoryOption('1/4-12')).toBe('1/4"-12')
})

it('6-32 Thread size', () => {
  expect(preprocessCategoryOption('#6-32', 'Thread Size (Inch)')).toBe('#6-32')
})

it('1-8 Thread size', () => {
  expect(preprocessCategoryOption('1-8', 'Thread Size (Inch)')).toBe('1"-8')
})

it('thread Size with no unit given (mm)', () => {
  expect(preprocessCategoryOption('M8')).toBe('M8')
})

it('1/4 - 20 Thread size (unusual spacing)', () => {
  expect(preprocessCategoryOption('1/4 - 20')).toBe('1/4"-20')
})

it('hyphen not removed if there are no numbers', () => {
  expect(preprocessCategoryOption('Flip-Flop')).toBe('Flip-Flop')
})

it('includes " for Overall Length (Inch)', () => {
  expect(preprocessCategoryOption('1', 'Overall Length (Inch)')).toBe('1"')
})
