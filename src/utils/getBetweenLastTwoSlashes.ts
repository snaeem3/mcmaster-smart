export default function getBetweenLastTwoSlashes(str: string) {
  const lastSlash = str.lastIndexOf('/')
  const secondLastSlash = str.lastIndexOf('/', lastSlash - 1)
  return str.substring(secondLastSlash + 1, lastSlash)
}
