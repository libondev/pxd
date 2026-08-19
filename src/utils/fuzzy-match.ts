/**
 * Returns whether `text` or `keywords` matches a user-typed `search` query.
 *
 * Matching is intentionally order-preserving. Use `getFuzzyMatchScore` when
 * matching results need to be ranked.
 */
const whitespacePattern = /\s/
const whitespaceReplacePattern = /\s+/g

interface PreparedSearch {
  needle: string
  compactNeedle: string
}

let cachedSearch: string | null = null
let cachedPreparedSearch: PreparedSearch | null = null

export function isFuzzyMatch(text: string, search: string, keywords?: string[]): boolean {
  if (!search) {
    return true
  }

  const { needle, compactNeedle } = prepareSearch(search)

  if (!needle) {
    return true
  }

  if (text && matchesOne(text.toLowerCase(), needle, compactNeedle)) {
    return true
  }

  if (keywords && keywords.length > 0) {
    for (const kw of keywords) {
      if (kw && matchesOne(kw.toLowerCase(), needle, compactNeedle)) {
        return true
      }
    }
  }

  return false
}

export function getFuzzyMatchScore(text: string, search: string, keywords?: string[]): number {
  if (!search) {
    return 0
  }

  const { needle, compactNeedle } = prepareSearch(search)

  if (!needle) {
    return 0
  }

  let score = getMatchScore(text.toLowerCase(), needle, compactNeedle)

  if (score === 1000) {
    return score
  }

  if (keywords && keywords.length > 0) {
    for (const keyword of keywords) {
      score = Math.max(score, getMatchScore(keyword.toLowerCase(), needle, compactNeedle))

      if (score === 1000) {
        return score
      }
    }
  }

  return score
}

function getMatchScore(haystack: string, needle: string, compactNeedle: string): number {
  if (!haystack) {
    return 0
  }
  if (haystack === needle) {
    return 1000
  }

  const contiguousIndex = haystack.indexOf(needle)
  if (contiguousIndex !== -1) {
    return getContiguousMatchScore(haystack, needle, contiguousIndex)
  }

  const subsequence = getSubsequenceMatch(haystack, needle)
  if (subsequence) {
    return getSubsequenceMatchScore(haystack, needle, subsequence)
  }

  // ignore whitespace try again
  const hasWhitespace = whitespacePattern.test(haystack)
  if (compactNeedle !== needle || hasWhitespace) {
    const compactHaystack = hasWhitespace
      ? haystack.replace(whitespaceReplacePattern, '')
      : haystack

    if (compactHaystack !== haystack || compactNeedle !== needle) {
      return getMatchScore(compactHaystack, compactNeedle, compactNeedle)
    }
  }

  return 0
}

function matchesOne(haystack: string, needle: string, compactNeedle: string): boolean {
  if (!haystack) {
    return false
  }
  if (haystack === needle) {
    return true
  }
  if (haystack.startsWith(needle)) {
    return true
  }
  if (haystack.includes(needle)) {
    return true
  }
  if (hasFuzzySubsequenceMatch(haystack, needle)) {
    return true
  }

  const hasWhitespace = whitespacePattern.test(haystack)
  if (compactNeedle !== needle || hasWhitespace) {
    const compactHaystack = hasWhitespace
      ? haystack.replace(whitespaceReplacePattern, '')
      : haystack

    if (compactHaystack !== haystack || compactNeedle !== needle) {
      return matchesOne(compactHaystack, compactNeedle, compactNeedle)
    }
  }

  return false
}

function prepareSearch(search: string): PreparedSearch {
  if (search === cachedSearch && cachedPreparedSearch) {
    return cachedPreparedSearch
  }

  const needle = search.toLowerCase().trim()
  const preparedSearch = {
    needle,
    compactNeedle: whitespacePattern.test(needle)
      ? needle.replace(whitespaceReplacePattern, '')
      : needle,
  }

  cachedSearch = search
  cachedPreparedSearch = preparedSearch

  return preparedSearch
}

function getContiguousMatchScore(haystack: string, needle: string, index: number): number {
  const boundaryBonus = index === 0 || /\W/.test(haystack[index - 1]) ? 30 : 0
  const positionBonus = ((haystack.length - index) / haystack.length) * 20

  return 700 + boundaryBonus + getLengthScore(haystack, needle) + positionBonus
}

function getLengthScore(haystack: string, needle: string): number {
  return (needle.length / haystack.length) * 100
}

function hasFuzzySubsequenceMatch(haystack: string, needle: string): boolean {
  let ni = 0

  if (needle.length > haystack.length) {
    return false
  }

  for (let hi = 0; hi < haystack.length && ni < needle.length; hi++) {
    if (haystack[hi] === needle[ni]) {
      ni++
    }
  }

  return ni >= needle.length
}

function getSubsequenceMatchScore(
  haystack: string,
  needle: string,
  match: { firstIndex: number; lastIndex: number; longestRun: number },
): number {
  const span = match.lastIndex - match.firstIndex + 1
  const gapPenalty = span - needle.length
  const positionBonus = ((haystack.length - match.firstIndex) / haystack.length) * 20
  const continuityBonus = (match.longestRun / needle.length) * 100

  return 200 + continuityBonus + getLengthScore(haystack, needle) + positionBonus - gapPenalty * 5
}

function getSubsequenceMatch(
  haystack: string,
  needle: string,
): { firstIndex: number; lastIndex: number; longestRun: number } | null {
  if (needle.length > haystack.length) {
    return null
  }

  let needleIndex = 0
  let firstIndex = -1
  let lastIndex = -1
  let currentRun = 0
  let longestRun = 0

  for (let haystackIndex = 0; haystackIndex < haystack.length; haystackIndex++) {
    if (haystack[haystackIndex] !== needle[needleIndex]) {
      currentRun = 0
      continue
    }

    if (firstIndex === -1) {
      firstIndex = haystackIndex
    }

    lastIndex = haystackIndex
    needleIndex++
    currentRun++
    longestRun = Math.max(longestRun, currentRun)

    if (needleIndex === needle.length) {
      return { firstIndex, lastIndex, longestRun }
    }
  }

  return null
}
