const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || 'n4lKrr2zZPszjxVKnVTvZawjHkruCjId'

export async function searchGif(query: string): Promise<string | null> {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&rating=pg-13`
    const res = await fetch(url)
    const data = await res.json()
    if (data.data && data.data.length > 0) {
      return data.data[0].images.fixed_height.url
    }
    return null
  } catch {
    return null
  }
}

export function extractGifTag(text: string): { cleanText: string; gifQuery: string | null } {
  const gifRegex = /\[GIF:\s*(.+?)\]/i
  const match = text.match(gifRegex)
  if (match) {
    return {
      cleanText: text.replace(gifRegex, '').trim(),
      gifQuery: match[1].trim(),
    }
  }
  return { cleanText: text, gifQuery: null }
}
