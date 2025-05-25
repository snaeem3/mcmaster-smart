export default function isProductPage(url: string = window.location.href) {
  // Normalize URL (remove double https:// if present)
  url = url.replace('https://www.https://www.', 'https://www.')

  if (!url.includes('mcmaster.com'))
    return false

  // Remove query and hash
  url = url.split('?')[0].split('#')[0]

  // Remove trailing slash for consistency
  url = url.replace(/\/+$/, '')

  // Extract the pathname
  let pathname = ''
  try {
    pathname = new URL(url).pathname
  }
  catch {
    // fallback: try to extract after domain
    const match = url.match(/mcmaster\.com(\/.*)?$/)
    pathname = match ? match[1] || '' : ''
  }

  // Remove leading slash
  pathname = pathname.replace(/^\/+/, '')

  // Product pages are typically a single part number or partnumber-partnumber, e.g. 7568K82 or 9273K5-9273K507
  // Should not match catalog, terms, or other named pages
  // Should not match empty path (homepage)
  if (!pathname)
    return false

  // Exclude known non-product paths
  const nonProductPatterns = [
    /^products\//,
    /^termsandconditions/,
    /^aboutus/,
    /^contactus/,
    /^customer-service/,
    /^static\//,
    /^search\//,
    /^help\//,
    /^feedback/,
    /^sitemap/,
    /^order-history/,
    /^cart/,
    /^account/,
    /^login/,
    /^register/,
    /^checkout/,
  ]
  if (nonProductPatterns.some(re => re.test(pathname)))
    return false

  // Product page: must be a part number or partnumber-partnumber, optionally with a trailing slash
  // e.g. 7568K82 or 9273K5-9273K507
  if (/^\d+[A-Z]\d+(?:-(?:\d+[A-Z]\d+|\d{2,}))?$/.test(pathname))
    return true

  return false
}
