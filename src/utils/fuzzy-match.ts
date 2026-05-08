/**
 * Returns whether `text` or `keywords` matches a user-typed `search` query.
 *
 * Matching is intentionally order-preserving: this helper is used only to
 * decide visibility, not ranking.
 */
export function isFuzzyMatch(text: string, search: string, keywords?: string[]): boolean {
  if (!search) {
    return true
  }

  const needle = search.toLowerCase().trim()

  if (!needle) {
    return true
  }

  if (text && matchesOne(text.toLowerCase(), needle)) {
    return true
  }

  if (keywords && keywords.length > 0) {
    for (const kw of keywords) {
      if (kw && matchesOne(kw.toLowerCase(), needle)) {
        return true
      }
    }
  }

  return false
}

function matchesOne(haystack: string, needle: string): boolean {
  if (!haystack) {
    return false
  }
  if (haystack === needle) {
    return true
  }
  if (haystack.startsWith(needle)) {
    return true
  }
  if (hasWordBoundaryMatch(haystack, needle)) {
    return true
  }
  if (haystack.includes(needle)) {
    return true
  }
  return hasFuzzySubsequenceMatch(haystack, needle)
}

function hasWordBoundaryMatch(haystack: string, needle: string): boolean {
  let from = 0
  while (from <= haystack.length) {
    const idx = haystack.indexOf(needle, from)
    if (idx === -1) {
      return false
    }
    if (idx === 0 || /\W/.test(haystack[idx - 1])) {
      return true
    }
    from = idx + 1
  }
  return false
}

function hasFuzzySubsequenceMatch(haystack: string, needle: string): boolean {
  let ni = 0

  for (let hi = 0; hi < haystack.length && ni < needle.length; hi++) {
    if (haystack[hi] === needle[ni]) {
      ni++
    }
  }

  return ni >= needle.length
}
