import type { CategoryId } from '../types'

/**
 * Shared caption/hashtag classification helpers.
 *
 * Used by every provider that receives raw scraped rows (RapidAPI, the
 * serverless Facebook scrape functions) so all data sources map into the
 * same ten categories with identical behavior.
 */
export const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  comedy: ['funny', 'comedy', 'meme', 'lol', 'humor', 'laugh', 'joke', 'skit', 'prank', 'parody'],
  tech: ['tech', 'coding', 'programming', 'developer', 'ai', 'software', 'startup', 'gadget', 'computer', 'app'],
  fitness: ['fitness', 'gym', 'workout', 'exercise', 'health', 'gains', 'muscle', 'yoga', 'crossfit', 'training'],
  food: ['food', 'recipe', 'cooking', 'chef', 'foodie', 'baking', 'meal', 'kitchen', 'restaurant', 'delicious'],
  fashion: ['fashion', 'style', 'outfit', 'ootd', 'beauty', 'makeup', 'clothing', 'trend', 'model', 'designer'],
  travel: ['travel', 'wanderlust', 'vacation', 'explore', 'adventure', 'trip', 'destination', 'tourism', 'backpack', 'beach'],
  gaming: ['gaming', 'gamer', 'game', 'esports', 'twitch', 'streamer', 'playstation', 'xbox', 'nintendo', 'fortnite'],
  finance: ['finance', 'money', 'investing', 'stock', 'crypto', 'bitcoin', 'wealth', 'trading', 'budget', 'savings'],
  music: ['music', 'song', 'singer', 'rapper', 'dj', 'hiphop', 'concert', 'guitar', 'beats', 'album'],
  education: ['education', 'learn', 'study', 'school', 'teacher', 'student', 'science', 'math', 'knowledge', 'tutorial'],
}

/**
 * Detect category from caption text and hashtags.
 * Returns the category with the highest keyword hit-count, falling back to 'comedy'.
 */
export function detectCategory(caption: string, hashtags: string[]): CategoryId {
  const blob = `${caption} ${hashtags.join(' ')}`.toLowerCase()

  let bestCategory: CategoryId = 'comedy'
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryId, string[]][]) {
    const score = keywords.reduce((acc, kw) => acc + (blob.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }
  return bestCategory
}

/** Extract hashtags from a caption string (without the leading `#`). */
export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\w\u00C0-\u024F]+/g)
  return matches ? matches.map((h) => h.slice(1).toLowerCase()) : []
}

/**
 * Derive a plausible first-sentence "hook" from a caption.
 * Returns up to the first sentence or the first 100 chars, whichever is shorter.
 */
export function extractHook(caption: string): string {
  if (!caption) return ''
  const firstLine = caption.split('\n')[0]
  const firstSentence = firstLine.split(/[.!?]/)[0]
  return firstSentence.length > 100 ? `${firstSentence.slice(0, 97)}...` : firstSentence
}
